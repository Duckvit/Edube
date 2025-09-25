import React, { useState } from "react";
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

  const courseData = [
    {
      key: "1",
      id: "CRS001",
      title: "Advanced React Development",
      instructor: "Dr. Sarah Chen",
      instructorEmail: "sarah.chen@university.edu",
      category: "Programming",
      status: "approved",
      students: 1247,
      rating: 4.9,
      price: 99.99,
      duration: "12 hours",
      lessons: 24,
      createdDate: "2023-11-20",
      lastUpdated: "2024-01-15",
    },
    {
      key: "2",
      id: "CRS002",
      title: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Rodriguez",
      instructorEmail: "michael.rodriguez@college.edu",
      category: "Data Science",
      status: "approved",
      students: 856,
      rating: 4.8,
      price: 149.99,
      duration: "18 hours",
      lessons: 32,
      createdDate: "2023-09-05",
      lastUpdated: "2024-01-10",
    },
    {
      key: "3",
      id: "CRS003",
      title: "Digital Marketing Strategy",
      instructor: "Lisa Thompson",
      instructorEmail: "lisa.thompson@business.com",
      category: "Marketing",
      status: "pending",
      students: 0,
      rating: 0,
      price: 79.99,
      duration: "8 hours",
      lessons: 16,
      createdDate: "2024-01-18",
      lastUpdated: "2024-01-18",
    },
    {
      key: "4",
      id: "CRS004",
      title: "Python for Beginners",
      instructor: "David Park",
      instructorEmail: "david.park@tech.com",
      category: "Programming",
      status: "approved",
      students: 2103,
      rating: 4.7,
      price: 59.99,
      duration: "10 hours",
      lessons: 20,
      createdDate: "2023-08-20",
      lastUpdated: "2024-01-12",
    },
    {
      key: "5",
      id: "CRS005",
      title: "Advanced JavaScript Concepts",
      instructor: "Alex Kumar",
      instructorEmail: "alex.kumar@email.com",
      category: "Programming",
      status: "rejected",
      students: 0,
      rating: 0,
      price: 89.99,
      duration: "15 hours",
      lessons: 28,
      createdDate: "2024-01-10",
      lastUpdated: "2024-01-16",
    },
    {
      key: "6",
      id: "CRS006",
      title: "UI/UX Design Principles",
      instructor: "Emma Wilson",
      instructorEmail: "emma.wilson@design.com",
      category: "Design",
      status: "pending",
      students: 0,
      rating: 0,
      price: 119.99,
      duration: "14 hours",
      lessons: 25,
      createdDate: "2024-01-19",
      lastUpdated: "2024-01-19",
    },
    {
      key: "7",
      id: "CRS007",
      title: "Data Analysis with Excel",
      instructor: "Maria Garcia",
      instructorEmail: "maria.garcia@analytics.com",
      category: "Data Science",
      status: "approved",
      students: 1456,
      rating: 4.6,
      price: 69.99,
      duration: "9 hours",
      lessons: 18,
      createdDate: "2023-12-01",
      lastUpdated: "2024-01-08",
    },
    {
      key: "8",
      id: "CRS008",
      title: "Mobile App Development",
      instructor: "John Smith",
      instructorEmail: "john.smith@mobile.com",
      category: "Programming",
      status: "pending",
      students: 0,
      rating: 0,
      price: 129.99,
      duration: "20 hours",
      lessons: 35,
      createdDate: "2024-01-17",
      lastUpdated: "2024-01-17",
    },
  ];

  const getActionItems = (record) => [
    {
      key: "view",
      label: "View Details",
      icon: <EyeOutlined />,
      onClick: () => console.log("View course:", record.id),
    },
    {
      key: "edit",
      label: "Edit Course",
      icon: <EditOutlined />,
      onClick: () => console.log("Edit course:", record.id),
    },
    ...(record.status === "pending"
      ? [
          {
            key: "approve",
            label: "Approve Course",
            icon: <CheckCircleOutlined />,
            onClick: () => console.log("Approve course:", record.id),
          },
          {
            key: "reject",
            label: "Reject Course",
            icon: <CloseCircleOutlined />,
            onClick: () => console.log("Reject course:", record.id),
          },
        ]
      : []),
    {
      key: "delete",
      label: "Delete Course",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: "Delete Course",
          content: `Are you sure you want to delete "${record.title}"?`,
          okText: "Delete",
          okType: "danger",
          onOk: () => console.log("Delete course:", record.id),
        });
      },
    },
  ];

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
      title: "Instructor",
      dataIndex: "instructor",
      key: "instructor",
      render: (text, record) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          <div className="text-sm text-gray-500">{record.instructorEmail}</div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          approved: "green",
          pending: "orange",
          rejected: "red",
        };
        const icons = {
          approved: <CheckCircleOutlined />,
          pending: <CloseCircleOutlined />,
          rejected: <CloseCircleOutlined />,
        };
        return (
          <Tag color={colors[status]} icon={icons[status]}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
      render: (students) => (
        <div className="flex items-center space-x-1">
          <UserOutlined style={{ color: "#9ca3af" }} />
          <span>{students.toLocaleString()}</span>
        </div>
      ),
      sorter: (a, b) => a.students - b.students,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) =>
        rating > 0 ? (
          <div className="flex items-center">
            {rating.toFixed(1)}
            <span className="ml-1">⭐</span>
          </div>
        ) : (
          <span className="text-gray-400">No ratings</span>
        ),
      sorter: (a, b) => a.rating - b.rating,
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price) => (
        <span className="font-semibold text-green-600">${price}</span>
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
            <span>{record.duration}</span>
          </div>
          <div className="text-gray-500">{record.lessons} lessons</div>
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) =>
        new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime(),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <Button
            className="!bg-blue-500 !text-white w-full"
            onClick={() => showUpdateModal(record)}
            style={{ marginRight: "10px" }}
          >
            Update
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

  const filteredData = courseData.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchText.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchText.toLowerCase()) ||
      course.id.toLowerCase().includes(searchText.toLowerCase()) ||
      course.category.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;
    const matchesCategory =
      filterCategory === "all" || course.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = [...new Set(courseData.map((course) => course.category))];

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
              All ({courseData.length})
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
              Approved (
              {courseData.filter((c) => c.status === "approved").length})
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
              Pending ({courseData.filter((c) => c.status === "pending").length}
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
              {courseData.filter((c) => c.status === "rejected").length})
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            <Search
              placeholder="Search courses by title, instructor, or ID"
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
                {categories.map((category) => (
                  <Option key={category} value={category}>
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
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} courses`,
        }}
        scroll={{ x: "1600px", y: 400 }}
        loading={loading}
      />
    </div>
  );
};

export default CourseManagement;
