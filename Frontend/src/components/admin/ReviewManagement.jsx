import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDate } from "../../utils/formatDate";
import {
  getAllReivewsByStatus,
  approveReview,
} from "../../apis/ReviewServices";
import { Card, Table, Input, Button, Tag, Rate } from "antd";
import {
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BookOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { logger } from "../../utils/logger";

const { Search } = Input;

const ReviewManagement = () => {
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [fullReviews, setFullReviews] = useState([]);
  const navigate = useNavigate();

  // Fetch all reviews
  useEffect(() => {
    const fetchAllReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in first!");
          return;
        }

        const response = await getAllReivewsByStatus(token, null);
        const reviewsData = response?.data || [];
        setFullReviews(reviewsData);
      } catch (err) {
        logger.error("Error fetching reviews:", err);
        toast.error("Failed to load reviews");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllReviews();
  }, []);

  const handleApproveReview = useCallback(async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in first!");
        return;
      }

      const response = await approveReview(token, reviewId);
      const successMessage =
        response?.message || "Review approved successfully!";
      toast.success(successMessage);

      // Update the review in state
      if (response?.data) {
        setFullReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId
              ? { ...response.data, status: "active" }
              : review
          )
        );
      } else {
        // Refresh if no data in response
        setFullReviews((prevReviews) =>
          prevReviews.map((review) =>
            review.id === reviewId ? { ...review, status: "active" } : review
          )
        );
      }
    } catch (err) {
      logger.error("Error approving review:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to approve review";
      toast.error(errorMessage);
    }
  }, []);

  // Memoize filtered data
  const filteredData = useMemo(() => {
    return fullReviews.filter((review) => {
      const matchesSearch =
        String(review.id).toLowerCase().includes(searchText.toLowerCase()) ||
        review.course?.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        review.course?.mentor?.user?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        review.reviewText?.toLowerCase().includes(searchText.toLowerCase()) ||
        String(review.learner?.id || "").toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || review.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [fullReviews, searchText, filterStatus]);

  // Memoize status counts
  const statusCounts = useMemo(() => ({
    all: fullReviews.length,
    active: fullReviews.filter((r) => r.status === "active").length,
    inactive: fullReviews.filter((r) => r.status === "inactive").length,
  }), [fullReviews]);

  const columns = useMemo(() => [
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
  ], [handleApproveReview]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Review Management
        </h1>
        <p className="text-gray-600">Manage and moderate course reviews</p>
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
      <Card className="shadow-sm border-0">
        <Table
          columns={columns}
          bordered
          dataSource={filteredData}
          rowKey="id"
          onRow={(record) => ({
            onClick: () =>
              navigate(`/admin/course-management/course-detail/${record.course?.id}`),
            className: "cursor-pointer hover:bg-blue-50 transition-colors",
          })}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} reviews`,
            pageSizeOptions: ["10", "20", "50", "100"],
          }}
          scroll={{ x: "max-content", y: 600 }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ReviewManagement;
