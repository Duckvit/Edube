import React, { useState, useEffect } from "react";
// previous static import (kept for reference):
// import { enrolledCourses, allCourses } from "../../utils/mockData";
import { getAllCourses } from "../../apis/CourseServices";
import { getEnrollmentByLearnerId } from "../../apis/EnrollmentServices";
import { createPayment } from "../../apis/PaymentServices";
import { toast } from "react-toastify";
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
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Option } = Select;

export const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my-learning");
  const [myLearningFilter, setMyLearningFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [courses, setCourses] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token không tồn tại");
          return;
        }

        setLoading(true);
        const data = await getAllCourses(0, 10, token);
        console.log("📘 API response:", data);

        // ✅ Lưu danh sách khóa học đúng cách
        const coursesData = data?.content || [];
        console.log("📘 Courses data:", coursesData);
        console.log("📘 First course:", coursesData[0]);
        setCourses(coursesData);
        setAllCourses(coursesData);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
      console.log(token);

      if (!token) {
        toast.error("Please log in before enrolling");
        return;
      }

      const payload = { courseId };
      const res = await createPayment(payload, token);

      if (res?.checkoutUrl) {
        toast.success("Redirecting to payment...");
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Failed to create payment link");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error creating payment link");
    }
  };

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
      (course.mentor?.user?.username || "").toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || course.category === categoryFilter;
    const matchesLevel = levelFilter === "all" || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  console.log("📘 All courses:", allCourses);
  console.log("📘 Filtered courses:", filteredAllCourses);

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
              styles={{
                body: {
                  padding: "16px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
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
                <p className="text-sm text-gray-600 mb-2">by {course.mentor}</p>
                {/* <div className="flex items-center mb-2">
                  <Rate
                    disabled
                    defaultValue={course.rating}
                    allowHalf
                    className="text-xs"
                  />
                  <span className="text-sm text-gray-600 ml-2">
                    ({course.rating})
                  </span>
                </div> */}
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
              styles={{
                body: {
                  padding: "16px",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
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
                  by {course?.mentor?.user?.username}
                </p>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-600 mb-1">
                    {course?.sections?.length || 0} sections •{/* {course.duration} */}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserOutlined className="mr-1" />
                    {course?.totalStudents || 0}
                  </div>
                </div>

                {course.description && (
                  <div className="text-sm text-gray-700 mb-2 line-clamp-2">
                    {course.description}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  {course.status && (
                    <Tag color="geekblue">
                      {String(course.status).toUpperCase()}
                    </Tag>
                  )}
                  {course.createdAt && (
                    <span>
                      Created {new Date(course.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div className="mb-4" style={{ minHeight: "28px" }}>
                  {!course.enrolled && (
                    <div className="text-lg font-bold text-green-600">
                      {course.price}
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
                        : handleEnroll(course.id)
                    }
                  >
                    {course.enrolled ? "Go to Course" : `Enroll `}
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
