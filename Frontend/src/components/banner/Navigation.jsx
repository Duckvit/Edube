import React, { memo, useEffect, useState } from "react";
import { Button, Dropdown, Layout, Menu, Avatar, Space } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import icons from "../../utils/icon";
import path from "../../utils/path";
import Swal from "sweetalert2";
import Loading from "../common/Loading";
import { Brain } from "lucide-react";
import {
  CaretDownOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../../store/useUserStore";

const Navigation = ({ children, menuNavbar }) => {
  const { Header, Sider } = Layout;
  const { IoIosNotifications } = icons;
  const [notificationCount, setNotificationCount] = useState(3);
  const [loading, setLoading] = useState(false);
  const { resetUserStore, role, current, userData } = useUserStore();
  const [collapsed, setCollapsed] = useState(false);
  const { Content } = Layout;
  const location = useLocation();
  const [searchFor, setSearchFor] = useState("");

  // useEffect(() => {
  //   const subPath = location.pathname.split('/');

  //   if (
  //     subPath[subPath.length - 1] === 'student' ||
  //     subPath.push() === path.STUDENT_GROUP ||
  //     subPath.includes('profile-user')
  //   )
  //     setSearchFor('');
  //   else setSearchFor(subPath.pop());
  // }, [location.pathname]);

  const siderStyle = {
    overflow: "auto",
    height: "100vh",
    position: "sticky",
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: "thin",
    scrollbarGutter: "stable",
  };

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  const handleLogOut = () => {
    // Hiển thị hộp thoại xác nhận đăng xuất
    Swal.fire({
      title: "Are you sure?", // Tiêu đề của hộp thoại
      text: "Log Out Your Account!", // Nội dung chính của hộp thoại
      icon: "warning", // Hiển thị biểu tượng cảnh báo
      showCancelButton: true, // Hiển thị nút hủy
      confirmButtonText: "Yes, Log Out", // Văn bản nút xác nhận
      cancelButtonText: "No, cancel.", // Văn bản nút hủy
      reverseButtons: true, // Đảo ngược vị trí các nút
    }).then((result) => {
      // Kiểm tra kết quả khi người dùng nhấn vào nút
      if (result.isConfirmed) {
        // Nếu người dùng xác nhận đăng xuất
        resetUserStore(); // Gọi hàm reset trạng thái người dùng (đăng xuất)

        // Hoặc hiển thị một thông báo thành công khác với SweetAlert2 (nếu muốn)
        Swal.fire({
          title: "Logged Out!",
          text: "You have successfully logged out.",
          icon: "success",
          timer: 2000, // Đóng sau 2 giây
          showConfirmButton: false, // Ẩn nút OK
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Nếu người dùng hủy
        Swal.fire({
          title: "Cancelled",
          text: "Cancelled Log Out!",
          icon: "error",
          timer: 2000, // Đóng sau 2 giây
          showConfirmButton: false, // Ẩn nút OK
        });
      }
    });
  };

  const items = [
    {
      key: "account",
      label: "My Account",
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "profile",
      icon: <UserOutlined />,
      label: (
        <NavLink to={path.USER_PROFILE} className="text-white">
          View Profile
        </NavLink>
      ),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Log Out",
      onClick: handleLogOut,
    },
  ];

  return (
    <Layout className="bg-gray-300 flex w-3/5 h-screen ">
      {/* Vertical Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        // theme="dark"
        className="shadow-lg bg-gray-200 text-white"
        // width={250}
      >
        {/* Logo */}
        <div className="h-[8vh] flex items-center justify-center py-[1vh] bg-gray-200 ">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>

          {!collapsed && (
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Edube
            </span>
          )}
        </div>

        <Menu
          className="h-[92vh] w-full flex flex-col gap-1 text-white font-semibold overflow-auto"
          mode="inline"
          items={menuNavbar}
          theme="light"
        />
      </Sider>

      <Layout className="relative">
        {/* Top Header */}
        <Header
          style={{ backgroundColor: "#e5e7eb" }}
          // className="fixed top-0 left-[250px] right-0 h-[64px] flex items-center justify-between shadow-sm z-50"
          className="bg-gray-200 p-0 flex items-center !h-[8vh] justify-between"
        >
          {/* Collapse Button */}
          <Button
            type="text"
            size="20"
            onClick={() => setCollapsed(!collapsed)}
            icon={
              collapsed ? (
                <MenuUnfoldOutlined style={{ fontSize: 25 }} />
              ) : (
                <MenuFoldOutlined style={{ fontSize: 25 }} />
              )
            }
          />

          {/* User Menu */}
          <div className="flex gap-5 pr-[2rem] items-center">
            <div className="flex items-center gap-2 ">
              <Dropdown menu={{ items }} placement="bottomRight" arrow>
                {/* <Button type="text" className="flex items-center gap-2 h-auto">
                <Avatar size="small" icon={<UserOutlined />} />
                {!collapsed && <span>User</span>}
              </Button> */}
                <Space>
                  <Avatar
                    // src={userData?.user?.avatar}
                    icon={<UserOutlined />}
                    alt="avatar"
                    className="object-cover h-[6vh] w-[6vh] rounded-full cursor-pointer"
                  />
                  <CaretDownOutlined />
                </Space>
              </Dropdown>
            </div>
          </div>
        </Header>

        <Content className="p-2 overflow-auto h-[calc(100vh-8vh)] w-full">
          <div>
            {loading ? (
              <Loading /> // Hiển thị component loading
            ) : (
              children // Không cần dấu ngoặc nhọn ở đây
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default memo(Navigation);
