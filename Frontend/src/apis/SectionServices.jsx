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

export const updateSection = async (data, token) => {
  // PUT /api/sections expects full section object with id, title, description, orderIndex
  const res = await axiosConfig.put(`/api/sections`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteSection = async (sectionId, token) => {
  const res = await axiosConfig.delete(`/api/sections/${sectionId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
