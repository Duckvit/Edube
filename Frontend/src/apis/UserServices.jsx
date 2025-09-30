import axiosConfig from '../axiosConfig';

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