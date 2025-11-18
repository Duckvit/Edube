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
  StarOutlined,
} from "@ant-design/icons";

export const menuNavbarItemsMentor = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: (
      <NavLink to={"/mentor"} className="text-white">
        Dashboard
      </NavLink>
    ),
    className: "text-white text-lg",
  },
  {
    key: "course",
    icon: <BookOutlined />,
    label: (
      <NavLink to={path.MENTOR_COURSE} className="text-white">
        Course
      </NavLink>
    ),
    className: "text-white text-lg",
  },
  {
    key: "Learner",
    icon: <UserOutlined />,
    label: (
      <NavLink to={path.MENTOR_LEARNER} className="text-white">
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
    label: "Users",
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
        key: "users-mentor",
        icon: <UserOutlined />,
        label: (
          <NavLink to={path.ADMIN_MENTOR_MANAGEMENT} className="text-white">
            Mentor
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
  {
    key: "review",
    icon: <StarOutlined />,
    label: (
      <NavLink to={path.ADMIN_REVIEW_MANAGEMENT} className="text-white">
        Review
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

export const menuNavbarItemsLearner = [
  {
    key: "dashboard",
    icon: <HomeOutlined />,
    label: (
      <NavLink to={"/learner"} className="text-white">
        Dashboard
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

export const roleForComponent = {
  ADMIN: path.PUBLIC_ADMIN,
  LEARNER: path.PUBLIC_LEARNER,
  MENTOR: path.PUBLIC_MENTOR,
};
