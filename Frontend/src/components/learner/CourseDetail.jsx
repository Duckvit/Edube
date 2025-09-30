import React, { useState } from "react";
import { courseData } from "../../utils/mockData";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Tabs,
  Button,
  Progress,
  List,
  Avatar,
  Input,
  Rate,
  Collapse,
  Typography,
} from "antd";
import {
  PlayCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  DownloadOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Panel } = Collapse;

const CourseDetail = () => {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentLesson, setCurrentLesson] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const course = courseData[courseId] || courseData.CRS001;

  const OverviewTab = () => (
    <div className="space-y-6">
      <Card title="About this course">
        <Paragraph className="text-gray-600 text-base leading-relaxed">
          {course.description}
        </Paragraph>
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

      <Card title="Instructor">
        <div className="flex items-center space-x-4">
          <Avatar
            size={64}
            icon={<UserOutlined />}
            className="bg-gradient-to-r from-purple-600 to-blue-600 !mr-3"
          />
          <div>
            <h3 className="text-lg font-semibold">{course.instructor}</h3>
            <p className="text-gray-600">Senior Software Engineer & Educator</p>
            <Rate disabled defaultValue={5} className="text-sm mt-1" />
          </div>
        </div>
      </Card>
    </div>
  );

  const MaterialsTab = () => (
    <Card title="Course Materials">
      <List
        dataSource={course.materials}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                className="bg-blue-600"
              >
                Download
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                <FileTextOutlined style={{ fontSize: 24, color: "#1890ff" }} />
              }
              title={item.name}
              description={`${item.type} • ${item.size}`}
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const NotesTab = () => (
    <div className="space-y-4">
      <Card title="My Notes">
        <TextArea
          rows={4}
          placeholder="Add a note about this lesson..."
          className="mb-4"
        />
        <Button type="primary" className="bg-blue-600">
          Save Note
        </Button>
      </Card>

      <Card title="Previous Notes">
        <List
          dataSource={course.notes}
          renderItem={(note) => (
            <List.Item>
              <List.Item.Meta
                title={<span className="text-blue-600">{note.lesson}</span>}
                description={
                  <div>
                    <p className="mb-2">{note.content}</p>
                    <span className="text-xs text-gray-500">
                      {note.timestamp}
                    </span>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  const QATab = () => (
    <div className="space-y-4">
      <Card title="Ask a Question">
        <TextArea
          rows={3}
          placeholder="Ask your question here..."
          className="mb-4"
        />
        <Button type="primary" className="bg-blue-600">
          Post Question
        </Button>
      </Card>

      <Card title="Questions & Answers">
        <List
          dataSource={course.qna}
          renderItem={(item) => (
            <List.Item>
              <div className="w-full">
                <div className="mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {item.question}
                  </h4>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg mb-2">
                  <p className="text-gray-700">{item.answer}</p>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Answered by {item.author}</span>
                  <div className="flex items-center space-x-4">
                    <span>{item.timestamp}</span>
                    <span>👍 {item.likes}</span>
                  </div>
                </div>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );

  const tabItems = [
    {
      key: "overview",
      label: "Overview",
      children: <OverviewTab />,
    },
    {
      key: "materials",
      label: "Materials",
      children: <MaterialsTab />,
    },
    {
      key: "notes",
      label: "Notes",
      children: <NotesTab />,
    },
    {
      key: "qa",
      label: "Q&A",
      children: <QATab />,
    },
  ];

  const handleTimeUpdate = (e) => {
    const video = e.target;
    const percent = (video.currentTime / video.duration) * 100;
    setProgress(percent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Course Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <button
                onClick={() => navigate("/learner")}
                className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer"
              >
                <ArrowLeftOutlined />
                Back to Dashboard
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
            <div className="mt-4 md:mt-0">
              <div className="text-right mb-2">
                <span className="text-sm text-gray-600">
                  {course.completedLessons} of {course.totalLessons} lessons
                  completed
                </span>
              </div>
              <Progress percent={course.progress} className="w-64" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <div
                className={`aspect-video rounded-lg flex flex-col items-center justify-center mb-4 
    ${!isPlaying ? "bg-black" : ""}`}
              >
                {!isPlaying ? (
                  // Thumbnail + nút play
                  <div
                    className="flex flex-col items-center justify-center text-white cursor-pointer"
                    onClick={() => setIsPlaying(true)}
                  >
                    <PlayCircleOutlined style={{ fontSize: 64 }} />
                    <p className="mt-4 text-lg font-semibold">Video Player</p>
                    <p className="text-sm opacity-75">
                      Lesson {currentLesson + 1}:{" "}
                      {course.curriculum[0]?.lessons[currentLesson]?.title}
                    </p>
                  </div>
                ) : (
                  // Khi click play thì hiện video
                  <div className="w-full">
                    <video
                      width="100%"
                      height="100%"
                      controls
                      autoPlay
                      onTimeUpdate={handleTimeUpdate}
                      className="rounded-lg"
                      src="https://www.w3schools.com/html/mov_bbb.mp4"
                    >
                      Trình duyệt không hỗ trợ video.
                    </video>

                    {/* Hiện progress */}
                    {/* <div className="w-1/2 mt-4 mx-auto">
                      <Progress percent={Math.round(progress)} />
                    </div> */}
                  </div>
                )}
              </div>
            </Card>

            {/* Tabs */}
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={tabItems}
              size="large"
            />
          </div>

          {/* Curriculum Sidebar */}
          <div className="lg:col-span-1">
            <Card title="Course Curriculum" className="sticky top-4">
              <Collapse
                accordion
                items={course.curriculum.map((section, sectionIndex) => ({
                  key: sectionIndex,
                  label: (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{section.section}</span>
                      <span className="text-sm text-gray-500">
                        {section.lessons.filter((l) => l.completed).length}/
                        {section.lessons.length}
                      </span>
                    </div>
                  ),
                  children: (
                    <List
                      dataSource={section.lessons}
                      renderItem={(lesson, index) => (
                        <List.Item
                          className={`cursor-pointer hover:bg-gray-50 px-2 py-3 rounded ${
                            lesson.locked ? "opacity-50" : ""
                          }`}
                          onClick={() =>
                            !lesson.locked && setCurrentLesson(index)
                          }
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center space-x-3">
                              {lesson.locked ? (
                                <LockOutlined className="text-gray-400" />
                              ) : lesson.completed ? (
                                <CheckCircleOutlined className="text-green-500" />
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
                          </div>
                        </List.Item>
                      )}
                    />
                  ),
                }))}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
