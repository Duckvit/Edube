import axiosConfig from "../axiosConfig";

export const getSectionByCourseId = async (courseId, token) => {
  const res = await axiosConfig.get(`/api/sections/${courseId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createSection = async (data, token) => {
  const res = await axiosConfig.post(`/api/sections`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
