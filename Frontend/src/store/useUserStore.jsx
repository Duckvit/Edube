import { create } from "zustand";

export const useUserStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  // current: null,
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true" || false,
  userData: null,
  instructorOfCourse: null,
  fullData: null,
  email: null,
  username: null,
  otp: null,

  setModal: (token, role, isLoggedIn) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("isLoggedIn", isLoggedIn ? "true" : "false");
    set(() => ({
      token,
      role,
      isLoggedIn,
    }));
  },

  setUserData: (userData) => {
    set(() => ({
      userData,
    }));
  },

  setFullData: (fullData) => {
    set(() => ({
      fullData,
    }));
  },

  setinstructorOfCourse: (instructorOfCourse) => {
    set(() => ({
      instructorOfCourse,
    }));
  },

  // setCurrent: current => {
  //   set(() => ({ current }));
  // },

  setEmail: (email) => {
    set(() => ({
      email,
    }));
  },

  setStoreOTP: (otp) => {
    set(() => ({
      otp,
    }));
  },

  setUsername: (username) => {
    set(() => ({
      username,
    }));
  },

  // resetChangePass: () => {
  //   set(() => ({
  //     email: null,
  //     otp: null
  //   }));
  // },

  resetUserStore: () => {
    localStorage?.removeItem("token");
    localStorage?.removeItem("role");
    localStorage?.removeItem("isLoggedIn");
    set(() => ({
      token: null,
      role: null,
      isLoggedIn: false,
      fullData: null,
      mentorOfClass: null,
      userData: null,
      // current: null,
      instructorOfCourse: null,
      email: null,
      username: null,
      otp: null,
    }));
  },
}));
