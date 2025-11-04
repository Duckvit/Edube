import axiosConfig from "../axiosConfig";

export const uploadLesson = (data, token, config = {}) => {
  const headers = { ...(config.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return axiosConfig.post("/api/lessons/upload", data, {
    ...config,
    headers,
  });
};

export const createLesson = async (data, token) => {
  const res = await axiosConfig.post(`/api/lessons`, data, {
    headers: authHeaders(token, { "Content-Type": "application/json" }),
  });
  return res.data;
};

export const getLessonById = async (id, token) => {
  const res = await axiosConfig.get(`/api/mentor/lesson/${id}`, {
    headers: authHeaders(token),
  });
  return res.data;
};

export const getLessonsBySectionId = async (sectionId, token) => {
  // GET /api/lessons/section/{sectionId}
  const res = await axiosConfig.get(`/api/lessons/section/${sectionId}`, {
    headers: authHeaders(token),
  });
  // Expect res.data to be an array or object containing lessons
  return res.data;
};

export const updateLesson = async (id, data, token) => {
  const res = await axiosConfig.put(`/api/mentor/lesson/${id}`, data, {
    headers: authHeaders(token, { "Content-Type": "application/json" }),
  });
  return res.data;
};

export const deleteLesson = async (id, token) => {
  const res = await axiosConfig.delete(`/api/mentor/lesson/${id}`, {
    headers: authHeaders(token),
  });
  return res;
};
