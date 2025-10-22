import axiosConfig from "../axiosConfig";

export const uploadLesson = (data, token, config = {}) => {
  const headers = { ...(config.headers || {}) };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return axiosConfig.post("/api/mentor/lesson/upload", data, {
    ...config,
    headers,
  });
};
