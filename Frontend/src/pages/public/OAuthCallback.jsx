import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from '../../store/useUserStore'
import { toast } from "react-toastify";
import { roleForComponent } from "../../utils/constant";
import { path } from "../../utils/path";
import { createMentor } from '../../apis/MentorServices';
import { createLearner } from '../../apis/LearnerServices';
import { getProfile } from '../../apis/UserServices';
import { parseJwt } from '../../utils/jwt';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setModal, resetUserStore, setUserData, hydrated } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Đợi store hydrate xong trước khi xử lý OAuth callback
    if (!hydrated) {
      return;
    }

    const handleOAuthCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const token = queryParams.get("token");
      const role = queryParams.get("role");

      if (!token || token === "null") {
        resetUserStore();
        toast.error("Login failed!");
        setTimeout(() => {
          navigate("/");
        }, 100);
        return;
      }

      // Lưu token vào localStorage cho axios interceptor
      localStorage.setItem("token", token);

      // Lưu token + role
      const defaultRole = role || "USER";
      setModal(token, defaultRole, true);
      
      // Đợi một chút để đảm bảo Zustand store đã update state
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Verify token đã được set vào store
      const verifyToken = () => {
        const currentState = useUserStore.getState();
        return currentState.token === token && currentState.isLoggedIn === true;
      };
      
      // Retry nếu token chưa được set (tối đa 5 lần)
      let retryCount = 0;
      while (!verifyToken() && retryCount < 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
      }
      
      const normalizedRole = defaultRole?.toUpperCase();
      
      // Nếu role là USER hoặc rỗng, tự động tạo learner profile
      if (normalizedRole === "USER" || !role) {
        setIsProcessing(true);
        try {
          // Decode JWT token để lấy username
          const decoded = parseJwt(token);
          const username = decoded?.sub || queryParams.get("username") || queryParams.get("email");
          
          if (!username) {
            toast.warning("Unable to get user information. Please try again or contact support.");
            setIsProcessing(false);
            navigate("/choose-role");
            return;
          }

          // Lấy user profile để có user ID
          let userData = null;
          let userId = null;

          try {
            const profileRes = await getProfile(username, token);
            userData = profileRes?.user;
            userId = userData?.id;
          } catch (error) {
            console.error("Error getting profile:", error);
            // Nếu không lấy được profile, có thể thử với userId từ query params
            userId = queryParams.get("userId");
          }

          if (!userId) {
            toast.warning("Unable to get user ID. Please try again or contact support.");
            setIsProcessing(false);
            navigate("/choose-role");
            return;
          }

          // Tự động tạo learner profile với các giá trị mặc định
          const learnerPayload = {
            user: { id: userId },
            majorField: "General", // Giá trị mặc định
            educationLevel: "Other", // Giá trị mặc định
            learningPreferences: "General learning preferences", // Giá trị mặc định
          };

          const learnerResponse = await createLearner(learnerPayload);

          // Check HTTP status
          const learnerHttpStatus = learnerResponse?.status;
          const isLearnerSuccess =
            learnerHttpStatus === 200 || learnerHttpStatus === 201;

          if (isLearnerSuccess) {
            // Update role to LEARNER
            setModal(token, "LEARNER", true);
            
            // Load user profile if available
            if (userData) {
              setUserData(userData);
            } else if (username) {
              try {
                const profileRes = await getProfile(username, token);
                if (profileRes?.user) {
                  setUserData(profileRes.user);
                }
              } catch (error) {
                console.warn("Could not load user profile:", error);
              }
            }

            toast.success("🎉 Account created successfully! Welcome to Edube!");
            
            // Đợi một chút để đảm bảo store đã update role
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // Verify lại trước khi navigate
            const finalState = useUserStore.getState();
            if (finalState.token === token && finalState.isLoggedIn && finalState.role === "LEARNER") {
              // Navigate to learner dashboard
              if (roleForComponent["LEARNER"]) {
                navigate("/" + roleForComponent["LEARNER"]);
              } else {
                navigate("/");
              }
            } else {
              console.error("Failed to verify login state, redirecting to home");
              navigate("/");
            }
          } else {
            toast.error(
              learnerResponse?.data?.message ||
                "❌ Failed to create learner profile. Please try again."
            );
            navigate("/choose-role");
          }
        } catch (error) {
          console.error("Error creating learner profile:", error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "⚠️ Failed to create account. Please try again.";
          toast.error(errorMessage);
          navigate("/choose-role");
        } finally {
          setIsProcessing(false);
        }
      } else if (normalizedRole && roleForComponent[normalizedRole]) {
        // ✅ Nếu có role hợp lệ → điều hướng trực tiếp đến dashboard
        // Đợi một chút để đảm bảo store đã update token và role
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify token và isLoggedIn trước khi navigate
        const currentState = useUserStore.getState();
        if (currentState.token === token && currentState.isLoggedIn && currentState.role === normalizedRole) {
          navigate("/" + roleForComponent[normalizedRole]);
        } else {
          // Nếu vẫn chưa update, thử lại sau 200ms nữa
          setTimeout(() => {
            const retryState = useUserStore.getState();
            if (retryState.token === token && retryState.isLoggedIn && retryState.role === normalizedRole) {
              navigate("/" + roleForComponent[normalizedRole]);
            } else {
              console.error("Failed to set token in store, redirecting to home");
              navigate("/");
            }
          }, 200);
        }
      } else {
        console.log("Invalid role detected:", role, "Normalized:", normalizedRole);
        resetUserStore();
        toast.error("Invalid role detected");
        setTimeout(() => {
          navigate(path.PUBLIC);
        }, 100);
      }
    };

    handleOAuthCallback();
  }, [location.search, navigate, setModal, resetUserStore, setUserData, hydrated]);

  // Hiển thị loading nếu store chưa hydrate hoặc đang xử lý
  if (!hydrated || isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!hydrated ? "Loading..." : "Setting up your account..."}
          </p>
        </div>
      </div>
    );
  }

  return null; // không hiển thị gì
}
