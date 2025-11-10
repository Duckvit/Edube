import React, { useState, useEffect } from "react";
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
  Form,
  Row,
  Col,
  message,
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
import {
  getAllLearners,
  getLearnerById,
  updateLearner,
  deleteLearner,
} from "../../apis/LearnerServices";

export const User = () => {
  const { Search } = Input;
  const { Option } = Select;
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [learners, setLearners] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // UI page is 1-based
  const [pageSize, setPageSize] = useState(20);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentLearner, setCurrentLearner] = useState(null);
  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLearners(0, pageSize);
  }, []);

  const fetchLearners = async (pageIndex = 0, size = 20) => {
    setLoading(true);
    try {
      const data = await getAllLearners(pageIndex, size, token);
      const items = data?.content || [];
      setLearners(items);
      setTotal(data?.totalElements || items.length || 0);
      setPage((pageIndex || 0) + 1);
      setPageSize(size);
    } catch (err) {
      console.error("Failed to fetch learners", err);
      message.error("Failed to load learners");
    } finally {
      setLoading(false);
    }
  };

  const onTableChange = (pagination) => {
    const { current, pageSize: newSize } = pagination;
    const pageIndex = Math.max(0, (current || 1) - 1);
    fetchLearners(pageIndex, newSize);
  };

  const handleSearchById = async (val) => {
    const trimmed = String(val || "").trim();
    if (!trimmed) {
      fetchLearners(0, pageSize);
      return;
    }
    setLoading(true);
    try {
      const id = trimmed;
      const data = await getLearnerById(id, token);
      if (data) {
        setLearners([data]);
        setTotal(1);
        setPage(1);
      } else {
        setLearners([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Search learner failed", err);
      message.error("Learner not found");
      setLearners([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const showUpdateModal = (record) => {
    setCurrentLearner(record);
    form.setFieldsValue({
      majorField: record.majorField || "",
      educationLevel: record.educationLevel || "",
      learningPreferences: record.learningPreferences || "",
    });
    setUpdateModalVisible(true);
  };

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const id = currentLearner?.id;
      if (!id) return message.error("Missing learner id");
      setLoading(true);
      await updateLearner(id, values, token);
      message.success("Learner updated");
      setUpdateModalVisible(false);
      fetchLearners(Math.max(0, page - 1), pageSize);
    } catch (err) {
      console.error("Update learner failed", err);
      message.error("Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: `Are you sure you want to delete user ${id}?`,
      okText: "Yes",
      cancelText: "No",
      okType: "danger",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteLearner(id, token);
          message.success("Learner deleted");
          fetchLearners(Math.max(0, page - 1), pageSize);
        } catch (err) {
          console.error("Delete failed", err);
          message.error("Delete failed");
        } finally {
          setLoading(false);
        }
      },
    });
  };
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

  
  const columns = [
    { title: "No", width: 60, key: "no", render: (t, r, i) => i + 1 },
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Major Field", dataIndex: "majorField", key: "majorField" },
    {
      title: "Education Level",
      dataIndex: "educationLevel",
      key: "educationLevel",
    },
    {
      title: "Learning Preferences",
      dataIndex: "learningPreferences",
      key: "learningPreferences",
      render: (text) => <div className="truncate max-w-md">{text}</div>,
    },
    {
      title: "Credit Balance",
      dataIndex: "creditBalance",
      key: "creditBalance",
      render: (c) => `${Number(c || 0).toFixed(2)}`,
    },
    {
      title: "Joined At",
      dataIndex: "joinedAt",
      key: "joinedAt",
      render: (d) => (d ? new Date(d).toLocaleString() : "N/A"),
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
          >
            Update
          </Button>
          <Button
            className="!bg-red-500 !text-white !w-full"
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Use server-provided learners list. Client-side filters/search use server APIs.
  const filteredData = learners || [];

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
              placeholder="Search learners by ID"
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              className="w-full md:w-80"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearchById}
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
            Showing {filteredData.length} of {total} learners
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
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} learners`,
        }}
        onChange={onTableChange}
        scroll={{ x: "1600px", y: 400 }}
        loading={loading}
      />

      {/* Update Learner Modal */}
      <Modal
        title={
          currentLearner
            ? `Update Learner ${currentLearner.id}`
            : "Update Learner"
        }
        visible={updateModalVisible}
        onOk={handleUpdate}
        onCancel={() => setUpdateModalVisible(false)}
        okText="Update"
        cancelText="Cancel"
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Major Field"
            name="majorField"
            rules={[{ required: true, message: "Please input major field" }]}
          >
            <Input placeholder="e.g. SE1" />
          </Form.Item>

          <Form.Item
            label="Education Level"
            name="educationLevel"
            rules={[
              { required: true, message: "Please select education level" },
            ]}
          >
            <Select placeholder="Select level">
              <Option value="Undergraduate">Undergraduate</Option>
              <Option value="Postgraduate">Postgraduate</Option>
              <Option value="Doctorate">Doctorate</Option>
              <Option value="HighSchool">High School</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Learning Preferences"
            name="learningPreferences"
            rules={[{ required: false }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="e.g. Prefers reading and practical examples"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default User;
