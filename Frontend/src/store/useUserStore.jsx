import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserStore = create(
  persist(
    (set) => ({
      token: null,
      role: null,
      isLoggedIn: false,
      hydrated: false,
      userData: null,
      instructorOfCourse: null,
      fullData: null,
      email: null,
      username: null,
      otp: null,

      setModal: (token, role, isLoggedIn) =>
        set(() => ({
          token,
          role,
          isLoggedIn,
          hydrated: true,
          userData: null,
        })),

      setUserData: (userData) => set({ userData }),
      setFullData: (fullData) => set({ fullData }),
      setinstructorOfCourse: (instructorOfCourse) =>
        set({ instructorOfCourse }),
      setEmail: (email) => set({ email }),
      setStoreOTP: (otp) => set({ otp }),
      setUsername: (username) => set({ username }),

      resetUserStore: () =>
        set(() => ({
          token: null,
          role: null,
          isLoggedIn: false,
          fullData: null,
          mentorOfClass: null,
          userData: null,
          instructorOfCourse: null,
          email: null,
          username: null,
          otp: null,
          hydrated: true
        })),
    }),
    {
      name: "user-storage", 
      storage: createJSONStorage(() => localStorage),
    }
  )
);
