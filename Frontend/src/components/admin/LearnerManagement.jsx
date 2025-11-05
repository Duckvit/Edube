import React, { useState } from "react";
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

export const User = () => {
  const { Search } = Input;
  const { Option } = Select;
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const userData = [
    {
      key: "1",
      id: "USR001",
      name: "John Smith",
      email: "john.smith@email.com",
      role: "student",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2024-01-20",
      coursesEnrolled: 5,
      avatar: null,
    },
    {
      key: "2",
      id: "USR002",
      name: "Dr. Sarah Chen",
      email: "sarah.chen@university.edu",
      role: "instructor",
      status: "active",
      joinDate: "2023-11-20",
      lastLogin: "2024-01-19",
      coursesCreated: 12,
      avatar: null,
    },
    {
      key: "3",
      id: "USR003",
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      role: "student",
      status: "inactive",
      joinDate: "2024-01-10",
      lastLogin: "2024-01-12",
      coursesEnrolled: 2,
      avatar: null,
    },
    {
      key: "4",
      id: "USR004",
      name: "Prof. Michael Rodriguez",
      email: "michael.rodriguez@college.edu",
      role: "instructor",
      status: "active",
      joinDate: "2023-09-05",
      lastLogin: "2024-01-20",
      coursesCreated: 8,
      avatar: null,
    },
    {
      key: "5",
      id: "USR005",
      name: "Lisa Thompson",
      email: "lisa.thompson@business.com",
      role: "instructor",
      status: "pending",
      joinDate: "2024-01-18",
      lastLogin: "Never",
      coursesCreated: 0,
      avatar: null,
    },
    {
      key: "6",
      id: "USR006",
      name: "Alex Kumar",
      email: "alex.kumar@email.com",
      role: "student",
      status: "active",
      joinDate: "2023-12-01",
      lastLogin: "2024-01-19",
      coursesEnrolled: 8,
      avatar: null,
    },
    {
      key: "7",
      id: "USR007",
      name: "Maria Garcia",
      email: "maria.garcia@email.com",
      role: "student",
      status: "suspended",
      joinDate: "2023-10-15",
      lastLogin: "2024-01-05",
      coursesEnrolled: 3,
      avatar: null,
    },
    {
      key: "8",
      id: "USR008",
      name: "David Park",
      email: "david.park@tech.com",
      role: "instructor",
      status: "active",
      joinDate: "2023-08-20",
      lastLogin: "2024-01-20",
      coursesCreated: 15,
      avatar: null,
    },
  ];

  const getActionItems = (record) => [
    {
      key: "view",
      label: "View Details",
      icon: <EyeOutlined />,
      onClick: () => console.log("View user:", record.id),
    },
    {
      key: "edit",
      label: "Edit User",
      icon: <EditOutlined />,
      onClick: () => console.log("Edit user:", record.id),
    },
    {
      key: "activate",
      label: record.status === "active" ? "Deactivate" : "Activate",
      icon:
        record.status === "active" ? (
          <CloseCircleOutlined />
        ) : (
          <CheckCircleOutlined />
        ),
      onClick: () => console.log("Toggle status:", record.id),
    },
    {
      key: "delete",
      label: "Delete User",
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: "Delete User",
          content: `Are you sure you want to delete ${record.name}?`,
          okText: "Delete",
          okType: "danger",
          onOk: () => console.log("Delete user:", record.id),
        });
      },
    },
  ];

  // const columns = [
  //   {
  //     title: "User",
  //     dataIndex: "name",
  //     key: "name",
  //     render: (text, record) => (
  //       <div className="flex items-center space-x-3">
  //         <Avatar
  //           size={40}
  //           icon={<UserOutlined />}
  //           className="bg-gradient-to-r from-blue-500 to-purple-500"
  //         />
  //         <div>
  //           <div className="font-medium text-gray-900">{text}</div>
  //           <div className="text-sm text-gray-500">{record.email}</div>
  //         </div>
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "User ID",
  //     dataIndex: "id",
  //     key: "id",
  //     render: (text) => (
  //       <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
  //         {text}
  //       </span>
  //     ),
  //   },
  //   {
  //     title: "Role",
  //     dataIndex: "role",
  //     key: "role",
  //     render: (role) => (
  //       <Tag color={role === "instructor" ? "blue" : "green"}>
  //         {role.toUpperCase()}
  //       </Tag>
  //     ),
  //   },
  //   {
  //     title: "Status",
  //     dataIndex: "status",
  //     key: "status",
  //     render: (status) => {
  //       const colors = {
  //         active: "green",
  //         inactive: "orange",
  //         pending: "blue",
  //         suspended: "red",
  //       };
  //       return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
  //     },
  //   },
  //   {
  //     title: "Join Date",
  //     dataIndex: "joinDate",
  //     key: "joinDate",
  //     render: (date) => new Date(date).toLocaleDateString(),
  //   },
  //   {
  //     title: "Last Login",
  //     dataIndex: "lastLogin",
  //     key: "lastLogin",
  //     render: (date) =>
  //       date === "Never" ? date : new Date(date).toLocaleDateString(),
  //   },
  //   {
  //     title: "Activity",
  //     key: "activity",
  //     render: (record) => (
  //       <div className="text-sm">
  //         {record.role === "instructor" ? (
  //           <span>{record.coursesCreated || 0} courses created</span>
  //         ) : (
  //           <span>{record.coursesEnrolled || 0} courses enrolled</span>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     title: "Actions",
  //     key: "actions",
  //     render: (record) => (
  //       <Dropdown
  //         menu={{ items: getActionItems(record) }}
  //         trigger={["click"]}
  //         placement="bottomRight"
  //       >
  //         <Button type="text" icon={<MoreOutlined />} />
  //       </Dropdown>
  //     ),
  //   },
  // ];
  const columns = [
    {
      title: "No",
      width: 60,
      dataIndex: "no",
      key: "no",
      fixed: "left",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Avatar",
      dataIndex: ["user", "avatar"],
      key: "avatar",
      render: (avatar) =>
        avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-[7vw] h-[7vw] object-cover rounded-full"
          />
        ) : (
          <div className="w-[7vw] h-[7vw] flex items-center justify-center rounded-full  text-2xl">
            <UserOutlined />
          </div>
        ),
    },
    {
      title: "Full Name",
      width: 250,
      dataIndex: ["user", "fullName"],
      key: "fullName",
      fixed: "left",
    },
    {
      title: "Email",
      width: 280,
      dataIndex: ["user", "email"],
      key: "email",
    },
    {
      title: "Birth Date",
      dataIndex: ["user", "birthDate"],
      key: "birthDate",
    },
    {
      title: "Joined Date",
      dataIndex: ["user", "dateCreated"],
      key: "joinedDate",
    },
    {
      title: "Phone",
      dataIndex: ["user", "phone"],
      key: "phone",
    },
    {
      title: "Gender",
      dataIndex: ["user", "gender"],
      key: "gender",
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (text, record) => (
        <div className="flex flex-col gap-2">
          {/* {record?.availableStatus !== "ACTIVE" ? (
            <Button
              className="!bg-gray-500 !text-white !w-full hover:cursor-not-allowed"
              style={{ marginRight: "10px" }}
            >
              Inactive
            </Button>
          ) : (
            <Button
              className="!bg-blue-500 text-white w-full"
              onClick={() => showUpdateModal(record)}
              style={{ marginRight: "10px" }}
            >
              Update
            </Button>
          )} */}
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

  const filteredData = userData.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      user.id.toLowerCase().includes(searchText.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="w-full h-full bg-gray-100">
      <h1 className="text-2xl font-bold mb-3 text-gray-800">
        Learner Management
      </h1>

      {/* Filters and Search */}
      <Card className="w-full h-full !bg-gray-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <Search
              placeholder="Search users by name, email, or ID"
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
                <Option value="instructor">Instructors</Option>
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
                <Option value="pending">Pending</Option>
                <Option value="suspended">Suspended</Option>
              </Select>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing {filteredData.length} of {userData.length} users
          </div>
        </div>
      </Card>

      {/* Users Table */}
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
            `${range[0]}-${range[1]} of ${total} users`,
        }}
        scroll={{ x: "1600px", y: 400 }}
        loading={loading}
      />
    </div>
  );
};

export default User;
