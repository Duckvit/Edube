import React, { useEffect } from "react";
import { Navigation } from "../../components";
import { menuNavbarItemsInstructor } from "../../utils/constant";
import PublicFooter from "../public/PublicFooter";
import { Outlet } from "react-router-dom";

export const PublicLearner = () => {
  return (
    <div className="min-h-screen w-full flex-wrap flex justify-end">
      <Navigation menuNavbar={menuNavbarItemsInstructor} showSidebar={false}>
        <Outlet />
        {/* <PublicFooter /> */}
      </Navigation>
    </div>
    // <div className="min-h-screen w-full flex flex-col flex-wrap justify-end">
    //   <Navigation menuNavbar={menuNavbarItemsInstructor} showSidebar={false}>
    //     <Outlet />
    //   </Navigation>

    //   <PublicFooter />
    // </div>
  );
};

export default PublicLearner;
