import axiosConfig from "../axiosConfig";

export const createMentor = async (data) => {
  // Token will be automatically added by axiosConfig interceptor from localStorage
  const res = await axiosConfig.post(`/api/auth/mentors`, data);
  return res.data;
};

export const approveMentor = async (mentorId, token) => {
  const res = await axiosConfig.put(
    `/api/mentors/${mentorId}/approve`,
    {},
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};

export const getLearner = async (page = 0, size = 10, mentorId, token) => {
  const res = await axiosConfig.get(`/api/mentors/${mentorId}/learners`, {
    params: { page, size },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
