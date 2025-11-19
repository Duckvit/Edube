import axiosConfig from "../axiosConfig";

export const createCourseReview = async (token, data) => {
  const res = await axiosConfig.post(`/api/reviews`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAllReivewsByStatus = async (token, status) => {
  const res = await axiosConfig.get(`/api/reviews`, {
    params: { status },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getReviewByCourseId = async (courseId) => {
  const res = await axiosConfig.get(`/api/reviews/course/${courseId}`);
  return res.data;
};

export const approveReview = async (token, reviewID) => {
  const res = await axiosConfig.put(`/api/reviews/${reviewID}/approve`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getAvgRating = async (courseId, token) => {
  const res = await axiosConfig.get(
    `api/reviews/course/${courseId}/average-rating`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res.data;
};
