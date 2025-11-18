import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { getProfile } from "../../apis/UserServices";
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
} from "@ant-design/icons";
import { getAllActiveCoursesByMentorId } from "../../apis/CourseServices";

const { Option } = Select;
const { TextArea } = Input;

export const UserProfile = () => {
  const { role, userData, setIsUpdate, isUpdate } = useUserStore();
  const [displayRole, setDisplayRole] = useState(role || null);
  const navigate = useNavigate();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { name, id } = useParams();

  const [profile, setProfile] = useState(null);
  const [mentorStats, setMentorStats] = useState(null);

  // effectiveRole prefers backend-detected role (profile.learner/profile.mentor), then displayRole, then store role
  const effectiveRole =
    (profile &&
      (profile.learner ? "learner" : profile.mentor ? "mentor" : null)) ||
    displayRole ||
    role;

  // merge top-level user with nested learner/mentor object for easier access in UI
  const currentProfile = profile
    ? profile.learner
      ? { ...profile, ...profile.learner }
      : profile.mentor
      ? { ...profile, ...profile.mentor }
      : { ...profile }
    : null;

  useEffect(() => {
    const fetchProfile = async () => {
      const roleProfile = name ? name.toUpperCase() : role;
      // try multiple fallbacks for username/token
      const username =
        localStorage.getItem("username") ||
        userData?.username ||
        (useUserStore.getState && useUserStore.getState().username) ||
        null;
      const token =
        localStorage.getItem("token") ||
        userData?.token ||
        (useUserStore.getState && useUserStore.getState().token) ||
        null;

      if (!username || !token) {
        // still attempt to fetch if we have at least username; otherwise skip
        if (!username) return;
      }

      try {
        const response = await getProfile(username, token);
        const user = response?.user || null;

        // store the raw user object and derive currentProfile above
        setProfile(user);

        // derive display role from returned user if not already set
        if (user) {
          const derived = user.learner
            ? "learner"
            : user.mentor
            ? "mentor"
            : role || "learner";
          setDisplayRole(derived);
        }
        // If mentor, fetch mentor stats (active courses, total learners)
        if (user && (user.mentor || derived === "mentor")) {
          try {
            const mentorId = (user.mentor && user.mentor.id) || user.id;
            const token = localStorage.getItem("token");
            if (mentorId && token) {
              const data = await getAllActiveCoursesByMentorId(mentorId, token);
              // The API from MentorDashboard returns structure with totalActiveCourses and totalLearners
              setMentorStats(data || {});
            }
          } catch (err) {
            console.error("Failed to fetch mentor stats for profile", err);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, []);

  const showEditModal = () => {
    // Prevent opening the edit modal before profile is loaded
    if (!currentProfile) {
      message.warning("Profile is still loading. Please wait a moment.");
      return;
    }

    const activeRole = effectiveRole;

    if (activeRole === "learner") {
      form.setFieldsValue({
        username: currentProfile?.username,
        fullName: currentProfile?.fullName,
        email: currentProfile?.email,
        phone: currentProfile?.phone,
        educationLevel: currentProfile?.educationLevel,
        avatarUrl: currentProfile?.avatarUrl,
      });
    } else {
      form.setFieldsValue({
        username: currentProfile?.username,
        fullName: currentProfile?.fullName,
        email: currentProfile?.email,
        phone: currentProfile?.phone,
        expertiseArea: currentProfile?.expertiseArea,
        bio: currentProfile?.bio,
        avatarUrl: currentProfile?.avatarUrl,
      });
    }

    setIsEditModalVisible(true);
  };

  const handleEditSubmit = async (values) => {
    try {
      setProfile({
        ...profile,
        [effectiveRole]: {
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
    effectiveRole === "mentor" && currentProfile?.expertiseArea
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
        {/* <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">
              {effectiveRole === "learner"
                ? "Manage your personal information"
                : "Manage your mentor information"}
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
        </div> */}

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
                    effectiveRole === "learner"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {effectiveRole === "learner" ? (
                    <UserOutlined className="mr-1" />
                  ) : (
                    <TrophyOutlined className="mr-1" />
                  )}
                  {effectiveRole === "learner" ? "Learner" : "Mentor"}
                </div>

                {effectiveRole === "mentor" && (
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
                  {effectiveRole === "learner" && (
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

                {effectiveRole === "learner" && (
                  <Descriptions.Item label="Education Level">
                    <span className="font-medium text-gray-900">
                      {currentProfile?.educationLevel || "Not provided"}
                    </span>
                  </Descriptions.Item>
                )}

                {effectiveRole === "mentor" && (
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
                effectiveRole === "learner"
                  ? "Learning Statistics"
                  : "Teaching Statistics"
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {effectiveRole === "learner" ? (
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
                        {mentorStats?.totalActiveCourses ?? 15}
                      </div>
                      <div className="text-sm text-gray-600">
                        Active Courses
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-3xl font-bold text-green-600 mb-1">
                        {mentorStats?.totalLearners ?? 2847}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Students
                      </div>
                    </div>
                    {/* <div className="text-center p-4 bg-amber-50 rounded-lg">
                      <div className="text-3xl font-bold text-amber-600 mb-1">
                        {currentProfile?.rating ?? 4.9}
                      </div>
                      <div className="text-sm text-gray-600">
                        Average Rating
                      </div>
                    </div> */}
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

          {effectiveRole === "learner" && (
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

          {effectiveRole === "mentor" && (
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
