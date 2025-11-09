import axiosConfig from "../axiosConfig";

export const getAllLearners = async (page = 0, size = 20, token) => {
  const res = await axiosConfig.get(`/api/learners`, {
    params: { page, size },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLearnerById = async (id, token) => {
  const res = await axiosConfig.get(`/api/learners/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateLearner = async (id, data, token) => {
  const res = await axiosConfig.put(`/api/learners/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const deleteLearner = async (id, token) => {
  const res = await axiosConfig.delete(`/api/learners/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateLearnerCredit = async (id, payload, token) => {
  const res = await axiosConfig.patch(`/api/learners/${id}/credit`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export default {
  getAllLearners,
  getLearnerById,
  updateLearner,
  deleteLearner,
  updateLearnerCredit,
};

export const createLearner = async (data) => {
  const res = await axiosConfig.post(`/api/auth/learners`, data);
  return res;
};
