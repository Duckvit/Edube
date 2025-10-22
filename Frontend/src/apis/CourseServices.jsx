import axiosConfig from "../axiosConfig";

// export const getAllCourses = (page = 0, size = 10, token) =>
//   new Promise(async (resolve, reject) => {
//     try {
//       const response = await axiosConfig({
//         method: "get",
//         url: `/api/courses`,
//         params: { page, size }, // ✅ dùng params thay cho data
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       resolve(response.data);
//     } catch (error) {
//       reject(error);
//     }
//   });

export const getAllCourses = async (page = 0, size = 10, token) => {
  const res = await axiosConfig.get(`/api/courses`, {
    params: { page, size },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createCourse = async (token, data) => {
  const res = await axiosConfig.post(`/api/courses`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res;
};
