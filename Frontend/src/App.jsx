import React, { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Navigate, Route, Routes } from "react-router-dom";
import { path } from "./utils/path";
import { HomePage, PublicAdmin, PublicInstructor, PublicLayout } from "./pages";
import PrivateRoute from "./middlewares/PrivateRoute";
import {
  AdminHome,
  Chat,
  Course,
  CourseManagement,
  Dashboard,
  InstructorManagement,
  LearnerManagement,
  Report,
  Student,
  UploadCourse,
} from "./components";
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
          <Route path={path.INSTRUCTOR_COURSE} element={<Course />} />
          <Route
            path={`${path.INSTRUCTOR_COURSE}/${path.INSTRUCTOR_UPLOAD_COURSE}`}
            element={<UploadCourse />}
          />
          <Route path={path.INSTRUCTOR_LEARNER} element={<Student />} />
          <Route path={path.INSTRUCTOR_CHAT} element={<Chat />} />
        </Route>
        <Route
          // Route cho trang admin
          path={path.PUBLIC_ADMIN}
          element={
            // <PrivateRoute role={role}>
            <PublicAdmin />
            // </PrivateRoute>
          }
        >
          <Route index element={<AdminHome />} />
          <Route
            path={path.ADMIN_COURSE_MANAGEMENT}
            element={<CourseManagement />}
          />
          <Route
            path={path.ADMIN_LEARNER_MANAGEMENT}
            element={<LearnerManagement />}
          />
          <Route
            path={path.ADMIN_INSTRUCTOR_MANAGEMENT}
            element={<InstructorManagement />}
          />
          <Route path={path.REPORT} element={<Report />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
