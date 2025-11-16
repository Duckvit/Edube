import React, { useState, useEffect, useRef, useMemo } from "react";
import { getAllCourses } from "../../apis/CourseServices";
import { createPayment } from "../../apis/PaymentServices";
import {
  getEnrollmentsByLearner,
  createFreeEnrollments,
} from "../../apis/EnrollmentServices";
import { getLessonProgressByEnrollment } from "../../apis/LessonProgressServices";
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
import { useNavigate, useLocation } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { Brain } from "lucide-react";

const { Option } = Select;

export const LearnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  const userData = useUserStore((s) => s.userData);
  const searchInputRef = useRef(null);

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    // Đảm bảo input vẫn có focus
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 0);
  };

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
        console.log("📘 API response getAllCourses:", data);

        const coursesData = data?.content || [];
        setAllCourses(coursesData);
      } catch (err) {
        console.error("Lỗi khi gọi API All Courses:", err);
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  // fetch enrollments and map them to component state; exported so other handlers can call
  const fetchEnrollCourses = async () => {
    try {
      const token = localStorage.getItem("token");
      const learnerId = userData?.learner?.id;
      console.log("userData", userData);
      if (!token || !learnerId) {
        setError("Thiếu token hoặc learnerId");
        return;
      }

      setLoading(true);
      const data = await getEnrollmentsByLearner(learnerId, token);
      console.log("📘 Enrolled Courses API response:", data);

      // Dữ liệu API trả về là 1 array chứa enrollments
      const enrollments = Array.isArray(data)
        ? data
        : data?.content || data?.data || [];

      // get completed counts for each enrollment in parallel
      const completedCounts = await Promise.all(
        enrollments.map(async (enroll) => {
          try {
            const lp = await getLessonProgressByEnrollment(enroll.id, token);
            const list = Array.isArray(lp) ? lp : lp?.content || lp?.data || [];
            return list.filter((p) => p.completed === true).length;
          } catch (e) {
            // fallback to any server-provided field
            return enroll.completedLessons || 0;
          }
        })
      );

      // ✅ Map để lấy ra thông tin course trong từng enrollment
      const mappedCourses = enrollments.map((enroll, idx) => {
        const c = enroll.course;
        // normalize server status values to FE-friendly ones
        const rawStatus = String(enroll.status || "").toLowerCase();
        const status = rawStatus === "active" ? "in-progress" : rawStatus;
        return {
          enrollmentId: enroll.id,
          id: c.id,
          title: c.title || "Untitled Course",
          mentor: c.mentor?.user?.fullName || "Unknown",
          category: c.category || "General",
          level: c.level || "All",
          price: c.price || 0,
          students: c.totalStudents || 0,
          duration: c.durationHours ? `${c.durationHours}h` : "",
          lessons: c.totalLessons || 0,
          thumbnail: c.thumbnail || c.image || null,
          completedLessons:
            completedCounts[idx] || enroll.completedLessons || 0,
          progress: enroll.progressPercentage || 0,
          status: status,
          enrolledAt: enroll.enrollmentDate,
        };
      });

      setEnrolledCourses(mappedCourses);
      console.log("✅ mapped enrolled courses:", mappedCourses);
    } catch (err) {
      console.error("Lỗi khi gọi API Enrolled Courses:", err);
      setError(err.message || "Đã xảy ra lỗi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // initial load
    fetchEnrollCourses();

    // If navigated here with a tab in location.state, activate it
    try {
      const tabFromNav = location?.state?.tab;
      if (tabFromNav) setActiveTab(tabFromNav);
    } catch (e) {
      // ignore
    }

    // listen to enrollment changes from other parts of the app (CourseDetail)
    const handler = (e) => {
      console.log("Received enrollment:updated event", e?.detail);
      fetchEnrollCourses();
    };
    window.addEventListener("enrollment:updated", handler);
    return () => {
      window.removeEventListener("enrollment:updated", handler);
    };
  }, [userData, location]);

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

  const handleContinueCourse = (courseId, enrollmentId) => {
    // Prefer passing enrollmentId so CourseDetail can load the correct enrollment context
    // If we have an enrollment for this course in the mapped list, pass it along
    const match = enrolledCourses.find(
      (c) => String(c.enrollmentId) === String(enrollmentId)
    );
    console.log("Matched enrollment for courseId", enrollmentId, ":", match);
    const eid = match ? match.enrollmentId : null;
    if (eid) {
      navigate(`/learner/course-detail/${courseId}`, {
        state: { enrollmentId: eid },
      });
      console.log("Navigating with enrollmentId:", eid);
    } else {
      navigate(`/learner/course-detail/${courseId}`);
      console.log("Navigating without enrollmentId");
    }
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

  console.log("📘 Filtered enrolled courses:", filteredEnrolledCourses);
  const filteredAllCourses = useMemo(() => {
    return allCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchText.toLowerCase()) ||
        (course.mentor?.user?.username || "")
          .toLowerCase()
          .includes(searchText.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || course.category === categoryFilter;
      const matchesLevel =
        levelFilter === "all" || course.level === levelFilter;

      return matchesSearch && matchesCategory && matchesLevel;
    });
  }, [allCourses, searchText, categoryFilter, levelFilter]);

  //   // exclude courses the learner already enrolled in
  //   const enrolledIds = new Set((enrolledCourses || []).map((c) => c.id));
  //   return allCourses
  //     .filter((course) => !enrolledIds.has(course.id))
  //     .filter((course) => {
  //       const matchesSearch =
  //         course.title.toLowerCase().includes(searchText.toLowerCase()) ||
  //         (course.mentor?.user?.username || "")
  //           .toLowerCase()
  //           .includes(searchText.toLowerCase());
  //       const matchesCategory =
  //         categoryFilter === "all" || course.category === categoryFilter;
  //       const matchesLevel =
  //         levelFilter === "all" || course.level === levelFilter;

  //       return matchesSearch && matchesCategory && matchesLevel;
  //     });
  // }, [allCourses, searchText, categoryFilter, levelFilter, enrolledCourses]);

  // console.log("📘 All courses:", allCourses);
  // console.log("📘 Filtered courses:", filteredAllCourses);

  const categories = React.useMemo(() => {
    const s = new Set();
    allCourses.forEach((course) => {
      if (Array.isArray(course.category)) {
        course.category.forEach((c) => c && s.add(c));
      } else if (course.category) {
        s.add(course.category);
      }
    });
    return Array.from(s);
  }, [allCourses]);

  const levels = React.useMemo(() => {
    const s = new Set();
    allCourses.forEach((course) => {
      if (course.level) s.add(course.level);
    });
    return Array.from(s);
  }, [allCourses]);

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
        {filteredEnrolledCourses.map((enroll) => (
          <Col
            xs={24}
            sm={12}
            lg={8}
            xl={6}
            key={enroll.enrollmentId} //|| enroll.id}
          >
            <Card
              hoverable
              className="h-full flex flex-col"
              cover={
                // use shared thumbnail image for course cover
                <img
                  src="/Course_Thumbnail.png"
                  alt="Course Thumbnail"
                  className="w-full h-40 object-cover rounded-t-lg"
                />
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
                    color={getStatusColor(enroll.status)}
                    icon={getStatusIcon(enroll.status)}
                  >
                    {enroll.status.replace("-", " ").toUpperCase()}
                  </Tag>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {enroll.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">by {enroll.mentor}</p>
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
                {/* <div className="text-sm text-gray-600 mb-3">
                  {enroll.completedLessons || 0}/{enroll.lessons} lessons •{" "}
                  {enroll.duration}
                </div> */}
                <div className="mb-3" style={{ minHeight: "52px" }}>
                  {enroll.status !== "saved" && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{enroll.progress}%</span>
                      </div>
                      <Progress percent={enroll.progress} size="small" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-4">
                  Enrolled at:{" "}
                  {enroll.enrolledAt ? enroll.enrolledAt.slice(0, 10) : "N/A"}
                </div>
                <div className="mt-auto">
                  <Button
                    type="primary"
                    block
                    size="large"
                    className="bg-blue-600 font-medium"
                    onClick={() =>
                      handleContinueCourse(enroll.id, enroll.enrollmentId)
                    }
                  >
                    {enroll.status === "completed"
                      ? "Review"
                      : enroll.status === "saved"
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

  const AllCoursesTab = React.memo(() => (
    <div>
      {/* Search and Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Input
            ref={searchInputRef}
            placeholder="Search courses by title or instructor"
            allowClear
            prefix={<SearchOutlined />}
            size="large"
            className="flex-1"
            value={searchText}
            onChange={handleSearchChange}
            onPressEnter={() => {
              // Giữ focus sau khi nhấn Enter
              if (searchInputRef.current) {
                searchInputRef.current.focus();
              }
            }}
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
              {categories.filter(Boolean).map((category) => (
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
              {levels.filter(Boolean).map((level) => (
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
          <Col xs={24} sm={12} lg={8} xl={6} key={course.id}>
            <Card
              hoverable
              className="h-full flex flex-col"
              cover={
                <div className="relative">
                  <img
                    src="/Course_Thumbnail.png"
                    alt="Course Thumbnail"
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
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
                  <Tag color="blue">
                    {Array.isArray(course.category)
                      ? course.category.join(", ")
                      : course.category}
                  </Tag>
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
                    {course?.sections?.length || 0} sections •
                    {/* {course.duration} */}
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
                <div
                  className="mb-4 flex justify-center items-center"
                  style={{ minHeight: "28px" }}
                >
                  {!course.enrolled && (
                    <div className="text-lg font-bold text-green-600">
                      {new Intl.NumberFormat("vi-VN").format(course.price || 0)}{" "}
                      VNĐ
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
  ));

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
            Welcome back,{" "}
            {userData?.fullName || userData?.username || "Learner"}!
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
