import React, { useState } from "react";
import {
  Card,
  Avatar,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Rate,
  message,
  Tag,
} from "antd";
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
  StarOutlined,
  BookOutlined,
  TrophyOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";

const { Option } = Select;
const { TextArea } = Input;

export const UserProfile = () => {
  const { role, userData, setIsUpdate, isUpdate } = useUserStore();
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  const [profileData, setProfileData] = useState({
    learner: {
      username: "learner_user",
      fullName: "John Doe",
      email: "learner@example.com",
      phone: "+1234567890",
      educationLevel: "Bachelor's Degree",
      avatarUrl: null,
    },
    instructor: {
      username: "instructor_user",
      fullName: "Dr. Sarah Chen",
      email: "instructor@example.com",
      phone: "+1987654321",
      rating: 4.9,
      expertiseArea: "Web Development, React, JavaScript",
      bio: "Experienced software engineer with 10+ years in web development. Passionate about teaching and helping students master modern web technologies.",
      avatarUrl: null,
    },
  });

  const currentProfile = profileData[role];

  const showEditModal = () => {
    if (role === "learner") {
      form.setFieldsValue({
        username: currentProfile.username,
        fullName: currentProfile.fullName,
        email: currentProfile.email,
        phone: currentProfile.phone,
        educationLevel: currentProfile.educationLevel,
        avatarUrl: currentProfile.avatarUrl,
      });
    } else {
      form.setFieldsValue({
        username: currentProfile.username,
        fullName: currentProfile.fullName,
        email: currentProfile.email,
        phone: currentProfile.phone,
        expertiseArea: currentProfile.expertiseArea,
        bio: currentProfile.bio,
        avatarUrl: currentProfile.avatarUrl,
      });
    }
    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      setProfileData({
        ...profileData,
        [role]: {
          ...currentProfile,
          ...values,
        },
      });
      message.success("Profile updated successfully!");
      setIsEditModalVisible(false);
    } catch (error) {
      message.error("Failed to update profile");
    }
  };

  const expertiseAreas =
    role === "instructor"
      ? currentProfile.expertiseArea.split(",").map((area) => area.trim())
      : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* <button
            onClick={() => navigate("/learner")}
            className="flex items-center gap-2 text-blue-600 hover:underline cursor-pointer mb-8"
          >
            <ArrowLeftOutlined />
            Back to Dashboard
          </button> */}
        <div className="mb-6 flex items-center justify-between">
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">
              {role === "learner"
                ? "Manage your personal information"
                : "Manage your instructor information"}
            </p>
          </div>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="large"
            className="bg-blue-600"
            onClick={showEditModal}
          >
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="text-center">
              <div className="flex flex-col items-center">
                <Avatar
                  size={120}
                  icon={<UserOutlined />}
                  className="bg-gradient-to-br from-blue-600 to-cyan-600 mb-4"
                  src={currentProfile?.avatarUrl}
                />
                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentProfile?.fullName}
                </h2>
                <p className="text-gray-600 mb-1">
                  @{currentProfile?.username}
                </p>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full font-medium text-sm mb-3 ${
                    role === "learner"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {role === "learner" ? (
                    <UserOutlined className="mr-1" />
                  ) : (
                    <TrophyOutlined className="mr-1" />
                  )}
                  {role === "learner" ? "Learner" : "Instructor"}
                </div>

                {role === "instructor" && (
                  <div className="flex items-center justify-center bg-amber-50 px-4 py-2 rounded-lg">
                    <StarOutlined className="text-amber-500 text-lg mr-2" />
                    <span className="text-2xl font-bold text-gray-900">
                      {currentProfile?.rating}
                    </span>
                    <span className="text-gray-600 ml-1">/5.0</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <MailOutlined className="text-lg mr-3 text-blue-600" />
                    <span className="text-sm break-all">
                      {currentProfile?.email}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <PhoneOutlined className="text-lg mr-3 text-green-600" />
                    <span className="text-sm">
                      {currentProfile?.phone || "Not provided"}
                    </span>
                  </div>
                  {role === "learner" && (
                    <div className="flex items-center text-gray-700">
                      <BookOutlined className="text-lg mr-3 text-amber-600" />
                      <span className="text-sm">
                        {currentProfile?.educationLevel || "Not provided"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Profile Information" className="mb-6">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Username">
                  <span className="font-medium text-gray-900">
                    {currentProfile?.username}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Full Name">
                  <span className="font-medium text-gray-900">
                    {currentProfile?.fullName}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  <span className="font-medium text-gray-900">
                    {currentProfile?.email}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                  <span className="font-medium text-gray-900">
                    {currentProfile?.phone || "Not provided"}
                  </span>
                </Descriptions.Item>

                {role === "learner" && (
                  <Descriptions.Item label="Education Level">
                    <span className="font-medium text-gray-900">
                      {currentProfile?.educationLevel || "Not provided"}
                    </span>
                  </Descriptions.Item>
                )}

                {role === "instructor" && (
                  <>
                    <Descriptions.Item label="Rating">
                      <div className="flex items-center">
                        <Rate
                          disabled
                          value={currentProfile?.rating}
                          allowHalf
                          className="text-sm mr-2"
                        />
                        <span className="font-bold text-gray-900">
                          {currentProfile?.rating}
                        </span>
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Expertise Area">
                      <div className="flex flex-wrap gap-2">
                        {expertiseAreas.map((area, index) => (
                          <Tag key={index} color="blue" className="text-sm">
                            {area}
                          </Tag>
                        ))}
                      </div>
                    </Descriptions.Item>
                    <Descriptions.Item label="Bio">
                      <p className="text-gray-900 whitespace-pre-wrap">
                        {currentProfile?.bio || "Not provided"}
                      </p>
                    </Descriptions.Item>
                  </>
                )}
              </Descriptions>
            </Card>

            <Card
              title={
                role === "learner"
                  ? "Learning Statistics"
                  : "Teaching Statistics"
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {role === "learner" ? (
                  <>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        12
                      </div>
                      <div className="text-sm text-gray-600">
                        Courses Enrolled
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        8
                      </div>
                      <div className="text-sm text-gray-600">
                        Courses Completed
                      </div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        156
                      </div>
                      <div className="text-sm text-gray-600">Hours Learned</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        15
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Courses
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        2,847
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Students
                      </div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        4.9
                      </div>
                      <div className="text-sm text-gray-600">
                        Average Rating
                      </div>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        title="Edit Profile"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: "Please enter your full name" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Enter full name" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Enter email" />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input
              prefix={<PhoneOutlined />}
              placeholder="Enter phone number"
            />
          </Form.Item>

          {role === "learner" && (
            <Form.Item label="Education Level" name="educationLevel">
              <Select placeholder="Select education level">
                <Option value="High School">High School</Option>
                <Option value="Associate's Degree">Associate's Degree</Option>
                <Option value="Bachelor's Degree">Bachelor's Degree</Option>
                <Option value="Master's Degree">Master's Degree</Option>
                <Option value="Doctorate">Doctorate</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          )}

          {role === "instructor" && (
            <>
              <Form.Item
                label="Expertise Area"
                name="expertiseArea"
                extra="Separate multiple areas with commas"
              >
                <Input
                  prefix={<BookOutlined />}
                  placeholder="e.g., Web Development, React, JavaScript"
                />
              </Form.Item>

              <Form.Item label="Bio" name="bio">
                <TextArea
                  rows={4}
                  placeholder="Tell students about your experience and teaching philosophy"
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </>
          )}

          <Form.Item className="mb-0">
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsEditModalVisible(false)}>
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

export default UserProfile;
