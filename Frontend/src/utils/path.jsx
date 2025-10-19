export const path = {
  // PUBLIC
  HOME: "/*",
  LOGIN: "login",
  PUBLIC: "public",
  FORGOT_PASS: "forgot-password",
  CHANGE_PASS: "change-password",
  OTP_INPUT: "send-recovery-otp",

  // COMMON USER
  USER_PROFILE: "profile-user",
  USER_CHAT: "chat",

  // INSTRUCTOR
  PUBLIC_INSTRUCTOR: "instructor",
  INSTRUCTOR_COURSE: "course",
  INSTRUCTOR_COURSE_BUILDER: "course/:courseId/builder",
  INSTRUCTOR_UPLOAD_COURSE: "upload-course",
  INSTRUCTOR_LEARNER: "learner",

  // ADMIN
  PUBLIC_ADMIN: "admin",
  ADMIN_COURSE_MANAGEMENT: "course-management",
  ADMIN_LEARNER_MANAGEMENT: "learner-management",
  ADMIN_INSTRUCTOR_MANAGEMENT: "instructor-management",
  ADMIN_REPORT: "report",

  // LEARNER
  PUBLIC_LEARNER: "learner",
  LEARNER_COURSE_DETAIL: "course-detail/:id",
};

export default path;
