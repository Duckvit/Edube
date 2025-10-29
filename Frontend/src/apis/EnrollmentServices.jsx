import axiosConfig from "../axiosConfig";

// Get enrollments for a learner
export const getEnrollmentsByLearner = async (learnerId, token) => {
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  const res = await axiosConfig.get(
    `/api/enrollments/learner/${learnerId}`,
    config
  );
  return res.data;
};

// Create a new enrollment
export const createEnrollment = async (payload, token) => {
  const config = {};
  if (token) config.headers = { Authorization: `Bearer ${token}` };
  const res = await axiosConfig.post(`/api/enrollments`, payload, config);
  return res.data;
};
