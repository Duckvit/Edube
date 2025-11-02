import axiosConfig from "../axiosConfig";

export const getAllCourses = async (page = 0, size = 10, token) => {
  const res = await axiosConfig.get(`/api/courses`, {
    params: { page, size },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAllCoursesByMentorId = async (mentorId, token) => {
  const res = await axiosConfig.get(`/api/courses/mentors/${mentorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAllActiveCoursesByMentorId = async (mentorId, token) => {
  const res = await axiosConfig.get(`/api/courses/mentors/${mentorId}/active`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getCourseById = async (id, token) => {
  const res = await axiosConfig.get(`/api/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createCourse = async (token, data) => {
  const res = await axiosConfig.post(`/api/courses`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const updateCourse = async (token, data) => {
  const res = await axiosConfig.put(`/api/courses/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const deleteCourse = async (id, token) => {
  const res = await axiosConfig.delete(`/api/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};

export const activeCourse = async (id, token) => {
  const res = await axiosConfig.post(`/api/courses/${id}/approve`, null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};
