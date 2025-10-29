import axiosConfig from "../axiosConfig";

export const createLearner = async (data, token) => {
  const res = await axiosConfig.post(`/api/learners`, data);
  return res;
};
