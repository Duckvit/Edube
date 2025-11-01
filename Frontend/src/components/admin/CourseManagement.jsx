import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/formatDate";
import { getAllCourses, activeCourse } from "../../apis/CourseServices";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Dropdown,
  Modal,
  Rate,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  BookOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PlayCircleOutlined,
  UserOutlined,
  StarOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const CourseManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token không tồn tại");
          return;
        }

        setLoading(true);
        const data = await getAllCourses(currentPage - 1, pageSize, token);
        console.log("📘 API response getAllCourses:", data);

        const coursesData = data?.content || [];
        setAllCourses(coursesData);

        // Set total items từ response (Spring Boot Page format)
        setTotalItems(data?.totalElements || data?.total || 0);
      } catch (err) {
        console.error("Lỗi khi gọi API All Courses:", err);
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, [currentPage, pageSize]);

  const handleActiveCourse = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await activeCourse(id, token);
      toast.success("Active Course successfully!");
    } catch (err) {
      console.error("Lỗi khi kích hoạt:", err);
      toast.error("Active Course failed!");
    }
  };

  const columns = [
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
            onClick={() => {
              e.stopPropagation(); // ngăn click lan ra hàng
              handleActiveCourse(record.id);
            }}
            style={{ marginRight: "10px" }}
          >
            Active
          </Button>
          <Button
            className="!bg-red-500 !text-white !w-full"
            onClick={() => handleDelete(record.user.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredData = allCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      (course.mentor?.user?.fullName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      String(course.id).toLowerCase().includes(searchText.toLowerCase()) ||
      (course.category || "").toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || course.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(allCourses.map((course) => course.category))];

  return (
    <div className="w-full h-full bg-gray-100">
      <h1 className="text-2xl font-bold mb-3 text-gray-800">
        Course Management
      </h1>
      {/* Filters and Search */}
      <Card className="w-full h-full !bg-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4 lg:mb-0">
            <Button
              type={filterStatus === "all" ? "primary" : "default"}
              onClick={() => setFilterStatus("all")}
              className={`${
                filterStatus === "all" ? "bg-blue-600" : "hover:bg-blue-50"
              }`}
            >
              All ({allCourses.length})
            </Button>
            <Button
              type={filterStatus === "approved" ? "primary" : "default"}
              onClick={() =>
                setFilterStatus(
                  filterStatus === "approved" ? "all" : "approved"
                )
              }
              className={`${
                filterStatus === "approved"
                  ? "bg-green-600"
                  : "hover:bg-green-50"
              }`}
            >
              Active ({allCourses.filter((c) => c.status === "active").length})
            </Button>
            <Button
              type={filterStatus === "pending" ? "primary" : "default"}
              onClick={() =>
                setFilterStatus(filterStatus === "pending" ? "all" : "pending")
              }
              className={`${
                filterStatus === "pending"
                  ? "bg-orange-600"
                  : "hover:bg-orange-50"
              }`}
            >
              Pending ({allCourses.filter((c) => c.status === "pending").length}
              )
            </Button>
            <Button
              type={filterStatus === "rejected" ? "primary" : "default"}
              onClick={() =>
                setFilterStatus(
                  filterStatus === "rejected" ? "all" : "rejected"
                )
              }
              className={`${
                filterStatus === "rejected" ? "bg-red-600" : "hover:bg-red-50"
              }`}
            >
              Rejected (
              {allCourses.filter((c) => c.status === "rejected").length})
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

      <Table
        columns={columns}
        bordered
        dataSource={filteredData}
        rowKey="id"
        onRow={(record) => ({
          onClick: () =>
            navigate(`/admin/course-management/course-detail/${record.id}`),
        })}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: totalItems,
          showQuickJumper: true,
          showSizeChanger: false,
          pageSizeOptions: ["10", "20", "50", "100"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} courses`,
          onChange: (page, size) => {
            setCurrentPage(page);
            if (size !== pageSize) {
              setPageSize(size);
              setCurrentPage(1); // Reset về trang 1 khi đổi page size
            }
          },
        }}
        scroll={{ x: "1600px", y: 400 }}
        loading={loading}
      />
    </div>
  );
};

export default CourseManagement;
