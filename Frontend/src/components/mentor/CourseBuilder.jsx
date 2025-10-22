import React, { useState, useEffect } from "react";
import {
  getSectionByCourseId,
  createSection,
} from "../../apis/SectionServices";
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
  SaveOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  UploadOutlined,
  DragOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import path from "../../utils/path";

const { Panel } = Collapse;
const { TextArea } = Input;

const CourseBuilder = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [sectionForm] = Form.useForm();
  const [videoForm] = Form.useForm();

  const [course, setCourse] = useState({});

  const [sections, setSections] = useState([]);

  const [isSectionModalVisible, setIsSectionModalVisible] = useState(false);
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [currentSectionId, setCurrentSectionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const data = await getSectionByCourseId(courseId, token);
        console.log("📦 API response:", data);
        setSections(data?.sections || []);
      } catch (err) {
        console.error("❌ Error fetching sections:", err);
        toast.error("Failed to load sections");
      }
    };

    fetchData();
  }, [courseId]);

  const handleCreateSection = async () => {
    try {
      const token = localStorage.getItem("token");
      const values = await sectionForm.validateFields();

      const data = {
        course: { id: courseId },
        ...values,
      };

      const res = await createSection(data, token);
      toast.success("Section created successfully!");

      setSections((prev) => [...prev, { ...res.section, videos: [] }]);
      sectionForm.resetFields();
      setIsSectionModalVisible(false);
    } catch (err) {
      toast.error("Failed to create section!");
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

  const handleSaveSection = async (values) => {
    try {
      if (editingSection) {
        setSections(
          sections.map((s) =>
            s.id === editingSection.id ? { ...s, ...values } : s
          )
        );
        message.success("Section updated successfully");
      } else {
        const newSection = {
          id: `section-${Date.now()}`,
          ...values,
          orderIndex: sections.length + 1,
          videos: [],
        };
        setSections([...sections, newSection]);
        message.success("Section added successfully");
      }
      setIsSectionModalVisible(false);
      sectionForm.resetFields();
    } catch (error) {
      message.error("Failed to save section");
    }
  };

  const handleDeleteSection = (sectionId) => {
    Modal.confirm({
      title: "Delete Section",
      content:
        "Are you sure you want to delete this section and all its videos?",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        setSections(sections.filter((s) => s.id !== sectionId));
        message.success("Section deleted successfully");
      },
    });
  };

  const handleAddLesson = (sectionId) => {
    setCurrentSectionId(sectionId);
    setEditingVideo(null);
    // videoForm.resetFields();
    // setIsVideoModalVisible(true);
    navigate(path.MENTOR_UPLOAD_LESSON)
  };

  const handleEditVideo = (sectionId, video) => {
    setCurrentSectionId(sectionId);
    setEditingVideo(video);
    videoForm.setFieldsValue(video);
    setIsVideoModalVisible(true);
  };

  const handleSaveVideo = async (values) => {
    try {
      setSections(
        sections.map((section) => {
          if (section.id === currentSectionId) {
            if (editingVideo) {
              return {
                ...section,
                videos: section.videos?.map((v) =>
                  v.id === editingVideo.id ? { ...v, ...values } : v
                ),
              };
            } else {
              const newVideo = {
                id: `video-${Date.now()}`,
                ...values,
                orderIndex: section.videos.length + 1,
              };
              return {
                ...section,
                videos: [...section.videos, newVideo],
              };
            }
          }
          return section;
        })
      );
      message.success(
        editingVideo ? "Video updated successfully" : "Video added successfully"
      );
      setIsVideoModalVisible(false);
      videoForm.resetFields();
    } catch (error) {
      message.error("Failed to save video");
    }
  };

  const handleDeleteVideo = (sectionId, videoId) => {
    Modal.confirm({
      title: "Delete Video",
      content: "Are you sure you want to delete this video?",
      okText: "Delete",
      okType: "danger",
      onOk: () => {
        setSections(
          sections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  videos: section.videos.filter((v) => v.id !== videoId),
                }
              : section
          )
        );
        message.success("Video deleted successfully");
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

  const totalVideos = sections.reduce((sum, s) => sum + s.videos?.length, 0);
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
            <Space>
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
            </Space>
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
          <Collapse accordion className="bg-white" expandIconPosition="end">
            {sections.map((section, index) => (
              <Panel
                key={section.id}
                header={
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
                          {section.videos?.length || 0} videos •{" "}
                          {/* {getTotalDuration(section.videos)} */}
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
                }
              >
                <div className="pl-11">
                  {section.description && (
                    <p className="text-gray-600 mb-4">{section.description}</p>
                  )}

                  {section.videos?.length === 0 ? (
                    <Empty
                      description="No videos in this section"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => handleAddVideo(section.id)}
                      >
                        Add Lesson
                      </Button>
                    </Empty>
                  ) : (
                    <div className="space-y-2">
                      {section.videos?.map((video, vIndex) => (
                        <div
                          key={video.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <PlayCircleOutlined className="text-blue-600 text-lg" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {video.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDuration(video.duration)}
                                {video.description && ` • ${video.description}`}
                              </div>
                            </div>
                          </div>
                          <Space>
                            <Button
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleEditVideo(section.id, video)}
                            />
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() =>
                                handleDeleteVideo(section.id, video.id)
                              }
                            />
                          </Space>
                        </div>
                      ))}
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
              </Panel>
            ))}
          </Collapse>
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
