import axiosConfig from "../axiosConfig";

export const createMentor = async (data) => {
  const res = await axiosConfig.post(`/api/mentors`, data);
  return res;
};

export const approveMentor = async (mentorId, token) => {
  const res = await axiosConfig.put(`/api/mentors/${mentorId}/approve`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
