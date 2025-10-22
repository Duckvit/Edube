import React, { useState, useEffect } from "react";
import Loading from "../common/Loading";
import { statsData, activitiesData, conversations } from "../../utils/mockData";
import { BookOpen, Users, TrendingUp, Star } from "lucide-react";

export const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // giả lập fetch API
    setTimeout(() => {
      setStats(statsData);
      setActivities(activitiesData);

      // Lấy tin nhắn mới nhất từ mỗi conversation
      const latestMessages = conversations.map((c) => {
        const lastMessage = c.messages[c.messages.length - 1];
        return {
          name: c.name,
          text: lastMessage.text,
          time: lastMessage.time,
          isRead: lastMessage.isRead,
        };
      });

      setMessages(latestMessages);
    }, 500);
  }, []);

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
                {stats?.courses}
              </p>
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
                Total Students
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.students}
              </p>
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
              <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.rating}
              </p>
              <p className="text-sm text-yellow-600 flex items-center mt-1">
                <Star className="w-4 h-4 mr-1 fill-current" />
                Based on 892 reviews
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Revenue Earned
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.revenue}
              </p>
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-3">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Course Activity
          </h3>
          <div className="space-y-4 max-h-100 overflow-y-auto">
            {activities.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{item.course}</p>
                  <p className="text-sm text-gray-600">
                    {item.students} students enrolled
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    item.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Messages
          </h3>
          <div className="space-y-4 max-h-100 overflow-y-auto">
            {conversations.map((conv) =>
              conv.messages.map((msg, index) => (
                <div
                  key={`${conv.id}-${msg.id || index}`}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {msg.sender.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {msg.sender}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{msg.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{msg.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
