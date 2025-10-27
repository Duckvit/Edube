import { create } from "zustand";
import {
  allCourses as mockAll,
  enrolledCourses as mockEnrolled,
} from "../utils/mockData";

// Create a simple course store so UI updates when enrollment changes
export const useCourseStore = create((set, get) => ({
  allCourses: JSON.parse(JSON.stringify(mockAll)), // deep copy
  enrolledCourses: JSON.parse(JSON.stringify(mockEnrolled)),

  enrollCourse: (courseId) => {
    const { allCourses, enrolledCourses } = get();
    // find course in allCourses
    const idx = allCourses.findIndex((c) => c.id === courseId);
    if (idx === -1) return;

    // if already enrolled, return
    if (allCourses[idx].enrolled) return;

    // mark as enrolled
    allCourses[idx].enrolled = true;

    // add to enrolledCourses list (create similar shape)
    const newEnrolled = {
      key: String(enrolledCourses.length + 1),
      id: allCourses[idx].id,
      title: allCourses[idx].title,
      instructor: allCourses[idx].instructor,
      category: allCourses[idx].category || "General",
      level: allCourses[idx].level || "Beginner",
      progress: 0,
      status: "saved",
      rating: allCourses[idx].rating || 0,
      totalLessons: allCourses[idx].lessons || 0,
      completedLessons: 0,
      duration: allCourses[idx].duration || "",
      lastAccessed: "Never",
      thumbnail: allCourses[idx].thumbnail || null,
    };

    const updatedEnrolled = [...enrolledCourses, newEnrolled];

    set({ allCourses: [...allCourses], enrolledCourses: updatedEnrolled });
  },

  // replace allCourses (used when loading from API)
  setAllCourses: (courses) => {
    // keep enrolledCourses in sync if some courses have enrolled=true
    const enrolled = courses
      .filter((c) => c.enrolled)
      .map((c, idx) => ({
        key: String(idx + 1),
        id: c.id,
        title: c.title,
        instructor: c.instructor,
        category: c.category || "General",
        level: c.level || "Beginner",
        progress: c.progress || 0,
        status: c.status || (c.enrolled ? "saved" : "saved"),
        rating: c.rating || 0,
        totalLessons: c.lessons || 0,
        completedLessons: c.completedLessons || 0,
        duration: c.duration || "",
        lastAccessed: c.lastAccessed || "Never",
        thumbnail: c.thumbnail || null,
      }));

    set({ allCourses: courses, enrolledCourses: enrolled });
  },

  // helper to get course by id from allCourses
  getCourseById: (courseId) => {
    const { allCourses } = get();
    return allCourses.find((c) => c.id === courseId);
  },
}));

export default useCourseStore;
