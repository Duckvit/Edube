export const path = {
  // PUBLIC
  HOME: "/*",
  LOGIN: "login",
  PUBLIC: "public",
  FORGOT_PASS: "forgot-password",
  CHANGE_PASS: "change-password",
  OTP_INPUT: "send-recovery-otp",
  ROLE_SELECTION: "choose-role",
  OAuthCallback: "login",

  // COMMON USER
  USER_PROFILE: "profile-user",
  USER_COURSE_DETAIL: "course-detail/:id",
  USER_CHAT: "chat",

  // MENTOR
  PUBLIC_MENTOR: "mentor",
  MENTOR_COURSE: "course",
  MENTOR_COURSE_BUILDER: "course/:courseId/builder",
  MENTOR_UPLOAD_LESSON: "upload-lesson/:sectionId",
  MENTOR_LEARNER: "learner",

  // ADMIN
  PUBLIC_ADMIN: "admin",
  ADMIN_COURSE_MANAGEMENT: "course-management",
  ADMIN_LEARNER_MANAGEMENT: "learner-management",
  ADMIN_MENTOR_MANAGEMENT: "mentor-management",
  ADMIN_REPORT: "report",

  // LEARNER
  PUBLIC_LEARNER: "learner",
  LEARNER_COURSE_PREVIEW: "course-preview/:id",
  LEARNER_PAYMENT: "payment/:id",
  LEARNER_PAYMENT_SUCCESS: "payment-success",
  LEARNER_PAYMENT_FAIL: "payment-failed",
};

export default path;
