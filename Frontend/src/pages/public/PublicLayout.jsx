import React from 'react';
import { Outlet } from "react-router-dom";
import PublicNavigate from './PublicNavigate';
import PublicFooter from './PublicFooter';

export const PublicLayout = () => {
  return (
    <div className="w-full min-h-screen relative overflow-hidden">
      <PublicNavigate/>
      <Outlet/>
      <PublicFooter/>
    </div>
  )
}

export default PublicLayout;