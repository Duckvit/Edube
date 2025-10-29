import axiosConfig from "../axiosConfig";

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
    
export const getFreeEnrollments = async (token, data) => {
  const res = await axiosConfig.post(`/api/enrollments/free`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
