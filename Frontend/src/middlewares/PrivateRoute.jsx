import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import { toast } from 'react-toastify';

const PrivateRoute = ({ children, role }) => {
  const { isLoggedIn } = useUserStore();
  if (!isLoggedIn) {
    toast.warn('Please Login!!!');
    return <Navigate to="/" />;
  }

  if (!children.type.name.toUpperCase().includes(role.toUpperCase())) {
    return <Navigate to={'/'} />;
  }

  return children;
};

export default PrivateRoute;