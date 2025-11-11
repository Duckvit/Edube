import React, { useState, useEffect } from "react";
import Loading from "../common/Loading";
import "chart.js/auto";
import { Pie } from "react-chartjs-2";
import { Card, Table, Tag } from "antd";
import {
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { BookOpen, Users, TrendingUp } from "lucide-react";
import { getAllCourses } from "../../apis/CourseServices";
import { formatDate } from "../../utils/formatDate";

export const AdminHome = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Statistics state
  const [statistics, setStatistics] = useState({
    totalCourses: 0,
    activeCourses: 0,
    inactiveCourses: 0,
    totalLearners: 0,
    totalMentors: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  
  const [allCourses, setAllCourses] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [courseStatusData, setCourseStatusData] = useState({ active: 0, inactive: 0 });
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch all courses and calculate statistics
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token không tồn tại");
          return;
        }

        // Fetch all courses (get a large number to calculate stats)
        const coursesResponse = await getAllCourses(0, 1000, token);
        const courses = coursesResponse?.content || [];
        setAllCourses(courses);

        // Calculate statistics
        const totalCourses = courses.length;
        const statusCounts = courses.reduce(
          (acc, course) => {
            const status = (course.status || "").toLowerCase();
            if (status === "active") {
              acc.active += 1;
            } else if (status === "inactive") {
              acc.inactive += 1;
            }
            return acc;
          },
          { active: 0, inactive: 0 }
        );
        const activeCourses = statusCounts.active;
        const inactiveCourses = statusCounts.inactive;

        // Get unique mentors
        const uniqueMentors = new Set(courses.map(c => c.mentor?.id).filter(Boolean));
        const totalMentors = uniqueMentors.size;

        // Calculate total students (sum of totalStudents from all courses)
        const totalLearners = courses.reduce((sum, course) => sum + (course.totalStudents || 0), 0);

        // Calculate revenue (sum of price * totalStudents, assuming all enrolled students paid)
        const totalRevenue = courses.reduce((sum, course) => {
          const revenue = (course.price || 0) * (course.totalStudents || 0);
          return sum + revenue;
        }, 0);

        // Get unique learners (this is approximate - actual count would need API)
        // For now, we'll use totalStudents as approximation
        const estimatedTotalUsers = totalMentors + totalLearners;

        setStatistics({
          totalCourses,
          activeCourses,
          inactiveCourses,
          totalLearners: Math.max(totalLearners, estimatedTotalUsers - totalMentors),
          totalMentors,
          totalUsers: estimatedTotalUsers,
          totalRevenue,
        });

        // Calculate course status distribution (only active and inactive)
        setCourseStatusData(statusCounts);

        // Get top courses by enrollment (totalStudents)
        const sortedCourses = [...courses]
          .sort((a, b) => (b.totalStudents || 0) - (a.totalStudents || 0))
          .slice(0, 5)
          .map((course, index) => ({
            key: String(index + 1),
            title: course.title,
            mentor: course.mentor?.user?.fullName || "Unknown",
            students: course.totalStudents || 0,
            revenue: (course.price || 0) * (course.totalStudents || 0),
            status: course.status,
          }));
        setTopCourses(sortedCourses);

        // Generate recent activities from courses
        const activities = courses
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((course, index) => ({
            key: String(index + 1),
            action: course.status?.toLowerCase() === "active"
              ? "Course Active"
              : "Course Created",
            user: course.mentor?.user?.fullName || "Unknown",
            time: formatDate(course.createdAt),
            status: course.status?.toLowerCase() === "active" ? "success" : "pending",
          }));
        setRecentActivities(activities);

      } catch (err) {
        console.error("Lỗi khi fetch dashboard data:", err);
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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



  const pieOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12,
            weight: 'bold',
          },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 12,
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };
  const pieData = {
    labels: ["Active", "Inactive"],
    datasets: [
      {
        data: [
          courseStatusData.active,
          courseStatusData.inactive,
        ],
        backgroundColor: ["#10B981", "#F59E0B"],
        hoverBackgroundColor: ["#059669", "#D97706"],
      },
    ],
  };

  const totalCourseStatus = courseStatusData.active + courseStatusData.inactive;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationCircleOutlined className="text-3xl text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Error</h3>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const coursesColumns = [
    {
      title: "Course Title",
      dataIndex: "title",
      key: "title",
      render: (title, record) => (
        <div className="py-2">
          <div className="font-semibold text-gray-800 text-sm mb-1">{title}</div>
          <div className="text-xs text-gray-500 flex items-center">
            <UserOutlined className="mr-1" />
            {record.mentor}
          </div>
        </div>
      ),
    },
    {
      title: "Students",
      dataIndex: "students",
      key: "students",
      render: (students) => (
        <div className="flex items-center">
          <TeamOutlined className="mr-2 text-blue-500" />
          <span className="font-semibold">{students.toLocaleString()}</span>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "revenue",
      key: "revenue",
      render: (revenue) => (
        <span className="font-bold text-green-600">
          {new Intl.NumberFormat("vi-VN").format(revenue)} VNĐ
        </span>
      ),
    },
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-80 backdrop-blur-sm">
          <Loading />
        </div>
      )}
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Overview of platform statistics and recent activities
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Users Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.totalUsers.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 flex items-center mt-1">
                <TeamOutlined className="w-4 h-4 mr-1" />
                {statistics.totalMentors} mentors, {statistics.totalLearners} learners
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Courses Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Courses
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {statistics.totalCourses}
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircleOutlined className="w-4 h-4 mr-1" />
                {statistics.activeCourses} active
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat("vi-VN").format(statistics.totalRevenue)} VNĐ
              </p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <DollarOutlined className="w-4 h-4 mr-1" />
                Estimated from enrollments
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Tables Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Performing Courses */}
        <div className="lg:col-span-2">
          <Card
            className="shadow-xl border-0 rounded-2xl"
            title={
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mr-3">
                  <TrophyOutlined className="text-white text-lg" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 m-0">Top Performing Courses</h3>
                  <p className="text-xs text-gray-500 m-0">Most enrolled courses</p>
                </div>
              </div>
            }
            bodyStyle={{ padding: '20px' }}
          >
            <Table
              columns={coursesColumns}
              dataSource={topCourses}
              pagination={false}
              size="middle"
              locale={{
                emptyText: (
                  <div className="text-center py-8">
                    <BookOutlined className="text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">No courses available</p>
                  </div>
                ),
              }}
              rowClassName="hover:bg-gray-50 transition-colors"
            />
          </Card>
        </div>

        {/* Course Status Chart - Compact */}
        <div className="lg:col-span-1">
          <Card
            className="shadow-xl border-0 rounded-2xl h-full"
            title={
              <div>
                <h3 className="text-lg font-bold text-gray-800 m-0">Course Status</h3>
                <p className="text-xs text-gray-500 m-0 mt-1">Distribution overview</p>
              </div>
            }
            bodyStyle={{ padding: '20px' }}
          >
            <div style={{ height: "200px" }} className="flex items-center justify-center mb-4">
              <Pie data={pieData} options={pieOptions} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-medium text-gray-700 text-sm">Active</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-green-600">
                    {courseStatusData.active}
                  </p>
                  <p className="text-xs text-gray-500">
                    {totalCourseStatus > 0 
                      ? ((courseStatusData.active / totalCourseStatus) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="font-medium text-gray-700 text-sm">Inactive</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-600">
                    {courseStatusData.inactive}
                  </p>
                  <p className="text-xs text-gray-500">
                    {totalCourseStatus > 0 
                      ? ((courseStatusData.inactive / totalCourseStatus) * 100).toFixed(1) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="mt-6">
        <Card
          className="shadow-xl border-0 rounded-2xl"
          title={
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <ClockCircleOutlined className="text-white text-lg" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 m-0">Recent Activities</h3>
                <p className="text-xs text-gray-500 m-0">Latest updates</p>
              </div>
            </div>
          }
          bodyStyle={{ padding: '20px' }}
        >
          <Table
            columns={activityColumns}
            dataSource={recentActivities}
            pagination={false}
            size="small"
            locale={{
              emptyText: (
                <div className="text-center py-8">
                  <ClockCircleOutlined className="text-4xl text-gray-300 mb-2" />
                  <p className="text-gray-500">No recent activities</p>
                </div>
              ),
            }}
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
