import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Rate, Collapse, List, Modal } from "antd";
import { createPayment } from "../../apis/PaymentServices";
import {
  createEnrollment,
  createFreeEnrollments,
} from "../../apis/EnrollmentServices";
import { createConversation } from "../../apis/ChatServices";
import { toast } from "react-toastify";
import {
  PlayCircleOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import useAiStore from "../../store/useAiStore";
import { useUserStore } from "../../store/useUserStore";
import { getCourseById as fetchCourseById } from "../../apis/CourseServices";
import path from "../../utils/path";

const { Panel } = Collapse;

const CoursePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userData } = useUserStore();
  const [selectedLesson, setSelectedLesson] = useState(null);

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
          id: c.id || c.courseId || c._id || id,
          title: c.title || c.name || "Untitled Course",
          mentor: c.mentor?.user?.fullName || "Unknown",
          mentorId: c.mentor?.id || null,
          category: c.category || "General",
          level: c.level || "All",
          rating: c.rating || 5,
          students: c.totalStudents ?? c.students ?? c.enrolledCount ?? 0,
          price: c.price || c.fee || 0,
          duration: c.durationHours ? `${c.durationHours}h` : "0",
          lessons: c.lessons || c.totalLessons || 0,
          enrolled: !!c.enrolled || false,
          thumbnail: c.thumbnail || c.image || null,
          description: c.description || c.summary || c.overview || "",
          totalLessons: c.totalLessons || c.lessons || 0,
          curriculum: c.curriculum || c.sections || [],
          // instructor: c.mentor.user.fullName || "Unknown",
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

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in before enrolling");
        return;
      }

      if (!course) {
        toast.error("Course data not loaded");
        return;
      }

      const priceNum = Number(course.price || 0);
      const payload = { courseId };

      // ✅ Trường hợp khóa học miễn phí
      if (priceNum === 0) {
        const res = await createFreeEnrollments(token, payload); // GỌI API FREE
        console.log("✅ Free Enrollment Response:", res);

        toast.success("Enrolled successfully. Redirecting to course...");

        // Tạo hội thoại với mentor
        if (course.mentorId) {
          try {
            const userId =
              useUserStore.getState().userData?.learner?.id ||
              Number(localStorage.getItem("userId")) ||
              1;
            await createConversation({
              learner: { id: userId },
              mentor: { id: course.mentorId },
              course: { id: courseId },
            });
            console.log("✅ Conversation created with mentor");
          } catch (err) {
            console.warn("⚠️ Failed to create conversation:", err);
          }
        }

        navigate(`/learner/course-detail/${courseId}`);
        return;
      }

      // 💳 Nếu không phải free course → Thanh toán
      const res = await createPayment(payload, token);
      if (res?.checkoutUrl) {
        toast.success("Redirecting to payment...");
        window.location.replace(res.checkoutUrl);
      } else {
        toast.error("Failed to create payment link");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error during enrollment");
    }
  };

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
              <div className="flex items-center gap-3 mb-4">
                <p className="text-gray-600">by {course.mentor}</p>
                {course.mentorId && (
                  <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    size="small"
                    className="!bg-blue-600 hover:!bg-blue-700"
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token");
                        if (!token) {
                          toast.error("Please log in to chat");
                          return;
                        }

                        const userId =
                          useUserStore.getState().userData?.learner?.id ||
                          Number(localStorage.getItem("userId")) ||
                          1;

                        // Tạo conversation nếu chưa có
                        try {
                          await createConversation({
                            learner: { id: userId },
                            mentor: { id: course.mentorId },
                            course: { id: course.id },
                            title: course.title || "Hỏi về khóa học",
                          });
                        } catch (err) {
                          // Conversation có thể đã tồn tại, tiếp tục navigate
                          console.log("Conversation may already exist:", err);
                        }

                        // Navigate đến trang chat
                        navigate(`/${path.PUBLIC_LEARNER}/${path.USER_CHAT}`);
                      } catch (error) {
                        console.error("Error navigating to chat:", error);
                        toast.error("Failed to open chat");
                      }
                    }}
                  >
                    Chat
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                {/* <div className="flex items-center">
                  <Rate
                    disabled
                    defaultValue={course.rating}
                    allowHalf
                    className="text-xs mr-2"
                  />
                  <span>{course.rating}</span>
                </div> */}
                <span>{course.students} students</span>
                <span>{course.duration} hours</span>
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
              <div
                className="aspect-video rounded-lg flex items-center justify-center bg-black text-white cursor-pointer"
                onClick={() => {
                  const firstLesson = course?.curriculum?.[0]?.lessons?.[0];
                  if (
                    firstLesson &&
                    (firstLesson.contentUrl || firstLesson.contentText)
                  ) {
                    setSelectedLesson(firstLesson);
                  }
                }}
              >
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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
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
                {/* <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {course.rating}/5
                  </div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div> */}
              </div>
            </Card>
          </div>

          {/* Right: Curriculum + Action */}
          <div className="lg:col-span-1">
            <Card title="Course Curriculum" className="sticky top-4">
              <Collapse
                accordion
                items={(course.curriculum || []).map((section, sIdx) => ({
                  key: sIdx,
                  label: section.description || section.section || "",
                  children: (
                    <List
                      dataSource={section.lessons || []}
                      renderItem={(lesson, lIdx) => {
                        const isPlayable =
                          sIdx === 0 &&
                          lIdx === 0 &&
                          (lesson.contentUrl || lesson.contentText);
                        const isSelected = selectedLesson?.id === lesson.id;

                        return (
                          <List.Item
                            className={`px-2 py-3 rounded transition-colors ${
                              !isPlayable
                                ? "opacity-60 cursor-default"
                                : isSelected
                                ? "bg-blue-50 border-l-4 border-blue-500 cursor-pointer"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!isPlayable) return;
                              // Play preview video inline modal instead of navigating
                              setSelectedLesson(lesson);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              {!isPlayable ? (
                                <LockOutlined className="text-gray-400" />
                              ) : lesson.contentType === "video" ? (
                                <PlayCircleOutlined className="text-blue-500" />
                              ) : (
                                <FileTextOutlined className="text-green-600" />
                              )}
                              <div>
                                <div className="font-medium text-sm">
                                  {lesson.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {lesson.duration || lesson.durationMinutes
                                    ? `${
                                        lesson.duration ||
                                        lesson.durationMinutes
                                      } min`
                                    : lesson.contentType || ""}
                                </div>
                                {!isPlayable && lesson.contentText && (
                                  <div className="text-xs text-gray-400 mt-1">
                                    {lesson.contentText}
                                  </div>
                                )}
                              </div>
                            </div>
                          </List.Item>
                        );
                      }}
                    />
                  ),
                }))}
              />

              {/* Preview player modal: plays only on preview page */}
              <Modal
                open={!!selectedLesson}
                title={selectedLesson?.title || "Preview"}
                onCancel={() => setSelectedLesson(null)}
                footer={null}
                width={800}
                centered
              >
                {selectedLesson && selectedLesson.contentUrl ? (
                  <div className="w-full">
                    <video
                      src={selectedLesson.contentUrl}
                      controls
                      className="w-full h-96 bg-black"
                    />
                  </div>
                ) : selectedLesson && selectedLesson.contentText ? (
                  <div className="prose max-w-none">
                    <p>{selectedLesson.contentText}</p>
                  </div>
                ) : (
                  <div>No preview available for this lesson.</div>
                )}
              </Modal>

              <div className="mt-6 text-center">
                {/* <div className="mb-4 text-2xl font-bold text-gray-900">
                  {course.price ? `${course.price.toLocaleString("vi-VN")}` : "Free"}
                </div> */}

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
                      onClick={() => handleEnroll(course.id)}
                    >
                      {course.price && course.price > 0
                        ? `Buy - ${course.price.toLocaleString("vi-VN")} VNĐ`
                        : "Enroll for Free"}
                    </Button>

                    <Button
                      size="large"
                      className="w-full h-12 !bg-white !border !border-gray-200 !rounded-xl !font-semibold !text-lg text-gray-800 mt-2"
                      onClick={() =>
                        useAiStore
                          .getState()
                          .summarizeCourseAndShow(id, course?.title)
                      }
                    >
                      Summarize This Course
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
