import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Rate, Collapse, List, Avatar } from "antd";
import {
  PlayCircleOutlined,
  LockOutlined,
  UserOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { courseData } from "../../utils/mockData";
import { useCourseStore } from "../../store/useCourseStore";
import useAiStore from "../../store/useAiStore";
import { getCourseById as fetchCourseById } from "../../apis/CourseServices";
import { useState, useEffect } from "react";

const { Panel } = Collapse;

const CoursePreview = () => {
  const { id } = useParams();
  console.log(id);
  const navigate = useNavigate();
  const storeCourse = useCourseStore((s) => s.getCourseById(id));
  const [remoteCourse, setRemoteCourse] = useState(null);

  // If the course isn't present in the store (for example user navigated directly), fetch it from API
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (storeCourse) return;
      try {
        const res = await fetchCourseById(id);
        // API shape may vary; map defensively to our UI shape
        const c = res?.data || res || {};
        const mapped = {
          id: c.id || c.courseId || c._id || id,
          title: c.title || c.name || "Untitled Course",
          instructor: c.instructor || c.author || "Unknown",
          category: c.category || "General",
          level: c.level || "All",
          rating: c.rating || 5,
          students: c.students || c.enrolledCount || 0,
          price: c.price || c.fee || 0,
          duration: c.duration || (c.hours ? `${c.hours} hours` : ""),
          lessons: c.lessons || c.totalLessons || 0,
          enrolled: !!c.enrolled || false,
          thumbnail: c.thumbnail || c.image || null,
          description: c.description || c.summary || c.overview || "",
          totalLessons: c.totalLessons || c.lessons || 0,
          curriculum: c.curriculum || c.sections || [],
        };

        if (mounted) {
          setRemoteCourse(mapped);
          // add to store if not already present
          const existing = useCourseStore.getState().allCourses || [];
          const exists = existing.find((x) => x.id === mapped.id);
          if (!exists) {
            useCourseStore.getState().setAllCourses([...existing, mapped]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch course by id", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id, storeCourse]);

  const course =
    storeCourse || remoteCourse || courseData[id] || courseData.CRS001;
  console.log(course);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
              >
                <ArrowLeftOutlined /> Back
              </button>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title}
              </h1>
              <p className="text-gray-600 mb-4">by {course.instructor}</p>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Rate
                    disabled
                    defaultValue={course.rating}
                    allowHalf
                    className="text-xs mr-2"
                  />
                  <span>{course.rating}</span>
                </div>
                <span>{course.students.toLocaleString()} students</span>
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div className="aspect-video rounded-lg flex items-center justify-center bg-black text-white">
                <div className="flex flex-col items-center">
                  <PlayCircleOutlined style={{ fontSize: 64 }} />
                  <p className="mt-4 text-lg font-semibold">Course Preview</p>
                  <p className="text-sm opacity-75">
                    This preview shows limited content. Buy the course to access
                    full lessons.
                  </p>
                </div>
              </div>
            </Card>

            <Card title="About this course" className="mb-6">
              <p className="text-gray-600">{course.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {course.totalLessons}
                  </div>
                  <div className="text-sm text-gray-600">Lessons</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {course.duration}
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {course.students.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {course.rating}/5
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card title="Course Curriculum" className="sticky top-4">
              <Collapse accordion>
                {course.curriculum.slice(0, 2).map((section, idx) => (
                  <Panel header={section.section} key={idx}>
                    <List
                      dataSource={section.lessons}
                      renderItem={(lesson) => (
                        <List.Item
                          className={`px-2 py-3 rounded ${
                            lesson.locked ? "opacity-50" : ""
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {lesson.locked ? (
                              <LockOutlined />
                            ) : (
                              <PlayCircleOutlined className="text-blue-500" />
                            )}
                            <div>
                              <div className="font-medium text-sm">
                                {lesson.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {lesson.duration}
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Panel>
                ))}
              </Collapse>

              <div className="mt-6">
                <div className="mb-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {course.price ? `${course.price} USD` : "Free"}
                  </div>
                </div>
                {course.enrolled ? (
                  <Button
                    size="large"
                    className="w-full h-12 !bg-blue-600 !border-none !rounded-xl !font-semibold !text-lg !text-white"
                    onClick={() => navigate(`/learner/course-detail/${id}`)}
                  >
                    Go to Course
                  </Button>
                ) : (
                  <>
                    <Button
                      size="large"
                      className="w-full h-12 !bg-gradient-to-r !from-sky-600 !to-yellow-600 !border-none !rounded-xl !font-semibold !text-lg hover:!from-sky-700 hover:!to-yellow-700 !text-white"
                      onClick={() => navigate(`/learner/payment/${id}`)}
                    >
                      Buy - {course.price ? `${course.price} USD` : "Free"}
                    </Button>

                    <Button
                      size="large"
                      className="w-full h-12 !bg-white !border !border-gray-200 !rounded-xl !font-semibold !text-lg text-gray-800 mt-2"
                      onClick={() =>
                        useAiStore.getState().summarizeCourseAndShow(id)
                      }
                    >
                      Tóm tắt khóa học này
                    </Button>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
