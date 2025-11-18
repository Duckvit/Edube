import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/formatDate";
import {
  getAllReivewsByStatus,
  approveReview,
} from "../../apis/ReviewServices";
import { Card, Table, Input, Select, Button, Tag, Rate } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  StarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const ReviewManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [fullReviews, setFullReviews] = useState([]);
  const navigate = useNavigate();

  // Fetch all reviews
  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first!");
        return;
      }

      // Fetch all reviews (no status filter to get all)
      const response = await getAllReivewsByStatus(token, null);
      const reviewsData = response?.data || [];
      setFullReviews(reviewsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first!");
        return;
      }

      setLoading(true);
      const response = await approveReview(token, reviewId);

      // Show success message from API or default message
      const successMessage =
        response?.message || "Review approved successfully!";
      toast.success(successMessage);

      // Update the review in state directly if response contains updated review data
      if (response?.data) {
        setFullReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...response.data, status: "active" }
              : review
          )
        );
      } else {
        // If no data in response, refresh all reviews
        await fetchAllReviews();
      }
    } catch (err) {
      console.error("Error approving review:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to approve review";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => (
        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
          {id}
        </span>
      ),
    },
    {
      title: "Learner",
      dataIndex: "learner",
      key: "learner",
      render: (learner) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <UserOutlined style={{ color: "white", fontSize: 14 }} />
          </div>
          <span className="font-medium">ID: {learner?.id || "N/A"}</span>
        </div>
      ),
      width: 120,
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      render: (course) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <BookOutlined style={{ color: "white", fontSize: 16 }} />
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {course?.title || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              Mentor: {course?.mentor?.user?.fullName || "N/A"}
            </div>
          </div>
        </div>
      ),
      width: 300,
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <div className="flex items-center space-x-2">
          <Rate disabled defaultValue={rating || 0} className="text-sm" />
          <span className="font-semibold text-gray-700">{rating || 0}/5</span>
        </div>
      ),
      width: 150,
      sorter: (a, b) => (a.rating || 0) - (b.rating || 0),
    },
    {
      title: "Review Text",
      dataIndex: "reviewText",
      key: "reviewText",
      render: (text) => (
        <div className="max-w-md">
          <p className="text-sm text-gray-700 line-clamp-2">
            {text || "No review text"}
          </p>
        </div>
      ),
      width: 300,
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
            {status?.toUpperCase() || "N/A"}
          </Tag>
        );
      },
      width: 120,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => formatDate(createdAt),
      width: 150,
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <Button
            className="!bg-blue-500 !text-white w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleApproveReview(record.id);
            }}
            disabled={record.status === "active"}
            icon={<CheckCircleOutlined />}
          >
            {record.status === "active" ? "Approved" : "Approve"}
          </Button>
        </div>
      ),
    },
  ];

  // Filter reviews based on search and status
  const filteredData = fullReviews.filter((review) => {
    const matchesSearch =
      String(review.id).toLowerCase().includes(searchText.toLowerCase()) ||
      (review.course?.title || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (review.course?.mentor?.user?.fullName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      (review.reviewText || "")
        .toLowerCase()
        .includes(searchText.toLowerCase()) ||
      String(review.learner?.id || "")
        .toLowerCase()
        .includes(searchText.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || review.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: fullReviews.length,
    active: fullReviews.filter((r) => r.status === "active").length,
    inactive: fullReviews.filter((r) => r.status === "inactive").length,
  };

  return (
    <div className="w-full h-full bg-gray-100">
      <h1 className="text-2xl font-bold mb-3 text-gray-800">
        Review Management
      </h1>

      {/* Filters and Search */}
      <Card className="w-full h-full !bg-gray-100 mb-4">
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
              All ({statusCounts.all})
            </Button>
            <Button
              type={filterStatus === "active" ? "primary" : "default"}
              onClick={() =>
                setFilterStatus(filterStatus === "active" ? "all" : "active")
              }
              className={`${
                filterStatus === "active" ? "bg-green-600" : "hover:bg-green-50"
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
              className={`${
                filterStatus === "inactive"
                  ? "bg-orange-600"
                  : "hover:bg-orange-50"
              }`}
            >
              Inactive ({statusCounts.inactive})
            </Button>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
            <Search
              placeholder="Search by ID, course, mentor, learner, or review text"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              className="w-full sm:w-80"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Reviews Table */}
      <Table
        columns={columns}
        bordered
        dataSource={filteredData}
        rowKey="id"
        onRow={(record) => ({
          onClick: () =>
            navigate(`/admin/course-management/course-detail/${record.course?.id}`),
        })}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} reviews`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
        scroll={{ x: "1600px", y: 400 }}
        loading={loading}
      />
    </div>
  );
};

export default ReviewManagement;
