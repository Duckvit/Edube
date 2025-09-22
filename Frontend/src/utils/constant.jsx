import React from 'react';
import { NavLink } from 'react-router-dom';
import path from './path';
import { HomeOutlined, BookOutlined, UserOutlined, MessageOutlined } from '@ant-design/icons'

export const menuNavbarItemsInstructor = [
  {
    key: 'dashboard',
    icon: <HomeOutlined/>,
    label: (
      <NavLink to={'/instructor'} className="text-white">
        Dashboard
      </NavLink>
    ),
    className: 'text-white text-lg'
  },
  {
    key: 'course',
    icon: <BookOutlined/>,
    label: (
      <NavLink to={path.COURSE} className="text-white">
        Course
      </NavLink>
    ),
    className: 'text-white text-lg'
  },
  {
    key: 'students',
    icon: <UserOutlined/>,
    label: (
      <NavLink to={path.STUDENT} className="text-white">
        Students
      </NavLink>
    ),
    className: 'text-white text-lg'
  },
  {
    key: 'chat',
    icon: <MessageOutlined/>,
    label: (
      <NavLink to={path.CHAT} className="text-white">
        Chat
      </NavLink>
    ),
    className: 'text-white text-lg'
  },
]

export const roleForComponent = {
  // ADMIN: path.PUBLIC_ADMIN,
  // LEARNER: path.PUBLIC_LEARNER,
  INSTRUCTOR: path.PUBLIC_INSTRUCTOR
};