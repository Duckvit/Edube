import axiosConfig from "../axiosConfig";

const resolveToken = (token) => token || localStorage.getItem("token") || null;

const authHeaders = (token, extra = {}) => {
  const t = resolveToken(token);
  return {
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...extra,
  };
};

export const createLessonProgress = async (data, token) => {
  const res = await axiosConfig.post(`/api/lesson-progress`, data, {
    headers: authHeaders(token, { "Content-Type": "application/json" }),
  });
  return res.data;
};

export const getLessonProgressById = async (id, token) => {
  const res = await axiosConfig.get(`/api/lesson-progress/${id}`, {
    headers: authHeaders(token),
  });
  return res.data;
};

export const getLessonProgressByEnrollment = async (enrollmentId, token) => {
  const res = await axiosConfig.get(
    `/api/lesson-progress/enrollment/${enrollmentId}`,
    {
      headers: authHeaders(token),
    }
  );
  return res.data;
};

export const updateLessonProgress = async (id, data, token) => {
  const res = await axiosConfig.put(`/api/lesson-progress/${id}`, data, {
    headers: authHeaders(token, { "Content-Type": "application/json" }),
  });
  return res.data;
};

export const addTimeToLessonProgress = async (id, additionalMinutes, token) => {
  const res = await axiosConfig.put(
    `/api/lesson-progress/${id}/time-spent`,
    null,
    {
      params: { additionalMinutes },
      headers: authHeaders(token),
    }
  );
  return res.data;
};

export const getCourseProgress = async (courseId, token) => {
  const res = await axiosConfig.get(
    `/api/lesson-progress/course-progress/${courseId}`,
    {
      headers: authHeaders(token),
    }
  );
  return res.data;
};

export const checkLessonCompletion = async (enrollmentId, lessonId, token) => {
  const res = await axiosConfig.get(`/api/lesson-progress/check-completion`, {
    params: { enrollmentId, lessonId },
    headers: authHeaders(token),
  });
  return res.data; // expected boolean
};

export const getLessonProgressByLearner = async (learnerId, token) => {
  const res = await axiosConfig.get(
    `/api/lesson-progress/learner/${learnerId}`,
    {
      headers: authHeaders(token),
    }
  );
  return res.data;
};

export const deleteLessonProgress = async (id, token) => {
  const res = await axiosConfig.delete(`/api/lesson-progress/${id}`, {
    headers: authHeaders(token),
  });
  return res;
};

export default {
  createLessonProgress,
  getLessonProgressById,
  getLessonProgressByEnrollment,
  updateLessonProgress,
  addTimeToLessonProgress,
  getCourseProgress,
  checkLessonCompletion,
  getLessonProgressByLearner,
  deleteLessonProgress,
};
