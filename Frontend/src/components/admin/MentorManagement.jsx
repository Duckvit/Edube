import React, { useEffect, useState } from "react";
import { getAllMentors, approveMentor } from "../../apis/MentorServices";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Tag,
  Avatar,
  Space,
  Dropdown,
  Modal,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  UserOutlined,
  MoreOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";

export const MentorManagement = () => {
  const { Search } = Input;
  const { Option } = Select;
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [mentors, setMentors] = useState([]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const data = await getAllMentors(token);
      console.log("All mentors: ", data);
      setMentors(data.mentors || []);
    } catch (error) {
      console.log("Error fetch all mentors: ", error);
      toast.error("Failed to load mentors list!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleApproveMentor = async (mentorId) => {
    try {
      const token = localStorage.getItem("token");
      const data = await approveMentor(mentorId, token);
      console.log("Approve response: ", data);

      if (data.statusCode === 200) {
        toast.success("Mentor activated successfully!");
        // Gọi lại hàm fetchMentors để load lại danh sách
        fetchMentors();
      } else {
        toast.error(data?.message || "Failed to activate mentor!");
      }
    } catch (error) {
      console.log("❌ Error approving mentor:", error);
      toast.error(error?.response?.data?.message || "⚠️ Something went wrong!");
    }
  };

  const filteredData = mentors.filter((mentor) => {
    const matchesSearch =
      mentor.user?.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      mentor.user?.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      mentor.user?.username?.toLowerCase().includes(searchText.toLowerCase()) ||
      mentor.id?.toString().includes(searchText);

    const matchesStatus =
      filterStatus === "all" || mentor.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      title: "No",
      width: 60,
      dataIndex: "no",
      key: "no",
      fixed: "left",
      render: (text, record, index) => index + 1,
    },
    // {
    //   title: "Avatar",
    //   width: 80,
    //   dataIndex: ["user", "avatarUrl"],
    //   key: "avatar",
    //   render: (avatarUrl) =>
    //     avatarUrl ? (
    //       <img
    //         src={avatarUrl}
    //         alt="Avatar"
    //         className="w-12 h-12 object-cover rounded-full"
    //       />
    //     ) : (
    //       <div className="w-12 h-12 flex items-center justify-center rounded-full text-xl">
    //         <UserOutlined />
    //       </div>
    //     ),
    // },
    {
      title: "Full Name",
      width: 150,
      dataIndex: ["user", "fullName"],
      key: "fullName",
      fixed: "left",
    },
    {
      title: "Email",
      width: 180,
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Username",
      width: 120,
      dataIndex: ["user", "username"],
      key: "username",
    },
    {
      title: "Bio",
      width: 200,
      dataIndex: "bio",
      key: "bio",
    },
    {
      title: "Expertise Areas",
      width: 200,
      dataIndex: "expertiseAreas",
      key: "expertiseAreas",
    },
    {
      title: "Qualification",
      width: 150,
      dataIndex: "qualification",
      key: "qualification",
    },
    {
      title: "Status",
      width: 100,
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "active"
              ? "green"
              : status === "inactive"
              ? "red"
              : status === "pending"
              ? "orange"
              : "default"
          }
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Joined Date",
      width: 120,
      dataIndex: ["user", "createdAt"],
      key: "joinedDate",
      render: (date) => {
        if (!date) return "-";
        const dateObj = new Date(date);
        return dateObj.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    // {
    //   title: "Actions",
    //   key: "actions",
    //   fixed: "right",
    //   render: (text, record) => (
    //     <div className="flex flex-col gap-2">
    //       <Button
    //         type="primary"
    //         className="!bg-blue-500 !text-white"
    //         onClick={() => showUpdateModal(record)}
    //       >
    //         Update
    //       </Button>
    //       <Button
    //         danger
    //         className="!bg-red-500 !text-white"
    //         onClick={() => handleDelete(record.user.id)}
    //       >
    //         Delete
    //       </Button>
    //     </div>
    //   ),
    // },

    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            className="!bg-blue-500 !text-white"
            onClick={() => handleApproveMentor(record.id)}
          >
            Active
          </Button>
        </div>
      ),
    },
  ];
  return (
    <div className="w-full h-full bg-gray-100">
      <h1 className="text-2xl font-bold mb-3 text-gray-800">
        Mentor Management
      </h1>

      {/* Filters and Search */}
      <Card className="w-full h-full !bg-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Search
              placeholder="Search mentors by name, email, or username"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              className="w-full md:w-80"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <div className="flex gap-2">
              {/* <Select
                value={filterRole}
                onChange={setFilterRole}
                size="large"
                className="w-32"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Roles</Option>
                <Option value="student">Students</Option>
                <Option value="mentor">Mentors</Option>
              </Select> */}
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                size="large"
                className="w-32"
                suffixIcon={<FilterOutlined />}
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {mentors.length} mentors
          </div>
        </div>
      </Card>

      {/* Mentors Table */}
      <Table
        columns={columns}
        bordered
        dataSource={filteredData}
        rowKey={(record) => record.id}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} mentors`,
        }}
        scroll={{ x: "1600px", y: 400 }}
        loading={loading}
      />
    </div>
  );
};

export default MentorManagement;
