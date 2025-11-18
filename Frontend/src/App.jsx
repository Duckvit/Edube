import React, { useEffect, useMemo } from "react";
import { ToastContainer } from "react-toastify";
import { Navigate, Route, Routes } from "react-router-dom";
import { path } from "./utils/path";
import {
  ChangePass,
  ForgotPass,
  HomePage,
  OTPInput,
  PublicAdmin,
  PublicMentor,
  PublicLayout,
  PublicLearner,
  RoleSelectionPage,
  OAuthCallback,
} from "./pages";
import PrivateRoute from "./middlewares/PrivateRoute";
import {
  AdminHome,
  Chat,
  Course,
  CourseManagement,
  Dashboard,
  MentorManagement,
  LearnerDashboard,
  LearnerManagement,
  ReviewManagement,
  Report,
  Learner,
  CourseDetail,
  CoursePreview,
  UserProfile,
  CourseBuilder,
  UploadLesson,
  PaymentSuccess,
  PaymentFail,
} from "./components";
import { useUserStore } from "./store/useUserStore";
import { roleForComponent } from "./utils/constant";
import { getProfile } from "./apis/UserServices";
import { parseJwt } from "./utils/jwt";
import { logger } from "./utils/logger";

function App() {
  const { token, userData, setUserData, role, resetUserStore, hydrated } = useUserStore();
  
  // Đồng bộ token từ Zustand store vào localStorage (cho axios interceptor)
  useEffect(() => {
    if (!hydrated) return;
    
    if (token && token !== "null") {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token, hydrated]);

  // Chỉ reset store khi đã hydrate và token thực sự không tồn tại
  // KHÔNG reset nếu đang ở trang /login (OAuth callback)
  useEffect(() => {
    if (!hydrated || (token && token !== "null")) return;
    
    const isOAuthCallback = 
      window.location.pathname === "/login" && 
      window.location.search.includes("token=");
    
    if (!isOAuthCallback) {
      const localStorageToken = localStorage.getItem("token");
      if (!localStorageToken || localStorageToken === "null") {
        resetUserStore();
      }
    }
  }, [hydrated, token, resetUserStore]);

  // Fetch user profile when token is available but userData is not
  useEffect(() => {
    if (!token || userData) return;
    
    const fetchProfile = async () => {
      try {
        const decoded = parseJwt(token);
        if (decoded?.sub) {
          const profile = await getProfile(decoded.sub, token);
          if (profile?.user) {
            setUserData(profile.user);
          }
        }
      } catch (error) {
        logger.error("Error fetching profile:", error);
        // Don't show error toast here as it might be a temporary issue
      }
    };
    
    fetchProfile();
  }, [token, userData, setUserData]);

  // Memoize redirect path
  const redirectPath = useMemo(() => {
    return !token ? path.PUBLIC : roleForComponent[role] || path.PUBLIC;
  }, [token, role]);

  // Loading screen while waiting for hydration
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-400 animate-ping"></div>
          </div>
          <p className="text-gray-600 font-medium mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        limit={3}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route
          path="/"
          element={<Navigate to={redirectPath} replace />}
        />
        {/* Route cho trang public */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path={path.FORGOT_PASS} element={<ForgotPass />} />
          <Route path={path.OTP_INPUT} element={<OTPInput />} />
          <Route path={path.CHANGE_PASS} element={<ChangePass />} />
          <Route path={path.ROLE_SELECTION} element={<RoleSelectionPage />} />
          <Route path={path.OAuthCallback} element={<OAuthCallback />} />
        </Route>

        <Route
          // Route cho trang insctructor
          path={path.PUBLIC_MENTOR}
          element={
            <PrivateRoute role={role}>
              <PublicMentor />
            </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path={path.MENTOR_COURSE} element={<Course />} />
          <Route
            path={`${path.MENTOR_COURSE_BUILDER}/${path.MENTOR_UPLOAD_LESSON}`}
            element={<UploadLesson />}
          />
          <Route
            path={path.MENTOR_COURSE_BUILDER}
            element={<CourseBuilder />}
          />
          <Route path={path.MENTOR_LEARNER} element={<Learner />} />
          <Route path={path.USER_CHAT} element={<Chat />} />
          <Route path={path.USER_PROFILE} element={<UserProfile />} />
        </Route>
        <Route
          // Route cho trang admin
          path={path.PUBLIC_ADMIN}
          element={
            <PrivateRoute role={role}>
              <PublicAdmin />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route
            path={path.ADMIN_COURSE_MANAGEMENT}
            element={<CourseManagement />}
          />
          <Route
            path={`${path.ADMIN_COURSE_MANAGEMENT}/${path.USER_COURSE_DETAIL}`}
            element={<CourseDetail />}
          />
          <Route
            path={path.ADMIN_LEARNER_MANAGEMENT}
            element={<LearnerManagement />}
          />
          <Route
            path={path.ADMIN_MENTOR_MANAGEMENT}
            element={<MentorManagement />}
          />
          <Route
            path={path.ADMIN_REVIEW_MANAGEMENT}
            element={<ReviewManagement />}
          />
          <Route path={path.REPORT} element={<Report />} />
        </Route>
        <Route
          // Route cho trang learner
          path={path.PUBLIC_LEARNER}
          element={
            <PrivateRoute role={role}>
              <PublicLearner />
            </PrivateRoute>
          }
        >
          <Route index element={<LearnerDashboard />} />
          <Route path={path.USER_PROFILE} element={<UserProfile />} />
          <Route path={path.USER_COURSE_DETAIL} element={<CourseDetail />} />
          <Route path={path.USER_CHAT} element={<Chat />} />
          <Route
            path={path.LEARNER_COURSE_PREVIEW}
            element={<CoursePreview />}
          />
          <Route
            path={path.LEARNER_PAYMENT_SUCCESS}
            element={<PaymentSuccess />}
          />
          <Route path={path.LEARNER_PAYMENT_FAIL} element={<PaymentFail />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
