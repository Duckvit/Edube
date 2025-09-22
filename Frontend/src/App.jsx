import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Navigate, Route, Routes } from "react-router-dom";
import { path } from "./utils/path";
import { HomePage, PublicInstructor, PublicLayout } from "./pages";
import PrivateRoute from "./middlewares/PrivateRoute";
import { Chat, Course, Dashboard, Student, UploadCourse } from "./components";
import { useUserStore } from "./store/useUserStore";
import { roleForComponent } from "./utils/constant";

function App() {
  const [count, setCount] = useState(0);
  const { token, role, resetUserStore } = useUserStore();
  // useEffect(() => {
  //   if (!localStorage?.getItem('token') || localStorage?.getItem('token') === 'null') resetUserStore();
  // }, [useUserStore]);

  return (
    <div>
      <ToastContainer position="top-right" autoClose={1000} limit={3} />
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={!token ? path.PUBLIC : roleForComponent[role]}
              replace
            />
          }
        />
        {/* Route cho trang public */}
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
        </Route>

        <Route
          // Route cho trang insctructor
          path={path.PUBLIC_INSTRUCTOR}
          element={
            // <PrivateRoute role={role}>
            <PublicInstructor />
            // </PrivateRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path={path.COURSE} element={<Course />} />
          <Route path={`${path.COURSE}/${path.UPLOAD_COURSE}`} element={<UploadCourse />} />
          <Route path={path.STUDENT} element={<Student />} />
          <Route path={path.CHAT} element={<Chat />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
