import React from "react";
import { NavLink } from "react-router-dom";
import path from "./path";
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  MessageOutlined,
  TeamOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

export const menuNavbarItemsInstructor = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: (
      <NavLink to={"/instructor"} className="text-white">
        Dashboard
      </NavLink>
    ),
    className: "text-white text-lg",
  },
  {
    key: "course",
    icon: <BookOutlined />,
    label: (
      <NavLink to={path.INSTRUCTOR_COURSE} className="text-white">
        Course
      </NavLink>
    ),
    className: "text-white text-lg",
  },
  {
    key: "Learner",
    icon: <UserOutlined />,
    label: (
      <NavLink to={path.INSTRUCTOR_LEARNER} className="text-white">
        Learner
      </NavLink>
    ),
    className: "text-white text-lg",
  },
  {
    key: "chat",
    icon: <MessageOutlined />,
    label: (
      <NavLink to={path.USER_CHAT} className="text-white">
        Chat
      </NavLink>
    ),
    className: "text-white text-lg",
  },
];

export const menuNavbarItemsAdmin = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: (
      <NavLink to={"/admin"} className="text-white">
        Dashboard
      </NavLink>
    ),
    className: "text-white text-lg",
  },
  {
    key: "user-management",
    icon: <TeamOutlined />,
    className: "text-white text-lg",
    label: 'Users',
    children: [
      // Đây là các mục con của Users
      {
        key: "users-learner",
        icon: <UserOutlined />,
        label: (
          <NavLink to={path.ADMIN_LEARNER_MANAGEMENT} className="text-white">
            Learner
          </NavLink>
        ),
      },
      {
        key: "users-instructor",
        icon: <UserOutlined />,
        label: (
          <NavLink to={path.ADMIN_INSTRUCTOR_MANAGEMENT} className="text-white">
            Instructor
          </NavLink>
        ),
      },
    ],
  },
  {
    key: "course",
    icon: <BookOutlined />,
    label: (
      <NavLink to={path.ADMIN_COURSE_MANAGEMENT} className="text-white">
        Course
      </NavLink>
    ),
    className: "text-white text-lg",
  },
  // {
  //   key: "report",
  //   icon: <LineChartOutlined />,
  //   label: (
  //     <NavLink to={path.ADMIN_REPORT} className="text-white">
  //       Report
  //     </NavLink>
  //   ),
  //   className: "text-white text-lg",
  // },
];

export const roleForComponent = {
  ADMIN: path.PUBLIC_ADMIN,
  // LEARNER: path.PUBLIC_LEARNER,
  INSTRUCTOR: path.PUBLIC_INSTRUCTOR,
};
