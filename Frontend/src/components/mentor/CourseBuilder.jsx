import React, { useState, useEffect } from "react";
import {
  getSectionByCourseId,
  createSection,
  updateSection,
  deleteSection,
} from "../../apis/SectionServices";
import { getLessonsBySectionId } from "../../apis/LessonServices";
import { getCourseById, deleteCourse } from "../../apis/CourseServices";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import {
  Card,
  Button,
  Collapse,
  Form,
  Input,
  Modal,
  Space,
  Tag,
  Empty,
  message,
  Upload,
  InputNumber,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PlayCircleOutlined,
  FileOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import path from "../../utils/path";

const { Panel } = Collapse;
const { TextArea } = Input;

const CourseBuilder = () => {
  const navigate = useNavigate();
  const { courseId: paramCourseId } = useParams();
  const location = useLocation();
  // fallback: if route param missing, extract courseId from pathname
  const courseId =
    paramCourseId ||
    (() => {
      try {
        // capture any segment between 'course/' and '/builder' (allow dashes, dots, etc.)
        const m = location.pathname.match(/course\/([^/]+)\/builder/);
        return m ? m[1] : null;
      } catch (e) {
        return null;
      }
    })();
  const [sectionForm] = Form.useForm();
  const [videoForm] = Form.useForm();
  const [course, setCourse] = useState({});
  const [sections, setSections] = useState([]);
  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);
  const userData = useUserStore((s) => s.userData);
  const firstSection = course.curriculum?.[0];

  useEffect(() => {
    const fetchSections = async () => {
      if (!courseId) {
        console.warn("⚠️ courseId is missing in fetchSections");
        setSections([]);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        console.log(
          "🔵 Fetching sections for courseId:",
          courseId,
          "type:",
          typeof courseId
        );
        const data = await getSectionByCourseId(courseId, token);
        console.log("📥 Sections response:", data);

        // Lấy đúng mảng sections ra
        const sectionsArray = data?.sections || data || [];
        console.log("📋 Sections array:", sectionsArray);
        setSections(Array.isArray(sectionsArray) ? sectionsArray : []);

        // Nếu muốn lấy course title riêng
        if (sectionsArray.length > 0 && sectionsArray[0]?.course) {
          setCourse(sectionsArray[0].course);
        }
      } catch (error) {
        console.error("❌ Error fetching sections:", error);
        console.error("Error details:", error.response || error);
        setSections([]); // tránh lỗi reduce khi API fail
      }
    };
    fetchSections();
  }, [courseId]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getCourseById(courseId);
        const c = res?.data || res || {};

        const mapped = {
          id: c.id || c.courseId || c._id || courseId,
          title: c.title || c.name || "Untitled Course",
          instructor:
            c.instructor || c.author || c.mentor?.user?.fullName || "Unknown",
          description: c.description || c.summary || c.overview || "",
          rating: c.rating || 5,
          students: c.totalStudents ?? c.students ?? c.enrolledCount ?? 0,
          duration:
            c.duration ||
            (c.durationHours
              ? `${c.durationHours} hours`
              : c.hours
              ? `${c.hours} hours`
              : "") ||
            0,
          totalLessons:
            c.totalLessons ||
            c.lessons ||
            (c.sections
              ? c.sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)
              : 0),
          // curriculum: c.sections || c.curriculum || [],
        };

        // mapped.curriculum = curriculum;

        if (mounted) setCourse(mapped);
      } catch (err) {
        console.error("Failed to load course detail", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [courseId, userData]);

  const handleCreateSection = async () => {
    try {
      const token = localStorage.getItem("token");
      const values = await sectionForm.validateFields();

      if (editingSection && editingSection.id) {
        // Update existing section via API
        const payload = {
          id: editingSection.id,
          title: values.title,
          description: values.description || "",
          orderIndex: editingSection.orderIndex || 1,
        };
        await updateSection(payload, token);
        toast.success("Section updated successfully!");
      } else {
        // Create new section
        const orderIndex = (sections?.length || 0) + 1;
        const data = {
          course: { id: Number(courseId) },
          orderIndex,
          ...values,
        };
        await createSection(data, token);
        toast.success("Section created successfully!");
      }

      // refresh sections from server to reflect persisted state
      await fetchSections();
      sectionForm.resetFields();
      setIsSectionModalVisible(false);
      setEditingSection(null);
    } catch (err) {
      toast.error("Failed to save section!");
      console.error("❌ Error:", err);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTotalDuration = (videos) => {
    const total = videos?.reduce((sum, v) => sum + v.duration, 0);
    return formatDuration(total);
  };

  const handleAddSection = () => {
    setEditingSection(null);
    sectionForm.resetFields();
    setIsSectionModalVisible(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    sectionForm.setFieldsValue(section);
    setIsSectionModalVisible(true);
  };

  const handleDeleteSection = (sectionId) => {
    Modal.confirm({
      title: "Delete Section",
      content: "Are you sure you want to delete this section?",
      okText: "Yes",
      cancelText: "No",
      okType: "danger",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          // If local temporary id, just remove locally
          if (String(sectionId).startsWith("section-")) {
            setSections(sections.filter((s) => s.id !== sectionId));
            message.success("Section deleted successfully");
            return;
          }
          await deleteSection(sectionId, token);
          // re-fetch sections from server
          await fetchSections();
          message.success("Section deleted successfully");
        } catch (err) {
          console.error("Failed to delete section:", err);
          message.error("Failed to delete section");
        }
      },
    });
  };

  const handleAddLesson = (sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingVideo(null);
    // videoForm.resetFields();
    // setIsVideoModalVisible(true);
    // navigate to the upload lesson route using absolute path constants
    try {
      const target = `/${
        path.PUBLIC_MENTOR
      }/${path.MENTOR_COURSE_BUILDER.replace(
        ":courseId",
        encodeURIComponent(String(courseId))
      )}/${path.MENTOR_UPLOAD_LESSON.replace(
        ":sectionId",
        encodeURIComponent(String(sectionId))
      )}`;
      navigate(target);
    } catch (err) {
      // fallback to relative
      navigate(`upload-lesson/${sectionId}`);
    }
  };

  const handleEditVideo = (sectionId, video) => {
    setCurrentSectionId(sectionId);
    setEditingVideo(video);
    videoForm.setFieldsValue(video);
    setIsVideoModalVisible(true);
  };

  const handleSaveVideo = async (values) => {
    try {
      const token = localStorage.getItem("token");

      // map incoming form values to API shape
      const payload = {
        section: { id: currentSectionId },
        title: values.title,
        description: values.description,
        contentType:
          values.contentType || (values.videoUrl ? "video" : "document"),
        contentText: values.videoUrl || values.contentText || null,
        orderIndex: 1,
        durationMinutes: values.duration
          ? Math.ceil(values.duration / 60)
          : undefined,
      };

      // determine orderIndex from existing lessons
      const targetSection = sections.find((s) => s.id === currentSectionId) || {
        lessons: [],
      };
      payload.orderIndex = editingVideo
        ? editingVideo.orderIndex || editingVideo.orderIndex === 0
          ? editingVideo.orderIndex
          : 1
        : (targetSection.lessons?.length || 0) + 1;

      if (
        editingVideo &&
        editingVideo.id &&
        !String(editingVideo.id).startsWith("video-")
      ) {
        // persisted: call update API
        const updated = await updateLesson(editingVideo.id, payload, token);
        setSections(
          sections.map((section) =>
            section.id === currentSectionId
              ? {
                  ...section,
                  lessons:
                    section.lessons?.map((l) =>
                      l.id === updated.id ? updated : l
                    ) || [],
                }
              : section
          )
        );
        message.success("Lesson updated successfully");
      } else {
        // create new lesson via API
        const created = await createLesson(payload, token);
        setSections(
          sections.map((section) =>
            section.id === currentSectionId
              ? { ...section, lessons: [...(section.lessons || []), created] }
              : section
          )
        );
        message.success("Lesson added successfully");
      }

      setIsVideoModalVisible(false);
      videoForm.resetFields();
    } catch (error) {
      message.error("Failed to save video");
      console.error("❌ handleSaveVideo error:", error);
    }
  };

  const handleDeleteVideo = (sectionId, videoId) => {
    Modal.confirm({
      title: "Delete Video",
      content: "Are you sure you want to delete this video?",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        const token = localStorage.getItem("token");
        // if persisted id, call API; else just remove local
        if (!String(videoId).startsWith("video-")) {
          deleteLesson(videoId, token)
            .then(() => {
              setSections(
                sections.map((section) =>
                  section.id === sectionId
                    ? {
                        ...section,
                        lessons: section.lessons.filter(
                          (v) => v.id !== videoId
                        ),
                      }
                    : section
                )
              );
              message.success("Lesson deleted successfully");
            })
            .catch((err) => {
              console.error("Failed to delete lesson:", err);
              message.error("Failed to delete lesson");
            });
        } else {
          setSections(
            sections.map((section) =>
              section.id === sectionId
                ? {
                    ...section,
                    lessons: section.lessons.filter((v) => v.id !== videoId),
                  }
                : section
            )
          );
          message.success("Lesson deleted successfully");
        }
      },
    });
  };

  const handlePublishCourse = () => {
    Modal.confirm({
      title: "Publish Course",
      content:
        "Are you sure you want to publish this course? Students will be able to enroll.",
      okText: "Publish",
      onOk: () => {
        setCourse({ ...course, isPublished: true });
        message.success("Course published successfully");
      },
    });
  };

  const totalVideos = (sections || []).reduce(
    (sum, s) => sum + (s.lessons?.length || 0),
    0
  );

  const totalDuration = sections.reduce(
    (sum, s) => sum + s.videos?.reduce((vSum, v) => vSum + v.duration, 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/mentor/course")}
              >
                Back to Courses
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {sections?.[0]?.course?.title}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span>{sections?.length} sections</span>
                  {/* <span>{totalVideos} videos</span>
                  <span>{formatDuration(totalDuration)} total</span> */}
                  <Tag color={course.isPublished ? "success" : "default"}>
                    {course.isPublished ? "Published" : "Draft"}
                  </Tag>
                </div>
              </div>
            </div>
            {/* <Space>
              <Button icon={<EyeOutlined />}>Preview</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handlePublishCourse}
                className="bg-blue-600"
                disabled={course.isPublished || sections.length === 0}
              >
                Publish Course
              </Button>
            </Space> */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Content</h2>
            <p className="text-gray-600 mt-1">
              Build your course curriculum by adding sections and videos
            </p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSection}
            size="large"
            className="bg-blue-600"
          >
            Add Section
          </Button>
        </div>

        {sections.length === 0 ? (
          <Card>
            <Empty
              description={
                <div>
                  <p className="text-gray-600 mb-4">
                    No sections yet. Start building your course!
                  </p>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddSection}
                  >
                    Create First Section
                  </Button>
                </div>
              }
            />
          </Card>
        ) : (
          <Collapse
            accordion
            className="bg-white"
            expandIconPosition="end"
            items={sections.map((section, index) => ({
              key: section.id,
              label: (
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {section.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {section.lessons?.length ?? section.videos?.length ?? 0}{" "}
                        lessons
                      </div>
                    </div>
                  </div>
                  <Space onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => handleEditSection(section)}
                    />
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDeleteSection(section.id)}
                    />
                  </Space>
                </div>
              ),
              children: (
                <div className="pl-11">
                  {section.description && (
                    <p className="text-gray-600 mb-4">{section.description}</p>
                  )}

                  {(section.lessons?.length ?? section.videos?.length ?? 0) ===
                  0 ? (
                    <Empty
                      description="No lessons in this section"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddLesson(section.id)}
                      >
                        Add Lesson
                      </Button>
                    </Empty>
                  ) : (
                    <div className="space-y-2">
                      {(section.lessons || section.videos || []).map(
                        (lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.contentType === "video" ? (
                                <PlayCircleOutlined className="text-blue-600 text-lg" />
                              ) : (
                                <FileTextOutlined className="text-green-600 text-lg" />
                              )}
                              <div>
                                <div className="font-medium text-gray-900">
                                  {lesson.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {lesson.duration
                                    ? formatDuration(lesson.duration)
                                    : null}
                                  {lesson.description &&
                                    ` • ${lesson.description}`}
                                </div>
                              </div>
                            </div>
                            <Space>
                              <Button
                                size="small"
                                icon={<EditOutlined />}
                                onClick={() =>
                                  handleEditVideo(section.id, lesson)
                                }
                              />
                              <Button
                                size="small"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  handleDeleteVideo(section.id, lesson.id)
                                }
                              />
                            </Space>
                          </div>
                        )
                      )}
                      <Button
                        type="dashed"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddLesson(section.id)}
                        className="w-full mt-2"
                      >
                        Add Lesson
                      </Button>
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </div>

      <Modal
        title={editingSection ? "Edit Section" : "Add New Section"}
        open={isSectionModalVisible}
        onCancel={() => {
          setIsSectionModalVisible(false);
          sectionForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={sectionForm}
          layout="vertical"
          onFinish={handleCreateSection}
          className="mt-4"
        >
          <Form.Item
            label="Section Title"
            name="title"
            rules={[{ required: true, message: "Please enter section title" }]}
          >
            <Input placeholder="e.g., Introduction to React" size="large" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea
              rows={3}
              placeholder="Brief description of what this section covers"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setIsSectionModalVisible(false);
                  sectionForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingSection ? "Update" : "Add"} Section
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingVideo ? "Edit Video" : "Add New Video"}
        open={isVideoModalVisible}
        onCancel={() => {
          setIsVideoModalVisible(false);
          videoForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={videoForm}
          layout="vertical"
          onFinish={handleSaveVideo}
          className="mt-4"
        >
          <Form.Item
            label="Video Title"
            name="title"
            rules={[{ required: true, message: "Please enter video title" }]}
          >
            <Input
              placeholder="e.g., Introduction to Components"
              size="large"
            />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea
              rows={3}
              placeholder="What will students learn in this video?"
              showCount
              maxLength={200}
            />
          </Form.Item>

          <Form.Item
            label="Video URL"
            name="videoUrl"
            rules={[{ required: true, message: "Please enter video URL" }]}
            extra="You can upload videos to platforms like YouTube, Vimeo, or cloud storage"
          >
            <Input placeholder="https://..." size="large" />
          </Form.Item>

          <Form.Item
            label="Duration (seconds)"
            name="duration"
            rules={[{ required: true, message: "Please enter duration" }]}
          >
            <InputNumber
              min={1}
              placeholder="e.g., 300 for 5 minutes"
              size="large"
              className="w-full"
            />
          </Form.Item>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <div className="flex items-start gap-2">
              <FileOutlined className="text-blue-600 mt-1" />
              <div className="text-sm text-blue-900">
                <strong>Upload Video:</strong> For now, upload your videos to
                YouTube, Vimeo, or cloud storage, then paste the URL here.
                Direct upload functionality will be added soon.
              </div>
            </div>
          </div>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setIsVideoModalVisible(false);
                  videoForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                {editingVideo ? "Update" : "Add"} Video
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CourseBuilder;
