import React from 'react';
import { Outlet } from "react-router-dom";
import PublicNavigate from './PublicNavigate';
import PublicFooter from './PublicFooter';

export const PublicLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <PublicNavigate/>
      <main className="flex-1">
        <Outlet/>
      </main>
      <PublicFooter/>
    </div>
  )
}

export default PublicLayout;