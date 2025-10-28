import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from '../../store/useUserStore'
import { toast } from "react-toastify";
import { roleForComponent } from "../../utils/constant";
import { path } from "../../utils/path";
import { createMentor } from '../../apis/MentorServices';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setModal, resetUserStore } = useUserStore();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const role = queryParams.get("role");

    if (token && token !== "null") {
      // Lưu token + role
      const defaultRole = role || "USER";
      setModal(token, defaultRole, true);
      
      const normalizedRole = defaultRole?.toUpperCase();
      
      // Nếu role là USER hoặc rỗng, chuyển sang trang chọn role
      if (normalizedRole === "USER" || !role) {
        toast.info("Please select your role to continue");
        setTimeout(() => {
          navigate("/choose-role");
        }, 100);
      } else if (normalizedRole && roleForComponent[normalizedRole]) {
        // ✅ Nếu có role hợp lệ → điều hướng trực tiếp đến dashboard
        // toast.success("Login successful!");
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
    } else {
      resetUserStore();
      toast.error("Login failed!");
      setTimeout(() => {
        navigate("/");
      }, 100);
    }
  }, [location.search, navigate, setModal, resetUserStore]);

  return null; // không hiển thị gì
}
