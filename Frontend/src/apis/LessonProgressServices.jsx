import axiosConfig from "../axiosConfig";

export const createLessonProgress = async (token, data) => {
  const res = await axiosConfig.post(`/api/lesson-progress`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLessonProgressByEnrollment = async (enrollmentId, token) => {
  const res = await axiosConfig.get(`/api/lesson-progress/enrollment/${enrollmentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
