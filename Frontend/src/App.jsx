import React, { useState, useEffect } from "react";
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

function App() {
  const [count, setCount] = useState(0);
  const { token, userData, setUserData, role, resetUserStore, hydrated } = useUserStore();
  
  // Đồng bộ token từ Zustand store vào localStorage (cho axios interceptor)
  useEffect(() => {
    if (hydrated) {
      if (token && token !== "null") {
        localStorage.setItem("token", token);
      } else {
        localStorage.removeItem("token");
      }
    }
  }, [token, hydrated]);

  // Chỉ reset store khi đã hydrate và token thực sự không tồn tại
  // KHÔNG reset nếu đang ở trang /login (OAuth callback)
  useEffect(() => {
    if (hydrated && (!token || token === "null")) {
      // Kiểm tra xem có phải đang ở trang OAuth callback không
      const isOAuthCallback = window.location.pathname === "/login" && window.location.search.includes("token=");
      
      if (!isOAuthCallback) {
        // Kiểm tra lại localStorage để đảm bảo không có token nào
        const localStorageToken = localStorage.getItem("token");
        if (!localStorageToken || localStorageToken === "null") {
          resetUserStore();
        }
      }
    }
  }, [hydrated, token, resetUserStore]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (token && !userData) {
        const decoded = parseJwt(token); // lấy username từ token nếu có
        if (decoded && decoded.sub) {
          try {
            const profile = await getProfile(decoded.sub, token);
            if (profile && profile.user) {
              setUserData(profile.user);
            }
          } catch (error) {
            console.error("Error fetching profile:", error);
            // Don't show error toast here as it might be a temporary issue
          }
        }
      }
    };
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, userData]);

  // Chờ hydration trước khi render routes để tránh redirect sai
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={1000} limit={3} />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={!token ? path.PUBLIC : roleForComponent[role]}
              replace
            />
          }
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
