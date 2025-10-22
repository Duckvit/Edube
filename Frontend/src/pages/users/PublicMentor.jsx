import React, { useEffect } from "react";
import { Navigation } from "../../components";
import { menuNavbarItemsMentor } from "../../utils/constant";
import { Outlet } from "react-router-dom";
import { Content } from "antd/es/layout/layout";

export const PublicMentor = () => {
  return (
    <div className="w-full flex-wrap flex justify-end">
      <Navigation menuNavbar={menuNavbarItemsMentor} showSidebar={true}>
        <Outlet />
      </Navigation>
    </div>
  );
};

export default PublicMentor;
