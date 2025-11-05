import axiosConfig from "../axiosConfig";

export const createLearner = async (data) => {
  const res = await axiosConfig.post(`/api/auth/learners`, data);
  return res;
};
