import React, { useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-toastify";

const RedirectWithToast = ({ message, to, showToast = true }) => {
  const hasShownToast = useRef(false);
  
  React.useEffect(() => {
    // Chỉ hiển thị toast nếu showToast = true và chưa hiển thị
    // Không hiển thị khi đang navigate về trang public (logout)
    if (showToast && !hasShownToast.current) {
      toast.warn(message);
      hasShownToast.current = true;
    }
  }, [message, showToast]);

  return <Navigate to={to} replace />;
};

const PrivateRoute = ({ children, role }) => {
  const { isLoggedIn, role: userRole, hydrated, token } = useUserStore();
  const location = useLocation();
  
  // Chờ Zustand hydrate xong
  if (!hydrated) return null;

  // Nếu đã ở trang public, không cần redirect và không hiển thị toast
  const isPublicRoute = location.pathname === "/" || location.pathname === "/login";
  
  if (!isLoggedIn || !token) {
    // Nếu đã ở trang public (sau khi logout), không hiển thị toast
    const showToast = !isPublicRoute;
    return <RedirectWithToast message="Please Login!!!" to="/" showToast={showToast} />;
  }

  // 🔒 Check role dựa trên Zustand, không dùng tên component
  if (role && userRole?.toUpperCase() !== role.toUpperCase()) {
    toast.error("Unauthorized access!");
    return <RedirectWithToast message="Unauthorized access!" to="/" />;
  }

  return children;
};

export default PrivateRoute;
