import React, { useEffect } from "react";
import { Navigation } from "../../components";
import { menuNavbarItemsInstructor } from "../../utils/constant";
import { Outlet } from "react-router-dom";
import { Content } from "antd/es/layout/layout";

export const PublicInstructor = () => {
  return (
    <div className="w-full flex-wrap flex justify-end">
      <Navigation menuNavbar={menuNavbarItemsInstructor}>
        <Outlet />
      </Navigation>
    </div>
  );
};

export default PublicInstructor;
