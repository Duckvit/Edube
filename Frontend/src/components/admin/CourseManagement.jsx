import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { formatDate } from "../../utils/formatDate";
import {
  getAllCourses,
  activeCourse,
  deleteCourse,
} from "../../apis/CourseServices";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { logger } from "../../utils/logger";

const { Search } = Input;
const { Option } = Select;

const CourseManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [fullCourses, setFullCourses] = useState([]);
  const navigate = useNavigate();

  // Fetch all courses once on mount for filtering
  useEffect(() => {
    const fetchFullCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first!");
          return;
        }
        const data = await getAllCourses(0, 1000, token);
        const coursesData = data?.content || [];
        setFullCourses(coursesData);
      } catch (err) {
        logger.error("Error fetching courses:", err);
        toast.error("Failed to load courses");
      }
    };
    fetchFullCourses();
  }, []);

  const handleActiveCourse = useCallback(async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first!");
        return;
      }
      await activeCourse(token, id);
      toast.success("Course activated successfully!");
      // Update local state
      setFullCourses((prev) =>
        prev.map((course) =>
          course.id === id ? { ...course, status: "active" } : course
        )
      );
    } catch (err) {
      logger.error("Error activating course:", err);
      toast.error(err?.response?.data?.message || "Failed to activate course!");
    }
  }, []);

  const handleDeleteCourse = useCallback(async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in first!");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This course will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await deleteCourse(token, id);
        toast.success("Course deleted successfully!");
        // Update local state
        setFullCourses((prev) => prev.filter((course) => course.id !== id));
      } catch (error) {
        logger.error("Error deleting course:", error);
        toast.error(
          error?.response?.data?.message || "Failed to delete course!"
        );
      }
    }
  }, []);

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return fullCourses.filter((course) => {
      const matchesSearch =
        course.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        course.mentor?.user?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        String(course.id).toLowerCase().includes(searchText.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || course.status === filterStatus;
      const matchesCategory =
        filterCategory === "all" || course.category === filterCategory;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [fullCourses, searchText, filterStatus, filterCategory]);

  // Memoize categories
  const categories = useMemo(() => {
    return [...new Set(fullCourses.map((course) => course.category).filter(Boolean))];
  }, [fullCourses]);

  // Memoize status counts
  const statusCounts = useMemo(() => ({
    all: fullCourses.length,
    active: fullCourses.filter((c) => c.status === "active").length,
    inactive: fullCourses.filter((c) => c.status === "inactive").length,
  }), [fullCourses]);

  const columns = useMemo(() => [
    {
      title: "Course",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <BookOutlined style={{ color: "white", fontSize: 18 }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{text}</div>
            <div className="text-sm text-gray-500">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs mr-2">
                {record.id}
              </span>
              {record.category}
            </div>
          </div>
        </div>
      ),
      width: 300,
    },
    {
      title: "Mentor",
      dataIndex: "mentor",
      key: "mentor",
      render: (mentor) => (
        <div>
          <div className="font-medium text-gray-900">
            {mentor?.user?.fullName || "Unknown"}
          </div>
          {/* <div className="text-sm text-gray-500">{mentor.email || ""}</div> */}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          active: "green",
          inactive: "orange",
          deleted: "red",
        };
        const icons = {
          active: <CheckCircleOutlined />,
          inactive: <CloseCircleOutlined />,
          deleted: <CloseCircleOutlined />,
        };
        return (
          <Tag color={colors[status]} icon={icons[status]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Learners",
      dataIndex: "totalStudents",
      key: "learners",
      render: (totalStudents) => (
        <div className="flex items-center space-x-1">
          <UserOutlined style={{ color: "#9ca3af" }} />
          <span>{totalStudents?.toLocaleString() || 0}</span>
        </div>
      ),
      sorter: (a, b) => a.totalStudents - b.totalStudents,
    },
    // {
    //   title: "Rating",
    //   dataIndex: "rating",
    //   key: "rating",
    //   render: (rating) =>
    //     rating > 0 ? (
    //       <div className="flex items-center">
    //         {rating.toFixed(1)}
    //         <span className="ml-1">⭐</span>
    //       </div>
    //     ) : (
    //       <span className="text-gray-400">No ratings</span>
    //     ),
    //   sorter: (a, b) => a.rating - b.rating,
    // },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-semibold text-green-600">
          {new Intl.NumberFormat("vi-VN").format(price || 0)} VNĐ
        </span>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "Duration",
      key: "duration",
      render: (record) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <PlayCircleOutlined style={{ color: "#9ca3af" }} />
            <span>{record.durationHours} hours</span>
          </div>
          <div className="text-gray-500">{record.totalLessons} lessons</div>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => formatDate(createdAt),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <Button
            className="!bg-blue-500 !text-white w-full"
            onClick={(e) => {
              e.stopPropagation(); // ngăn click lan ra hàng
              handleActiveCourse(record.id);
            }}
            style={{ marginRight: "10px" }}
            disabled={record.status === "active"}
          >
            {record.status === "active" ? "Active" : "Approve"}
          </Button>
          <Button
            className="!bg-red-500 !text-white !w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCourse(record.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], [handleActiveCourse, handleDeleteCourse, navigate]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Course Management
        </h1>
        <p className="text-gray-600">Manage and monitor all courses in the platform</p>
      </div>
      
      {/* Filters and Search */}
      <Card className="mb-6 shadow-sm border-0">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
            <Button
              type={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
              className={`transition-all ${
                filterStatus === "all" 
                  ? "bg-blue-600 hover:bg-blue-700" 
                  : "hover:bg-blue-50 border-blue-200"
              }`}
            >
              All ({statusCounts.all})
            </Button>
            <Button
              type={filterStatus === "active" ? "primary" : "default"}
              onClick={() =>
                setFilterStatus(filterStatus === "active" ? "all" : "active")
              }
              className={`transition-all ${
                filterStatus === "active" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "hover:bg-green-50 border-green-200"
              }`}
            >
              Active ({statusCounts.active})
            </Button>
            <Button
              type={filterStatus === "inactive" ? "primary" : "default"}
              onClick={() =>
                setFilterStatus(
                  filterStatus === "inactive" ? "all" : "inactive"
                )
              }
              className={`transition-all ${
                filterStatus === "inactive" 
                  ? "bg-orange-600 hover:bg-orange-700" 
                  : "hover:bg-orange-50 border-orange-200"
              }`}
            >
              Inactive ({statusCounts.inactive})
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            <Search
              placeholder="Search courses by title, mentor, or ID"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              className="w-full sm:w-80"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="flex gap-2">
              <Select
                value={filterCategory}
                onChange={setFilterCategory}
                size="large"
                className="w-40"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Categories</Option>
                {categories.map((category, index) => (
                  <Option key={category + index} value={category}>
                    {category}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Courses Table */}
      <Card className="shadow-sm border-0">
        <Table
          columns={columns}
          bordered
          dataSource={filteredData}
          rowKey="id"
          onRow={(record) => ({
            onClick: () =>
              navigate(`/admin/course-management/course-detail/${record.id}`),
            className: "cursor-pointer hover:bg-blue-50 transition-colors",
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} courses`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: "max-content", y: 600 }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CourseManagement;
