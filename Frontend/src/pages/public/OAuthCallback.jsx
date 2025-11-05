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
  const { setModal, resetUserStore, setUserData } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
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
            
            // Navigate to learner dashboard
            if (roleForComponent["LEARNER"]) {
              setTimeout(() => {
                navigate("/" + roleForComponent["LEARNER"]);
              }, 500);
            } else {
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
        setTimeout(() => {
          navigate("/" + roleForComponent[normalizedRole]);
        }, 100);
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
  }, [location.search, navigate, setModal, resetUserStore, setUserData]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return null; // không hiển thị gì
}
