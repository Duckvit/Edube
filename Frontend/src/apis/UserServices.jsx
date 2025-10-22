import axiosConfig from "../axiosConfig";

export const UserLogin = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "post",
        url: "/api/public/login",
        data: payload,
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

export const UserRegister = (payload) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "post",
        url: "/api/auth/create-user",
        data: payload,
      });
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });

export const sendOTPEmail = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "post",
        url: `api/auth/change-password-request`,
        data: data,
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });

export const changePassword = (data) =>
  new Promise(async (resolve, reject) => {
    try {
      const response = await axiosConfig({
        method: "put",
        url: `api/auth/change-password`,
        data: data,
      });
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  });

export const getProfile = async (username, token) => {
  const res = await axiosConfig.get(`/api/profile`, {
    params: { username },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
