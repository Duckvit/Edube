import React, { useEffect } from "react";
import { Navigation } from "../../components";
import { menuNavbarItemsAdmin } from "../../utils/constant";
import { Outlet } from "react-router-dom";
import { Content } from "antd/es/layout/layout";

export const PublicAdmin = () => {
  return (
    <div className="w-full flex-wrap flex justify-end">
      <Navigation menuNavbar={menuNavbarItemsAdmin}>
        <Outlet />
      </Navigation>
    </div>
  );
};

export default PublicAdmin;
