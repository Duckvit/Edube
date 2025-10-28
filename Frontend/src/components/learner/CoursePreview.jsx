import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Rate, Collapse, List } from "antd";
import {
  PlayCircleOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import useAiStore from "../../store/useAiStore";
import { getCourseById as fetchCourseById } from "../../apis/CourseServices";

const { Panel } = Collapse;

const CoursePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ State cục bộ thay cho Zustand
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Fetch dữ liệu thật từ API
  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token không tồn tại");
          setLoading(false);
          return;
        }

        const res = await fetchCourseById(id, token);
        const c = res?.data || res || {};

        // 🔁 Chuẩn hóa dữ liệu về format UI
        const mapped = {
          id: c.id,
          title: c.title || "Untitled Course",
          mentor:
            c.mentor?.user?.fullName ||
            c.mentor?.user?.username ||
            "Unknown Mentor",
          category: c.category || "General",
          level: c.level || "All",
          rating: c.rating || 5,
          students: c.students || c.totalStudents || 0,
          price: c.price || 0,
          duration: c.durationHours ? `${c.durationHours} hours` : "N/A",
          totalLessons:
            c.totalLessons ||
            c.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0),
          description: c.description || "No description available.",
          sections: c.sections || [],
          enrolled: c.enrolled || false,
        };

        setCourse(mapped);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError(err.message || "Không thể tải dữ liệu khóa học");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading course...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  if (!course)
    return (
      <div className="flex justify-center items-center h-screen">
        <p>No course found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <p className="text-gray-600 mb-4">by {course.mentor}</p>
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
                <span>{course.students} students</span>
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Course Info */}
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
                    {course.students}
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

          {/* Right: Curriculum + Action */}
          <div className="lg:col-span-1">
            <Card title="Course Curriculum" className="sticky top-4">
              <Collapse accordion>
                {course.sections.slice(0, 2).map((section, idx) => (
                  <Panel header={section.title} key={idx}>
                    <List
                      dataSource={section.lessons || []}
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
                                {lesson.durationMinutes
                                  ? `${lesson.durationMinutes} mins`
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </List.Item>
                      )}
                    />
                  </Panel>
                ))}
              </Collapse>

              <div className="mt-6 text-center">
                <div className="mb-4 text-2xl font-bold text-gray-900">
                  {course.price ? `${course.price} USD` : "Free"}
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
