import React, { useState, useEffect } from "react";
// previous static import (kept for reference):
// import { enrolledCourses, allCourses } from "../../utils/mockData";
import { useCourseStore } from "../../store/useCourseStore";
import { getAllCourses } from "../../apis/CourseServices";
import {
  Card,
  Tabs,
  Button,
  Input,
  Select,
  Row,
  Col,
  Progress,
  Rate,
  Tag,
  Avatar,
  Dropdown,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  PlayCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  StarOutlined,
  UserOutlined,
  CaretDownOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Brain } from "lucide-react";

const { Search } = Input;
const { Option } = Select;

export const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-learning");
  const [myLearningFilter, setMyLearningFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  // Use reactive course store (replaces static mock imports)
  const allCourses = useCourseStore((s) => s.allCourses);
  const enrolledCourses = useCourseStore((s) => s.enrolledCourses);

  // Fetch courses from API on mount and populate store
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getAllCourses(0, 100);
        const payload = Array.isArray(data)
          ? data
          : data?.content || data?.data || [];

        const mapped = payload.map((c, idx) => ({
          key: c.key || String(idx + 1),
          id: c.id || c.courseId || c._id || `API_${idx}`,
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
        }));

        if (mounted) useCourseStore.getState().setAllCourses(mapped);
      } catch (err) {
        console.error("getAllCourses failed", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const handleContinueCourse = (courseId) => {
    navigate(`/learner/course-detail/${courseId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "in-progress":
        return <PlayCircleOutlined style={{ color: "#1890ff" }} />;
      case "saved":
        return <HeartOutlined style={{ color: "#ff4d4f" }} />;
      case "completed":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      default:
        return <BookOutlined />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "in-progress":
        return "blue";
      case "saved":
        return "red";
      case "completed":
        return "green";
      default:
        return "default";
    }
  };

  const filteredEnrolledCourses = enrolledCourses.filter((course) => {
    if (myLearningFilter === "all") return true;
    if (myLearningFilter === "in-progress")
      return course.status === "in-progress";
    if (myLearningFilter === "saved") return course.status === "saved";
    if (myLearningFilter === "completed") return course.status === "completed";
    return true;
  });

  const filteredAllCourses = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  const categories = [...new Set(allCourses.map((course) => course.category))];
  const levels = [...new Set(allCourses.map((course) => course.level))];

  const MyLearningTab = () => (
    <div>
      {/* Filter Buttons */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <Button
            type={myLearningFilter === "all" ? "primary" : "default"}
            onClick={() => setMyLearningFilter("all")}
            className={myLearningFilter === "all" ? "bg-blue-600" : ""}
          >
            All ({enrolledCourses.length})
          </Button>
          <Button
            type={myLearningFilter === "in-progress" ? "primary" : "default"}
            icon={<PlayCircleOutlined />}
            onClick={() => setMyLearningFilter("in-progress")}
            className={myLearningFilter === "in-progress" ? "bg-blue-600" : ""}
          >
            In Progress (
            {enrolledCourses.filter((c) => c.status === "in-progress").length})
          </Button>
          <Button
            type={myLearningFilter === "saved" ? "primary" : "default"}
            icon={<HeartOutlined />}
            onClick={() => setMyLearningFilter("saved")}
            className={myLearningFilter === "saved" ? "bg-blue-600" : ""}
          >
            Saved ({enrolledCourses.filter((c) => c.status === "saved").length})
          </Button>
          <Button
            type={myLearningFilter === "completed" ? "primary" : "default"}
            icon={<CheckCircleOutlined />}
            onClick={() => setMyLearningFilter("completed")}
            className={myLearningFilter === "completed" ? "bg-blue-600" : ""}
          >
            Completed (
            {enrolledCourses.filter((c) => c.status === "completed").length})
          </Button>
        </div>
      </div>

      {/* Course Grid */}
      <Row gutter={[16, 16]}>
        {filteredEnrolledCourses.map((course) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={course.key}>
            <Card
              hoverable
              className="h-full flex flex-col"
              cover={
                <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <BookOutlined style={{ fontSize: 48, color: "white" }} />
                </div>
              }
            >
              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <Tag
                    color={getStatusColor(course.status)}
                    icon={getStatusIcon(course.status)}
                  >
                    {course.status.replace("-", " ").toUpperCase()}
                  </Tag>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  by {course.instructor}
                </p>
                <div className="flex items-center mb-2">
                  <Rate
                    disabled
                    defaultValue={course.rating}
                    allowHalf
                    className="text-xs"
                  />
                  <span className="text-sm text-gray-600 ml-2">
                    ({course.rating})
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {course.completedLessons}/{course.totalLessons} lessons •{" "}
                  {course.duration}
                </div>
                <div className="mb-3" style={{ minHeight: "52px" }}>
                  {course.status !== "saved" && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress percent={course.progress} size="small" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Last accessed: {course.lastAccessed}
                </div>
                <div className="mt-auto">
                  <Button
                    type="primary"
                    block
                    size="large"
                    className="bg-blue-600 font-medium"
                    onClick={() => handleContinueCourse(course.id)}
                  >
                    {course.status === "completed"
                      ? "Review"
                      : course.status === "saved"
                      ? "Start Learning"
                      : "Continue"}
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredEnrolledCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
          <h3 className="text-lg text-gray-600 mt-4">No courses found</h3>
          <p className="text-gray-500">
            Try adjusting your filters or explore new courses
          </p>
        </div>
      )}
    </div>
  );

  const AllCoursesTab = () => (
    <div>
      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Search
            placeholder="Search courses by title or instructor"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            className="flex-1"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <div className="flex gap-2">
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              size="large"
              className="w-40"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Categories</Option>
              {categories.map((category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              ))}
            </Select>
            <Select
              value={levelFilter}
              onChange={setLevelFilter}
              size="large"
              className="w-32"
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Levels</Option>
              {levels.map((level) => (
                <Option key={level} value={level}>
                  {level}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Card>

      {/* Course Grid */}
      <Row gutter={[16, 16]}>
        {filteredAllCourses.map((course) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={course.key}>
            <Card
              hoverable
              className="h-full flex flex-col"
              cover={
                <div className="h-40 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center relative">
                  <BookOutlined style={{ fontSize: 48, color: "white" }} />
                  {course.enrolled && (
                    <div className="absolute top-2 right-2">
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        ENROLLED
                      </Tag>
                    </div>
                  )}
                </div>
              }
            >
              <div className="flex flex-col h-full">
                <div className="mb-2">
                  <Tag color="blue">{course.category}</Tag>
                  <Tag color="orange">{course.level}</Tag>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  by {course.instructor}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Rate
                      disabled
                      defaultValue={course.rating}
                      allowHalf
                      className="text-xs"
                    />
                    <span className="text-sm text-gray-600 ml-2">
                      ({course.rating})
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserOutlined className="mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  {course.lessons} lessons • {course.duration}
                </div>
                <div className="mb-4" style={{ minHeight: "28px" }}>
                  {!course.enrolled && (
                    <div className="text-lg font-bold text-green-600">
                      ${course.price}
                    </div>
                  )}
                </div>
                <div className="mt-auto">
                  <Button
                    type={course.enrolled ? "default" : "primary"}
                    block
                    size="large"
                    className={
                      course.enrolled
                        ? "font-medium"
                        : "bg-blue-600 font-medium"
                    }
                    onClick={() =>
                      course.enrolled
                        ? handleContinueCourse(course.id)
                        : navigate(`/learner/course-preview/${course.id}`)
                    }
                  >
                    {course.enrolled
                      ? "Go to Course"
                      : `Enroll - $${course.price}`}
                  </Button>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredAllCourses.length === 0 && (
        <div className="text-center py-12">
          <SearchOutlined style={{ fontSize: 64, color: "#d9d9d9" }} />
          <h3 className="text-lg text-gray-600 mt-4">No courses found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const tabItems = [
    {
      key: "my-learning",
      label: (
        <span className="flex items-center">
          <BookOutlined className="mr-2" />
          My Learning
        </span>
      ),
      children: <MyLearningTab />,
    },
    {
      key: "all-courses",
      label: (
        <span className="flex items-center">
          <SearchOutlined className="mr-2" />
          All Courses
        </span>
      ),
      children: <AllCoursesTab />,
    },
  ];

  return (
    <div className="bg-gray-100 rounded-lg shadow-lg m-2">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Learner!
          </h1>
          <p className="text-gray-600">
            Continue your learning journey or discover new courses
          </p>
        </div>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="custom-tabs"
        />
      </div>
    </div>
  );
};

export default LearnerDashboard;