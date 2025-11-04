import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getLearner } from "../../apis/MentorServices";
import { useUserStore } from "../../store/useUserStore";
import {
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  GraduationCap,
} from "lucide-react";

export const Learner = () => {
  const { userData } = useUserStore();
  const [learners, setLearners] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const mentorId = userData?.mentor?.id;
        if (!mentorId) {
          setLoading(false);
          return;
        }

        const data = await getLearner(page, size, mentorId, token);
        console.log("📘 Learners data:", data);

        // Map dữ liệu đúng theo API trả về
        const mappedLearners = (data.learners || []).map((l) => ({
          id: l.id,
          username: l.user?.username || "U",
          fullName: l.user?.fullName || "Unknown",
          email: l.user?.email || "N/A",
          majorField: l.majorField || "N/A",
          educationLevel: l.educationLevel || "N/A",
          creditBalance: l.creditBalance ?? 0,
          joinedAt: l.joinedAt,
        }));

        setLearners(mappedLearners);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API getLearner:", err);
        setLearners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLearners();
  }, [page, size, userData?.mentor?.id]);

  // Filter learners based on search query
  const filteredLearners = learners.filter((learner) => {
    const query = searchQuery.toLowerCase();
    return (
      learner.fullName.toLowerCase().includes(query) ||
      learner.email.toLowerCase().includes(query) ||
      learner.majorField.toLowerCase().includes(query) ||
      learner.educationLevel.toLowerCase().includes(query)
    );
  });

  const handlePreviousPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Learners</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and track your learners ({totalElements} total)
          </p>
        </div>
        {/* <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button> */}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, major, or education level..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-transparent transition-all bg-white"
          />
        </div>
        <button className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm">
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filter</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500">Loading learners...</p>
            </div>
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? "No learners found" : "No learners yet"}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "Learners will appear here once they enroll in your courses"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Learner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Major & Education
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Joined Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredLearners.map((learner, index) => (
                    <tr
                      key={learner.id || index}
                      className="hover:bg-purple-50 transition-colors"
                    >
                      {/* Learner info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md">
                            {learner.username.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {learner.fullName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Mail className="w-3 h-3 mr-1" />
                              {learner.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Major & Education */}
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <GraduationCap className="w-4 h-4 text-purple-600 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {learner.majorField}
                            </div>
                            <div className="text-gray-500 text-xs mt-0.5">
                              {learner.educationLevel}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Joined date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(learner.joinedAt).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {new Date(learner.joinedAt).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                            }
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {/* <button className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline transition-colors">
                            View
                          </button> */}
                          <button className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors">
                            Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing page{" "}
                    <span className="font-semibold">{page + 1}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={page === 0}
                      className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      onClick={handleNextPage}
                      disabled={page >= totalPages - 1}
                      className="flex items-center space-x-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Learner;
