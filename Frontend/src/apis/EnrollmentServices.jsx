import axiosConfig from "../axiosConfig";

// Get enrollments for a learner
export const getEnrollmentsByLearner = async (learnerId, token) => {
  const res = await axiosConfig.get(`/api/enrollments/learner/${learnerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

