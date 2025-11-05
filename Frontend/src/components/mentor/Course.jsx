import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getAllCoursesByMentorId,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../apis/CourseServices";
import { useUserStore } from "../../store/useUserStore";
import { Plus, Search, Filter } from "lucide-react";
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Dropdown,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  MoreOutlined,
  BookOutlined,
} from "@ant-design/icons";
import path from "../../utils/path";

const { TextArea } = Input;

export const Course = () => {
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [courses, setCourses] = useState([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [page, setPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [size, setSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, userData, fullData } = useUserStore();
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    level: "",
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCourses = courses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const fetchCourses = async () => {
    const token = localStorage.getItem("token");
    const mentorId = userData?.mentor?.id;
    console.log("Mentor ID:", mentorId);
    console.log("UserData:", userData);
    if (!mentorId) {
      console.error("Không tìm thấy mentorId trong userData");
      return;
    }

    try {
      setLoading(true);
      const data = await getAllCoursesByMentorId(mentorId, token);
      // Handle both paginated response (with content) and array response
      const coursesList = data?.courses || [];

      setCourses(coursesList);
      setTotalItems(coursesList.length);
    } catch (err) {
      console.error("Error fetching courses:", err);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.mentor?.id) {
      fetchCourses();
    }
  }, [userData]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // const handleSubmit = async () => {
  //   const token = localStorage.getItem("token");
  //   console.log(userData);
  //   if (!userData?.id) {
  //     return alert("User info chưa sẵn sàng!");
  //   }
  //   const body = { mentor: { id: userData.id }, ...formData };
  //   try {
  //     const res = await createCourse(token, body);
  //     console.log("✅ Course created:", res);
  //   } catch (err) {
  //     console.error("❌ Error creating course:", err);
  //   }
  // };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const mentorId = userData?.mentor?.id;

    if (!mentorId) {
      toast.error("Không tìm thấy thông tin mentor");
      return;
    }

    const values = await form.validateFields();

    // normalize category: allow multi-select but send both formats to backend
    const categoryValue = values.category;
    const data = {
      mentor: { id: mentorId },
      ...values,
      category: Array.isArray(categoryValue)
        ? categoryValue.join(", ")
        : categoryValue,
      categories: Array.isArray(categoryValue)
        ? categoryValue
        : categoryValue
        ? [categoryValue]
        : [],
    };

    try {
      const res = await createCourse(token, data);
      console.log("✅ Course created response:", res);
      
      // Lấy course ID từ response - kiểm tra nhiều cấu trúc response khác nhau
      const courseId = 
        res?.data?.id || 
        res?.data?.course?.id || 
        res?.data?.courseId || 
        res?.id || 
        res?.course?.id;
      
      console.log("📝 Extracted course ID:", courseId);
      
      if (!courseId) {
        console.error("❌ Course ID not found in response:", res);
        toast.error("Course created but ID not found. Please refresh and try again.");
        setIsCreateModalVisible(false);
        await fetchCourses();
        return;
      }
      
      toast.success("Course created successfully! Redirecting to course builder...");
      setIsCreateModalVisible(false);
      form.resetFields();
      
      // Navigate đến CourseBuilder với course ID mới tạo
      navigate(`/mentor/course/${courseId}/builder`);
    } catch (err) {
      console.error("❌ Error creating course:", err);
      toast.error("Failed to create course. Please try again.");
    }
  };

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

      // navigate to the course builder route (singular 'course' to match App route)
      // navigate to the course builder using route constants to avoid path mismatches
      navigate(
        `/${path.PUBLIC_MENTOR}/${path.MENTOR_COURSE_BUILDER.replace(
          ":courseId",
          encodeURIComponent(String(newCourse.id))
        )}`
      );
    } catch (error) {
      message.error("Failed to create course");
    }
  };

  const columns = [
    {
      title: "Course Title",
      dataIndex: "title",
      key: "title",
      fixed: "left",
      render: (text, content) => (
        <div>
          <div className="font-semibold text-gray-900">{text}</div>
          <div className="text-sm text-gray-500">{content.description}</div>
        </div>
      ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      render: (level) => {
        const colors = {
          beginner: "green",
          intermediate: "blue",
          advanced: "orange",
        };
        return (
          <Tag color={colors[level]} className="uppercase">
            {level}
          </Tag>
        );
      },
    },
    {
      title: "Price (VND)",
      dataIndex: "price",
      key: "price",
      render: (price) =>
        price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) =>
        Array.isArray(category) ? category.join(", ") : category || "-",
    },
    // {
    //   title: "Content",
    //   key: "content",
    //   render: (_, record) => (
    //     <div className="text-sm">
    //       <div>{record.sections} sections</div>
    //       <div className="text-gray-500">{record.videos} videos</div>
    //     </div>
    //   ),
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <Button
            icon={<EditOutlined />}
            className="!bg-blue-500 !text-white w-full"
            onClick={(e) => {
              // Prevent the row's onClick from firing
              e.stopPropagation();
              // open edit modal and populate form
              setEditingCourse(record);
              editForm.setFieldsValue({
                title: record.title,
                description: record.description,
                price: record.price,
                level: record.level,
                // ensure category is an array for multiple-select
                category: Array.isArray(record.category)
                  ? record.category
                  : record.category
                  ? [record.category]
                  : [],
                tags: record.tags,
                totalLessons: record.totalLessons,
                durationHours: record.durationHours,
              });
              setIsEditModalVisible(true);
            }}
            style={{ marginRight: "10px" }}
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            className="!bg-red-500 !text-white !w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCourse(record.id);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Helper to delete a course with confirmation
  const handleDeleteCourse = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this Course?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          const token = localStorage.getItem("token");
          await deleteCourse(token, id);
          message.success("Course deleted successfully");
          await fetchCourses();
        } catch (err) {
          console.error("Error deleting course:", err);
          message.error("Failed to delete course");
        }
      },
    });
  };

  const getActionMenu = (record) => ({
    items: [
      {
        key: "edit",
        label: "Edit Content",
        icon: <EditOutlined />,
        onClick: () =>
          navigate(
            `/${path.PUBLIC_MENTOR}/${path.MENTOR_COURSE_BUILDER.replace(
              ":courseId",
              encodeURIComponent(String(record.id))
            )}`
          ),
      },
      {
        key: "view",
        label: "View Course",
        icon: <EyeOutlined />,
        onClick: () =>
          navigate(
            `/mentor/courses/${encodeURIComponent(String(record.id))}/preview`
          ),
      },
      {
        type: "divider",
      },
      {
        key: "delete",
        label: "Delete",
        icon: <DeleteOutlined />,
        danger: true,
        onClick: () => handleDeleteCourse(record.id),
      },
    ],
  });

  const handleCreate = () => {
    // chỗ này bạn có thể call API tạo course trước,
    // sau khi thành công thì mới navigate
    navigate(path.INSTRUCTOR_UPLOAD_COURSE);
  };

  const handleUpdateCourse = async (values) => {
    if (!editingCourse) return;
    try {
      const token = localStorage.getItem("token");
      const categoryValue = values.category;
      const payload = {
        mentor: { id: userData?.mentor?.id },
        title: values.title,
        description: values.description,
        price: Number(values.price) || 0,
        level: values.level,
        category: Array.isArray(categoryValue)
          ? categoryValue.join(", ")
          : categoryValue,
        categories: Array.isArray(categoryValue)
          ? categoryValue
          : categoryValue
          ? [categoryValue]
          : [],
        tags: values.tags,
        totalLessons: values.totalLessons,
        durationHours: values.durationHours,
      };

      const res = await updateCourse(token, editingCourse.id, payload);
      // Some backends return the updated object, some a status. Show a success message and refresh.
      message.success("Course updated successfully");
      setIsEditModalVisible(false);
      setEditingCourse(null);
      await fetchCourses();
    } catch (err) {
      console.error("Error updating course:", err, err.response?.data || "");
      const serverMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update course";
      message.error(serverMsg);
    }
  };

  return (
    <div className="space-y-2">
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
      <Card>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </Card>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        onRow={(record) => ({
          onClick: () =>
            navigate(
              `/${path.PUBLIC_MENTOR}/${path.MENTOR_COURSE_BUILDER.replace(
                ":courseId",
                encodeURIComponent(String(record.id))
              )}`
            ),
        })}
        pagination={{
          current: currentPage,
          total: totalItems,
          pageSize: itemsPerPage,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} courses`,
          onChange: (pageNumber, newPageSize) => {
            // Nếu đổi kích thước trang (pageSize)
            if (newPageSize !== itemsPerPage) {
              setCurrentPage(1); // reset về trang đầu
              setItemsPerPage(newPageSize);
            } else {
              setCurrentPage(pageNumber);
            }
          },
        }}
        scroll={{ x: "1600px", y: 400 }}
        loading={loading}
      />

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
          onFinish={handleSubmit}
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

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                placeholder="Select category"
                size="large"
                mode="multiple"
              >
                <Select.Option value="Web Development">
                  Web Development
                </Select.Option>
                <Select.Option value="Mobile Development">
                  Mobile Development
                </Select.Option>
                <Select.Option value="Data Science">Data Science</Select.Option>
                <Select.Option value="Programming">Programming</Select.Option>
                <Select.Option value="Design">Design</Select.Option>
                <Select.Option value="Business">Business</Select.Option>
                <Select.Option value="Marketing">Marketing</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Level"
              name="level"
              rules={[{ required: true, message: "Please select level" }]}
            >
              <Select placeholder="Select level" size="large">
                <Select.Option value="beginner">BEGINNER</Select.Option>
                <Select.Option value="intermediate">INTERMEDIATE</Select.Option>
                <Select.Option value="advanced">ADVANCED</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Price (VNĐ)"
            name="price"
            rules={[{ required: true, message: "Please enter price" }]}
            initialValue={0}
          >
            <InputNumber
              min={0}
              step={1000}
              placeholder="0"
              size="large"
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              } // ✅ hiển thị dấu phẩy ngăn cách nghìn
              parser={(value) => value.replace(/,/g, "")}
              addonAfter="VNĐ"
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
      {/* Edit Course Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <EditOutlined className="text-blue-600" />
            <span>Edit Course</span>
          </div>
        }
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingCourse(null);
          editForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateCourse}
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

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                placeholder="Select category"
                size="large"
                mode="multiple"
              >
                <Select.Option value="Web Development">
                  Web Development
                </Select.Option>
                <Select.Option value="Mobile Development">
                  Mobile Development
                </Select.Option>
                <Select.Option value="Data Science">Data Science</Select.Option>
                <Select.Option value="Programming">Programming</Select.Option>
                <Select.Option value="Design">Design</Select.Option>
                <Select.Option value="Business">Business</Select.Option>
                <Select.Option value="Marketing">Marketing</Select.Option>
                <Select.Option value="Software Development">
                  Software Development
                </Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Level"
              name="level"
              rules={[{ required: true, message: "Please select level" }]}
            >
              <Select placeholder="Select level" size="large">
                <Select.Option value="beginner">BEGINNER</Select.Option>
                <Select.Option value="intermediate">INTERMEDIATE</Select.Option>
                <Select.Option value="advanced">ADVANCED</Select.Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Price (VNĐ)"
            name="price"
            rules={[{ required: true, message: "Please enter price" }]}
            initialValue={0}
          >
            <InputNumber
              min={0}
              step={1000}
              placeholder="0"
              size="large"
              className="w-full"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => String(value).replace(/,/g, "")}
              addonAfter="VNĐ"
            />
          </Form.Item>

          {/* <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Total Lessons" name="totalLessons">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item label="Duration (hours)" name="durationHours">
              <InputNumber min={0} className="w-full" />
            </Form.Item>
          </div>

          <Form.Item label="Tags (comma separated)" name="tags">
            <Input placeholder="e.g., java,programming,beginner,2024" />
          </Form.Item> */}

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => {
                  setIsEditModalVisible(false);
                  setEditingCourse(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" className="bg-blue-600">
                Save Changes
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Course;
