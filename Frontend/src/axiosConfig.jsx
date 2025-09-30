import React from 'react';
// require('dotenv').config()
import axios from 'axios';
import Swal from 'sweetalert2';

// cau hinh lai axios
const instance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL
  ////
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    let token = localStorage?.getItem('token');
    if (token)
      config.headers = {
        Authorization: `Bearer ${token}`
      };
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    let res = {};
    console.log(error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      res.data = error.response.data;
      res.status = error.response.status;
      res.headers = error.response.headers;
      if (error.response.status === 401) {
        Swal.fire({
          title: 'User authentication failed!',
          text: `User verification failed, please log in again`,
          icon: 'error',
          timer: 3000,
          timerProgressBar: true
        });

        localStorage.removeItem('token');

        setTimeout(() => {
          // Điều hướng người dùng về trang đăng nhập
          window.location.href = '/public/login';
        }, 2000);
      }
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser
      // and an instance of http.ClientRequest in node.js
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log('Error', error.message);
    }
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return res;
  }
);

export default instance;
