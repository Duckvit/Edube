import axiosConfig from "../axiosConfig";

export const getEnrollmentsByLearner = async (learnerId, token) => {
  const res = await axiosConfig.get(`/api/enrollments/learner/${learnerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getFreeEnrollments = async (token, data) => {
  const res = await axiosConfig.post(`/api/enrollments/free`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
