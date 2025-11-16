import React from "react";
import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-toastify";

const RedirectWithToast = ({ message, to }) => {
  React.useEffect(() => {
    toast.warn(message);
  }, []);

  return <Navigate to={to} replace />;
};

const PrivateRoute = ({ children, role }) => {
  const { isLoggedIn, role: userRole, hydrated } = useUserStore();

  // Chờ Zustand hydrate xong
  if (!hydrated) return null; // hoặc <div>Loading...</div>

  if (!isLoggedIn) {
    return <RedirectWithToast message="Please Login!!!" to="/" />;
  }

  // 🔒 Check role dựa trên Zustand, không dùng tên component
  if (role && userRole?.toUpperCase() !== role.toUpperCase()) {
    toast.error("Unauthorized access!");
    return <RedirectWithToast message="Unauthorized access!" to="/" />;
  }

  return children;
};

export default PrivateRoute;
