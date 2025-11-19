import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../common/Loading";
import { statsData, activitiesData } from "../../utils/mockData";
import { BookOpen, Users, Star, FileText } from "lucide-react";
import { getAllActiveCoursesByMentorId } from "../../apis/CourseServices";
import { getConversations, getMessages } from "../../apis/ChatServices";
import { getAvgRating } from "../../apis/ReviewServices";
import { useUserStore } from "../../store/useUserStore";
import { toast } from "react-toastify";
import { parseJwt } from "../../utils/jwt";
import { path } from "../../utils/path";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [messages, setMessages] = useState([]);
  const [totalActiveCourses, setTotalActiveCourses] = useState(0);
  const [totalLearners, setTotalLearners] = useState(0);
  const [courseRatings, setCourseRatings] = useState({});
  const [error, setError] = useState(null);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { userData, token, role } = useUserStore();

  // Helper: Get current user ID
  const getCurrentUserId = () => {
    const jwtToken = localStorage.getItem("token");
    if (userData?.id) return Number(userData.id);
    if (userData?.mentor?.id) return Number(userData.mentor.id);
    if (userData?.learner?.id) return Number(userData.learner.id);
    if (jwtToken) {
      try {
        const decoded = parseJwt(jwtToken);
        if (decoded?.userId) return Number(decoded.userId);
      } catch (e) {
        console.warn("Failed to parse JWT:", e);
      }
    }
    return null;
  };

  // Helper: Fetch latest message for a conversation
  const fetchLatestMessage = async (conversationId) => {
    try {
      const jwtToken = localStorage.getItem("token");
      if (!jwtToken || !conversationId) return null;
      const response = await getMessages(conversationId, 0, 1);
      const messagesList = response?.chatMessages || [];
      
      if (response?.statusCode === 204 || messagesList.length === 0) {
        return null;
      }
      
      // Return the first (latest) message
      return messagesList[0];
    } catch (error) {
      console.error(`Error fetching latest message for conversation ${conversationId}:`, error);
      return null;
    }
  };

  // Load recent messages
  const loadRecentMessages = async () => {
    try {
      setLoadingMessages(true);
      const jwtToken = localStorage.getItem("token");
      if (!jwtToken) {
        setRecentMessages([]);
        return;
      }

      const userId = getCurrentUserId();
      if (!userId) {
        setRecentMessages([]);
        return;
      }

      const response = await getConversations(userId, 0, 10);
      const conversationsList = response?.chatConversations || [];

      if (response?.statusCode === 204 || conversationsList.length === 0) {
        setRecentMessages([]);
        return;
      }

      // Fetch latest message for each conversation
      const messagesWithLatest = await Promise.all(
        conversationsList.map(async (conv) => {
          const latestMessage = await fetchLatestMessage(conv.id);
          if (!latestMessage) return null;

          // Get other participant name
          const currentUserId = getCurrentUserId();
          const otherParticipant =
            conv.mentor?.user?.id === currentUserId
              ? conv.learner
              : conv.learner?.user?.id === currentUserId
              ? conv.mentor
              : role?.toLowerCase() === "learner"
              ? conv.mentor
              : conv.learner;

          const otherName =
            otherParticipant?.user?.fullName ||
            otherParticipant?.fullName ||
            otherParticipant?.user?.username ||
            otherParticipant?.username ||
            "Unknown User";

          // Determine if message is from current user
          const isFromCurrentUser = 
            latestMessage.senderId === currentUserId ||
            latestMessage.senderId === userData?.mentor?.id ||
            latestMessage.senderId === userData?.learner?.id;

          return {
            conversationId: conv.id,
            sender: isFromCurrentUser ? "You" : otherName,
            senderId: latestMessage.senderId,
            text: latestMessage.message || "",
            time: latestMessage.createdAt
              ? new Date(latestMessage.createdAt).toLocaleTimeString()
              : new Date().toLocaleTimeString(),
            createdAt: latestMessage.createdAt,
            isRead: latestMessage.isRead !== false,
          };
        })
      );

      // Filter out null values and sort by createdAt (newest first)
      const validMessages = messagesWithLatest
        .filter((msg) => msg !== null)
        .sort((a, b) => {
          const aTime = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const bTime = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return bTime - aTime; // Descending order (newest first)
        })
        .slice(0, 5); // Limit to 5 most recent messages

      setRecentMessages(validMessages);
    } catch (error) {
      console.error("Error loading recent messages:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error("Authentication failed. Please login again.");
        localStorage.removeItem("token");
      } else {
        console.log(error.response?.data?.message || "Failed to load recent messages");
      }
      setRecentMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Fetch ratings for all courses
  const fetchCourseRatings = async (coursesList) => {
    const jwtToken = localStorage.getItem("token");
    if (!jwtToken || !coursesList || coursesList.length === 0) {
      return;
    }

    try {
      const ratingPromises = coursesList.map(async (course) => {
        try {
          const response = await getAvgRating(course.id, jwtToken);
          if (response?.course) {
            return {
              courseId: course.id,
              averageRating: response.course.averageRating || 0,
              totalReviews: response.course.totalReviews || 0,
            };
          }
          return null;
        } catch (err) {
          console.error(`Error fetching rating for course ${course.id}:`, err);
          return null;
        }
      });

      const ratings = await Promise.all(ratingPromises);
      const ratingsMap = {};
      ratings.forEach((rating) => {
        if (rating) {
          ratingsMap[rating.courseId] = {
            averageRating: rating.averageRating,
            totalReviews: rating.totalReviews,
          };
        }
      });
      setCourseRatings(ratingsMap);
    } catch (err) {
      console.error("Error fetching course ratings:", err);
    }
  };

  useEffect(() => {
    const fetchAllActiveCourse = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token không tồn tại");
        return;
      }
      if (!userData?.mentor?.id) {
        setError("Không tìm thấy thông tin mentor");
        return;
      }

      try {
        setLoading(true);
        const data = await getAllActiveCoursesByMentorId(
          userData.mentor.id,
          token
        );
        setCourses(data);
        console.log("API response allActiveCourses: ", data);
        setTotalActiveCourses(data.totalActiveCourses || 0);
        setTotalLearners(data.totalLearners || 0);

        // Fetch ratings for all courses
        if (data?.courses && data.courses.length > 0) {
          fetchCourseRatings(data.courses);
        }
      } catch (err) {
        console.error("Lỗi khi gọi API All Courses:", err);
        setError(err.message || "Đã xảy ra lỗi");
      } finally {
        setLoading(false);
      }
    };

    fetchAllActiveCourse();
  }, [userData]);

  // Load recent messages
  useEffect(() => {
    if (userData) {
      const timer = setTimeout(() => loadRecentMessages(), 200);
      return () => clearTimeout(timer);
    }
  }, [userData]);

  // Calculate average rating across all courses
  const averageRating = React.useMemo(() => {
    const ratings = Object.values(courseRatings).filter(
      (r) => r.totalReviews > 0
    );
    if (ratings.length === 0) return 0;
    return (
      ratings.reduce((sum, r) => sum + r.averageRating, 0) / ratings.length
    );
  }, [courseRatings]);

  const totalReviews = React.useMemo(() => {
    return Object.values(courseRatings).reduce(
      (sum, r) => sum + (r.totalReviews || 0),
      0
    );
  }, [courseRatings]);

  return (
    <div className="bg-gray-100 rounded-lg shadow-lg m-2">
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-70">
          <Loading />
        </div>
      )}
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Courses
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalActiveCourses}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Published courses
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
                Total Students
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalLearners}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Enrolled learners
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
                Total Lessons
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {courses?.courses?.reduce(
                  (sum, course) => sum + (course.totalLessons || 0),
                  0
                ) || 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Across all courses
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Average Rating
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </p>
              {totalReviews > 0 ? (
                <p className="text-sm text-yellow-600 flex items-center mt-1">
                  <Star className="w-4 h-4 mr-1 fill-current" />
                  Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-1">
                  No ratings yet
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Course Activity
          </h3>
          <div className="space-y-4 max-h-100 overflow-y-auto">
            {courses?.courses?.length > 0 ? (
              courses.courses.map((item, index) => {
                const rating = courseRatings[item.id];
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.title}</p>
                      <div className="flex items-center gap-4 mt-1 flex-wrap">
                        <p className="text-sm text-gray-600">
                          {item.totalLessons ?? 0} {item.totalLessons === 1 ? "lesson" : "lessons"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.totalStudents ?? 0} students enrolled
                        </p>
                        {rating && rating.totalReviews > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-gray-900">
                              ⭐ {rating.averageRating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({rating.totalReviews} reviews)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {item.status ?? "inactive"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p>No active courses found</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Messages
          </h3>
          <div className="space-y-4 max-h-100 overflow-y-auto">
            {loadingMessages ? (
              <div className="p-4 text-center text-gray-500">
                <p>Loading messages...</p>
              </div>
            ) : recentMessages.length > 0 ? (
              recentMessages.map((msg, index) => (
                <div
                  key={`${msg.conversationId}-${msg.createdAt || index}`}
                  onClick={() => {
                    navigate(`/${path.PUBLIC_MENTOR}/${path.USER_CHAT}`, {
                      state: { conversationId: msg.conversationId },
                    });
                  }}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {msg.sender?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {msg.sender || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{msg.text || "No message"}</p>
                    <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>No recent messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
