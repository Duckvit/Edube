import axiosConfig from "../axiosConfig";

export const createMentor = async (data, token) => {
  const res = await axiosConfig.post(`/api/auth/create-mentor`, data);
  return res;
};
