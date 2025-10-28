import axiosConfig from "../axiosConfig";

export const getEnrollmentByLearnerId = async (id, token) => {
  const res = await axiosConfig.get(`/api/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};
