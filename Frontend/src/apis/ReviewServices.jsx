import axiosConfig from '../axiosConfig'

export const createCourseReview = async(token, data) => {{
    const res = await axiosConfig.post(`/api/courses`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}}