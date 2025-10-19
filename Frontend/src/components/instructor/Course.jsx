import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { coursesData } from "../../utils/mockData";
import {
  Plus,
  Search,
  Star,
  Eye,
  Edit,
  Trash2,
  Filter,
  BookOpen,
} from "lucide-react";
import { Card, Button, Table, Tag, Space, Dropdown, Modal, Form, Input, Select, InputNumber, Upload, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, MoreOutlined, BookOutlined, UploadOutlined } from '@ant-design/icons';
import path from "../../utils/path";

const { TextArea } = Input;

export const Course = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleCreateCourse = async (values) => {
    try {
      const newCourse = {
        id: `new-${Date.now()}`,
        ...values,
        isPublished: false,
        students: 0,
        sections: 0,
        videos: 0,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setCourses([newCourse, ...courses]);
      message.success("Course created successfully!");
      setIsCreateModalVisible(false);
      form.resetFields();

      navigate(`/instructor/courses/${newCourse.id}/builder`);
    } catch (error) {
      message.error("Failed to create course");
    }
  };

  const columns = [
    {
      title: 'Course Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-semibold text-gray-900">{text}</div>
          <div className="text-sm text-gray-500">{record.category}</div>
        </div>
      )
    },
    // {
    //   title: 'Level',
    //   dataIndex: 'level',
    //   key: 'level',
    //   render: (level) => {
    //     const colors = {
    //       Beginner: 'green',
    //       Intermediate: 'blue',
    //       Advanced: 'orange'
    //     };
    //     return <Tag color={colors[level]}>{level}</Tag>;
    //   }
    // },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `$${price.toFixed(2)}`
    },
    {
      title: 'Content',
      key: 'content',
      render: (_, record) => (
        <div className="text-sm">
          <div>{record.sections} sections</div>
          <div className="text-gray-500">{record.videos} videos</div>
        </div>
      )
    },
    {
      title: 'Students',
      dataIndex: 'students',
      key: 'students',
      render: (students) => students.toLocaleString()
    },
    {
      title: 'Status',
      dataIndex: 'isPublished',
      key: 'isPublished',
      render: (isPublished) => (
        <Tag color={isPublished ? 'success' : 'default'}>
          {isPublished ? 'Published' : 'Draft'}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/instructor/course/${record.id}/builder`)}
          >
            Edit
          </Button>
          <Dropdown menu={getActionMenu(record)} trigger={['click']}>
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  const [courses, setCourses] = useState([
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      title: 'Complete Web Development Bootcamp',
      description: 'Learn web development from scratch with HTML, CSS, JavaScript, React, and Node.js',
      category: 'Web Development',
      level: 'Beginner',
      price: 49.99,
      isPublished: true,
      students: 1247,
      sections: 12,
      videos: 45,
      createdAt: '2024-01-15'
    },
    {
      id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns and best practices',
      category: 'Web Development',
      level: 'Advanced',
      price: 79.99,
      isPublished: true,
      students: 856,
      sections: 8,
      videos: 32,
      createdAt: '2024-02-20'
    },
    {
      id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      title: 'JavaScript Fundamentals',
      description: 'Build a strong foundation in JavaScript programming',
      category: 'Programming',
      level: 'Beginner',
      price: 39.99,
      isPublished: false,
      students: 0,
      sections: 5,
      videos: 18,
      createdAt: '2024-03-10'
    }
  ]);

  const getActionMenu = (record) => ({
    items: [
      {
        key: 'edit',
        label: 'Edit Content',
        icon: <EditOutlined />,
        onClick: () => navigate(`/instructor/courses/${record.id}/builder`)
      },
      {
        key: 'view',
        label: 'View Course',
        icon: <EyeOutlined />,
        onClick: () => navigate(`/instructor/courses/${record.id}/preview`)
      },
      {
        type: 'divider'
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteCourse(record.id)
      }
    ]
  });

  const handleCreate = () => {
    // chỗ này bạn có thể call API tạo course trước,
    // sau khi thành công thì mới navigate
    navigate(path.INSTRUCTOR_UPLOAD_COURSE);
  };

  return (
    <div className="space-y-6 m-2">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <button
          // onClick={handleCreate}
          onClick={() => setIsCreateModalVisible(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-purple-700 hover:to-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create Course</span>
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

       <Card>
          <Table
            columns={columns}
            dataSource={courses}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

      <Modal
        title={
          <div className="flex items-center gap-2">
            <BookOutlined className="text-blue-600" />
            <span>Create New Course</span>
          </div>
        }
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCourse}
          className="mt-4"
        >
          <Form.Item
            label="Course Title"
            name="title"
            rules={[{ required: true, message: "Please enter course title" }]}
          >
            <Input
              placeholder="e.g., Complete Web Development Bootcamp"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter course description" },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Describe what students will learn in this course"
              showCount
              maxLength={500}
            />
          </Form.Item>

          {/* <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select placeholder="Select category" size="large">
                <Option value="Web Development">Web Development</Option>
                <Option value="Mobile Development">Mobile Development</Option>
                <Option value="Data Science">Data Science</Option>
                <Option value="Programming">Programming</Option>
                <Option value="Design">Design</Option>
                <Option value="Business">Business</Option>
                <Option value="Marketing">Marketing</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Level"
              name="level"
              rules={[{ required: true, message: "Please select level" }]}
            >
              <Select placeholder="Select level" size="large">
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Form.Item>
          </div> */}

          <Form.Item
            label="Price (USD)"
            name="price"
            rules={[{ required: true, message: "Please enter price" }]}
            initialValue={0}
          >
            <InputNumber
              min={0}
              step={0.01}
              prefix="$"
              placeholder="0.00"
              size="large"
              className="w-full"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setIsCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                Create & Continue
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Course;
