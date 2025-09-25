import React, { useState, useEffect } from "react";
import Loading from "../common/Loading";
import "chart.js/auto";
import { Bar, Pie } from "react-chartjs-2";
import { Card, Row, Col, Statistic, Progress, Table, Tag } from "antd";
import {
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  RiseOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { BookOpen, Users, TrendingUp, Star, Clock } from "lucide-react";

export const AdminHome = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insructorRatings, setInsructorRatings] = useState([]);

  const activityColumns = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "User",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "success"
            ? "green"
            : status === "pending"
            ? "orange"
            : "red";

        const icon =
          status === "success" ? (
            <CheckCircleOutlined />
          ) : status === "pending" ? (
            <ClockCircleOutlined />
          ) : (
            <ExclamationCircleOutlined />
          );

        return (
          <Tag color={color} icon={icon}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  const recentActivities = [
    {
      key: "1",
      action: "New User Registration",
      user: "John Smith",
      time: "2 minutes ago",
      status: "success",
    },
    {
      key: "2",
      action: "Course Submitted for Review",
      user: "Dr. Sarah Chen",
      time: "15 minutes ago",
      status: "pending",
    },
    {
      key: "3",
      action: "Course Approved",
      user: "Prof. Michael Rodriguez",
      time: "1 hour ago",
      status: "success",
    },
    {
      key: "4",
      action: "Payment Processed",
      user: "Emma Wilson",
      time: "2 hours ago",
      status: "success",
    },
    {
      key: "5",
      action: "Course Rejected",
      user: "Alex Kumar",
      time: "3 hours ago",
      status: "error",
    },
  ];

  const roundStarRating = (rating) => {
    if (rating < 1.25) return 1;
    if (rating < 2.25) return 2;
    if (rating < 3.25) return 3;
    if (rating < 4.25) return 4;
    return 5;
  };

  const starCounts = insructorRatings.reduce(
    (acc, rating) => {
      const star = roundStarRating(rating);
      acc[star - 1] += 1; // -1 vì mảng acc bắt đầu từ index 0
      return acc;
    },
    // [0, 0, 0, 0, 0]
    [21, 2, 50, 20, 66]
  );

  const barData = {
    labels: ["1 Star", "2 Stars", "3 Stars", "4 Stars", "5 Stars"],
    datasets: [
      {
        label: "Number of Instructor",
        backgroundColor: "#4F46E5",
        borderColor: "#3730A3",
        borderWidth: 1,
        hoverBackgroundColor: "#4338CA",
        hoverBorderColor: "#3730A3",
        data: starCounts,
      },
    ],
  };

  const barOptions = {
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Stars",
          font: {
            size: 16,
            weight: "bold",
            family: "Arial, sans-serif",
          },
        },
        beginAtZero: true,
      },
      y: {
        title: {
          display: true,
          text: "Number of Instructors",
          font: {
            size: 16,
            weight: "bold",
            family: "Arial, sans-serif",
          },
        },
        beginAtZero: true,
        ticks: {
          stepSize: 5,
        },
      },
    },
  };

  const pieOptions = {
    maintainAspectRatio: false,
  };
  const pieData = {
    labels: ["Approved ", "Rejected", "Pending"],
    datasets: [
      {
        data: [2, 3, 4],
        backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
        hoverBackgroundColor: ["#059669", "#DC2626", "#D97706"],
      },
    ],
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const coursesColumns = [
    {
      title: "Course Title",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm text-gray-500">by {record.instructor}</div>
        </div>
      ),
    },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
      render: (students) => students.toLocaleString(),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue) => (
        <span className="font-semibold text-green-600">
          ${revenue.toLocaleString()}
        </span>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <div className="flex items-center">
          {rating}
          <span className="ml-1">⭐</span>
        </div>
      ),
    },
    {
      title: "Completion Rate",
      dataIndex: "completion",
      key: "completion",
      render: (completion) => <Progress percent={completion} size="small" />,
    },
  ];

  const topCoursesData = [
    {
      key: "1",
      title: "Advanced React Development",
      instructor: "Dr. Sarah Chen",
      students: 1247,
      revenue: 12470,
      rating: 4.9,
      completion: 87,
    },
    {
      key: "2",
      title: "Python for Beginners",
      instructor: "David Park",
      students: 2103,
      revenue: 12618,
      rating: 4.7,
      completion: 92,
    },
    {
      key: "3",
      title: "Data Analysis with Excel",
      instructor: "Maria Garcia",
      students: 1456,
      revenue: 10192,
      rating: 4.6,
      completion: 89,
    },
    {
      key: "4",
      title: "Machine Learning Fundamentals",
      instructor: "Prof. Michael Rodriguez",
      students: 856,
      revenue: 12840,
      rating: 4.8,
      completion: 78,
    },
    {
      key: "5",
      title: "Digital Marketing Strategy",
      instructor: "Lisa Thompson",
      students: 743,
      revenue: 5944,
      rating: 4.5,
      completion: 85,
    },
  ];

  return (
    <div className="bg-gray-100  rounded-lg shadow-lg m-2">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <Loading />
        </div>
      )}
      {/* <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of platform statistics and recent activities
          </p>
        </div> */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900"></p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Courses
              </p>
              <p className="text-3xl font-bold text-gray-900"></p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +3 new this month
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Approvals
              </p>
              <p className="text-3xl font-bold text-gray-900"></p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <ClockCircleOutlined className="w-4 h-4 mr-1 fill-current" />
                24 course recently
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">$</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 h-3/5 mt-3">
        <div className=" bg-white p-3 rounded-lg shadow-2xl col-span-2 w-7/12">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
            Instructor Ratings
          </h2>
          <div style={{ height: "300px" }}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="bg-white p-3 rounded-lg shadow-2xl col-span-1 w-5/12">
          <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">
            Approve Status
          </h2>
          <div style={{ height: "250px" }}>
            <Pie data={pieData} options={pieOptions} />
          </div>
          <ul className="mt-4 grid grid-cols-3 text-center">
            <li className="text-green-600 font-medium">
              {/* Accepted: {bookingStatus.CONFIRMED > 0 ? ((bookingStatus.CONFIRMED / totalBookings) * 100).toFixed(2) : 0} */}
              60%
            </li>
            <li className="text-red-600 font-medium">
              {/* Rejected: {bookingStatus.CONFIRMED > 0 ? ((bookingStatus.REJECTED / totalBookings) * 100).toFixed(2) : 0} */}
              30%
            </li>
            <li className="text-yellow-600 font-medium">
              {/* Pending: {bookingStatus.CONFIRMED > 0 ? ((bookingStatus.PENDING / totalBookings) * 100).toFixed(2) : 0}% */}
              20%
            </li>
          </ul>
        </div>
      </div>

      {/* Recent Activities */}
      <Row gutter={[16, 16]} className="mt-3">
        <Col span={24}>
          <Card
            title={
              <div className="flex items-center">
                <FileTextOutlined className="mr-2" />
                Top Performing Courses
              </div>
            }
          >
            <Table
              columns={coursesColumns}
              dataSource={topCoursesData}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminHome;
