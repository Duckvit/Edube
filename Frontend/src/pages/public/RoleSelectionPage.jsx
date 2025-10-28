import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, Button, Modal, Form, Input, Select } from "antd";
import { BookOpen, Users, Loader2 } from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { path } from "../../utils/path";
import { roleForComponent } from "../../utils/constant";
import { toast } from "react-toastify";
import { createMentor } from "../../apis/MentorServices";
import { createLearner } from "../../apis/LearnerServices";

const { TextArea } = Input;
const { Option } = Select;

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, setModal, userData } = useUserStore();
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Lấy token từ localStorage hoặc query params
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get("token");
  const currentToken = tokenFromUrl || token;

  useEffect(() => {
    if (!currentToken) {
      navigate("/");
    }
  }, [currentToken, navigate]);

  const handleRoleSelection = (role) => {
    setSelectedRole(role);
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmitRoleForm = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setError("");

      const {
        token: currentToken,
        userData: currentUser,
        setModal,
      } = useUserStore.getState();

      // ✅ Dữ liệu gửi lên backend
      const payload = {
        user: { id: currentUser?.id },
        ...values,
      };

      let response;
      if (selectedRole === "mentor") {
        response = await createMentor(payload, currentToken);
      } else if (selectedRole === "learner") {
        response = await createLearner(payload, currentToken);
      } else {
        throw new Error("Invalid role selection");
      }

      if (!response || response.status >= 400) {
        throw new Error("Failed to create user profile");
      }

      const updatedRole = selectedRole.toUpperCase();
      setModal(currentToken, updatedRole, true);

      toast.success("Role created successfully!");
      setModalVisible(false);

      if (roleForComponent[updatedRole]) {
        navigate("/" + roleForComponent[updatedRole]);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create role");
      toast.error(err.message || "Failed to create role");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Choose Your Role
          </h1>
          <p className="text-lg text-gray-600">
            Select how you'd like to use our platform
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Role Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Learner Card */}
          <Card
            className={`p-8 cursor-pointer transition-all duration-300 ${
              selectedRole === "learner"
                ? "ring-2 ring-blue-500 shadow-lg scale-105"
                : "hover:shadow-lg hover:scale-102"
            }`}
            onClick={() => !loading && handleRoleSelection("learner")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-blue-100 rounded-full">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Learner</h2>
              <p className="text-gray-600 mb-6">
                Learn from experienced mentors and grow your skills
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                {[
                  "Browse expert mentors",
                  "Take structured courses",
                  "Real-time chat support",
                  "Track your progress",
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  selectedRole === "learner"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
                disabled={loading && selectedRole !== "learner"}
              >
                {loading && selectedRole === "learner" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue as Learner"
                )}
              </Button>
            </div>
          </Card>

          {/* Mentor Card */}
          <Card
            className={`p-8 cursor-pointer transition-all duration-300 ${
              selectedRole === "mentor"
                ? "ring-2 ring-purple-500 shadow-lg scale-105"
                : "hover:shadow-lg hover:scale-102"
            }`}
            onClick={() => !loading && handleRoleSelection("mentor")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 p-4 bg-purple-100 rounded-full">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor</h2>
              <p className="text-gray-600 mb-6">
                Share your expertise and help others succeed
              </p>
              <ul className="text-left text-sm text-gray-600 space-y-2 mb-6">
                {[
                  "Create courses",
                  "Upload video lessons",
                  "Connect with learners",
                  "Earn from teaching",
                ].map((item, i) => (
                  <li key={i} className="flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  selectedRole === "mentor"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
                disabled={loading && selectedRole !== "mentor"}
              >
                {loading && selectedRole === "mentor" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Continue as Mentor"
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p>You can change your role anytime in your account settings</p>
        </div>
      </div>

      {/* Modal for Role Selection Form */}
      <Modal
        title={selectedRole === "learner" ? "Complete Your Learner Profile" : "Complete Your Mentor Profile"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setSelectedRole(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitRoleForm}
        >
          {selectedRole === "learner" ? (
            <>
              <Form.Item
                name="majorField"
                label="Major Field"
                rules={[{ required: true, message: "Please enter your major field!" }]}
              >
                <Input placeholder="e.g., Computer Science, Business, Engineering" />
              </Form.Item>

              <Form.Item
                name="educationLevel"
                label="Education Level"
                rules={[{ required: true, message: "Please select your education level!" }]}
              >
                <Select placeholder="Select your education level">
                  <Option value="High School">High School</Option>
                  <Option value="Bachelor's Degree">Bachelor's Degree</Option>
                  <Option value="Master's Degree">Master's Degree</Option>
                  <Option value="PhD">PhD</Option>
                  <Option value="Professional Certification">Professional Certification</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="learningPreferences"
                label="Learning Preferences"
                rules={[{ required: true, message: "Please describe your learning preferences!" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="e.g., Visual learning, practical exercises, interactive discussions"
                />
              </Form.Item>
            </>
          ) : (
            <>
              <Form.Item
                name="bio"
                label="Bio"
                rules={[{ required: true, message: "Please enter your bio!" }]}
              >
                <TextArea
                  rows={4}
                  placeholder="Tell us about yourself, your background, and what makes you a great mentor..."
                />
              </Form.Item>

              <Form.Item
                name="expertiseAreas"
                label="Expertise Areas"
                rules={[{ required: true, message: "Please enter your areas of expertise!" }]}
              >
                <Input placeholder="e.g., C++, Java, Data Structure & Algorithm" />
              </Form.Item>

              <Form.Item
                name="qualification"
                label="Qualifications"
                rules={[{ required: true, message: "Please enter your qualifications!" }]}
              >
                <TextArea
                  rows={3}
                  placeholder="e.g., Top 10 Students in the class, Industry experience, Certifications..."
                />
              </Form.Item>
            </>
          )}

          <Form.Item className="mt-6">
            <div className="flex justify-end gap-2">
              <Button onClick={() => {
                setModalVisible(false);
                setSelectedRole(null);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
