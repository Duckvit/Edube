import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { UserRegister, UserLogin, getProfile } from "../../apis/UserServices";
import { createMentor } from "../../apis/MentorServices";
import { createLearner } from "../../apis/LearnerServices";
import { Modal, Form, Input, Button, Divider } from "antd";
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { roleForComponent } from "../../utils/constant";
import { useUserStore } from "../../store/useUserStore";
import icons from "../../utils/icon";
import TextArea from "antd/es/input/TextArea";

export const PublicNavigate = ({
  openSignIn,
  openSignUp,
  onCloseSignInSignUp,
}) => {
  const [form] = Form.useForm();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showMentorSignUp, setShowMentorSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({ username: "", password: "" });
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [mentorRegisterForm] = Form.useForm();
  const [scrollY, setScrollY] = useState(0);
  const { setModal, role, resetUserStore } = useUserStore();
  const { FcGoogle } = icons;
  const location = useLocation();

  const navigate = useNavigate();

  const handleLoginGoogle = () => {
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  const handleCancel = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    setShowMentorSignUp(false);
    if (onCloseSignInSignUp) onCloseSignInSignUp();
  };

  useEffect(() => {
    if (openSignIn) setShowSignIn(true);
    if (openSignUp) setShowSignUp(true);
  }, [openSignIn, openSignUp]);

  const handleLogin = async () => {
    const { setModal, setUserData } = useUserStore.getState();

    if (!payload.username || !payload.password) {
      toast.error("Username and password are required.");
      return;
    }

    setLoading(true);
    try {
      const response = await UserLogin(payload);
      setLoading(false);

      if (response?.data?.token) {
        const token = response.data.token;
        const userRole = response.data.role;

        setModal(token, userRole, true);

        const profileRes = await getProfile(payload.username, token);
        if (profileRes?.user) {
          setUserData(profileRes.user); // Lưu vào Zustand
        }

        const dashboardPath = roleForComponent[userRole];
        if (userRole && dashboardPath) {
          toast.success("Login successful!");
          navigate("/" + dashboardPath);
        } else {
          toast.error("Invalid role.");
        }
      } else if (response?.status === 400) {
        toast.error(response.data.message || "Login failed, please try again.");
      } else {
        toast.error("Unexpected error occurred, please try again.");
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        "An error occurred during login. Please check your network connection."
      );
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await UserRegister(values);
      setLoading(false);

      if (response && response.status === 200) {
        toast.success("Register Successful");
        switchToSignIn();
      } else if (response?.status === 400) {
        toast.error(response.data.message || "Login failed, please try again.");
      } else {
        toast.error("Unexpected error occurred, please try again.");
      }
    } catch (error) {
      setLoading(false);
      console.log("Error register: ", error);
      toast.error("An error occurred during login. Please check your network.");
    }
  };

  const handleMentorRegister = async (values) => {
    setLoading(true);
    try {
      console.log("🚀 Starting mentor registration...");

      const userPayload = {
        username: values.username,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
      };

      console.log("📝 Step 1: Creating user...", userPayload);
      const userResponse = await UserRegister(userPayload);
      console.log("✅ User response:", userResponse);

      // Check both HTTP status and backend statusCode
      const userHttpStatus = userResponse?.status;
      const userBackendStatus = userResponse?.data?.statusCode;
      const isUserSuccess =
        userHttpStatus === 200 ||
        userHttpStatus === 201 ||
        userBackendStatus === 200 ||
        userBackendStatus === 201;

      if (isUserSuccess) {
        const createdUser = userResponse.data?.user || userResponse.data;
        console.log("✅ User created successfully:", createdUser);

        if (!createdUser?.id) {
          console.error("❌ User ID not found in response:", createdUser);
          toast.error("❌ Failed to get user ID. Please try again.");
          setLoading(false);
          return;
        }

        // Step 2: Auto-login to get token for creating mentor profile
        console.log("📝 Step 2: Auto-login to get token...");
        const loginPayload = {
          username: values.username,
          password: values.password,
        };

        let loginToken = null;
        let loginResponse = null;
        let userRole = "MENTOR";

        try {
          loginResponse = await UserLogin(loginPayload);
          console.log("✅ Login response:", loginResponse);

          if (loginResponse?.data?.token) {
            loginToken = loginResponse.data.token;
            userRole = loginResponse.data?.role || "MENTOR";
            console.log("✅ Token obtained:", loginToken);
            console.log("✅ User role:", userRole);

            // Save token to localStorage so axios interceptor can use it
            localStorage.setItem("token", loginToken);
            console.log("✅ Token saved to localStorage");
          } else {
            console.error("❌ No token in login response:", loginResponse);
            toast.error(
              "⚠️ User created but login failed. Please login manually."
            );
            setShowMentorSignUp(false);
            switchToSignIn();
            setLoading(false);
            return;
          }
        } catch (loginError) {
          console.error("❌ Login error:", loginError);
          toast.error(
            "⚠️ User created but auto-login failed. Please login manually to complete mentor registration."
          );
          setShowMentorSignUp(false);
          switchToSignIn();
          setLoading(false);
          return;
        }

        // Step 3: Create mentor profile with token
        // Token is automatically added by axiosConfig interceptor from localStorage
        const mentorPayload = {
          user: { id: createdUser.id },
          bio: values.bio,
          expertiseAreas: values.expertiseAreas,
          qualification: values.qualification,
        };

        console.log("📝 Step 3: Creating mentor profile...");
        console.log("📝 Request body:", JSON.stringify(mentorPayload, null, 2));
        console.log(
          "📝 Token in localStorage:",
          localStorage.getItem("token") ? "Present" : "Missing"
        );
        const token = localStorage.getItem("token");
        console.log("🔑 Token being sent:", token);

        const mentorResponse = await createMentor(mentorPayload, token);
        console.log("🔑 Header token check:", token);

        console.log("✅ Mentor response:", mentorResponse);

        // Check both HTTP status and backend statusCode
        // createMentor now returns res (not res.data), so check both status and data.statusCode
        const mentorHttpStatus = mentorResponse?.status;
        const mentorBackendStatus = mentorResponse?.data?.statusCode;
        const isMentorSuccess =
          mentorHttpStatus === 200 ||
          mentorHttpStatus === 201 ||
          mentorBackendStatus === 200 ||
          mentorBackendStatus === 201;

        if (isMentorSuccess) {
          console.log("🎉 Mentor registration completed successfully!");

          // Set user data and role in store
          const { setModal, setUserData } = useUserStore.getState();
          setModal(loginToken, userRole, true);

          // Get profile to save user data
          try {
            const profileRes = await getProfile(values.username, loginToken);
            if (profileRes?.user) {
              setUserData(profileRes.user);
              console.log("✅ User profile loaded:", profileRes.user);
            }
          } catch (profileError) {
            console.warn("⚠️ Could not load user profile:", profileError);
          }

          toast.success("🎉 Mentor registration successful!");

          // Navigate to mentor dashboard
          const dashboardPath = roleForComponent[userRole];
          if (userRole && dashboardPath) {
            setTimeout(() => {
              setShowMentorSignUp(false);
              navigate("/" + dashboardPath);
            }, 1000);
          } else {
            setTimeout(() => {
              setShowMentorSignUp(false);
              switchToSignIn();
            }, 1000);
          }
        } else {
          console.error("❌ Mentor creation failed:", {
            httpStatus: mentorHttpStatus,
            backendStatus: mentorBackendStatus,
            message: mentorResponse?.data?.message,
            fullResponse: mentorResponse,
          });
          toast.error(
            mentorResponse?.data?.message ||
              "❌ Failed to create mentor profile. Please check console for details."
          );
          // Clear token if mentor creation failed
          localStorage.removeItem("token");
        }
      } else {
        console.error("❌ User creation failed:", {
          httpStatus: userHttpStatus,
          backendStatus: userBackendStatus,
          message: userResponse?.data?.message,
          fullResponse: userResponse,
        });
        toast.error(
          userResponse?.data?.message ||
            "❌ Failed to create user. Please try again."
        );
      }
    } catch (error) {
      console.error("❌ Error in mentor register:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
        status: error?.response?.status,
      });

      // Clear token on error
      localStorage.removeItem("token");

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "⚠️ Registration failed. Please check your network and try again.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      console.log("🏁 Mentor registration process finished");
    }
  };

  const switchToSignIn = () => {
    registerForm.resetFields();
    mentorRegisterForm.resetFields();
    loginForm.resetFields();
    setShowSignUp(false);
    setShowMentorSignUp(false);
    setShowSignIn(true);
  };

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPayload((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/FIB_logo.png"
              alt="Logo"
              className="object-cover h-[5vh]"
            />
            <a
              href="/"
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent"
            >
              Edube
            </a>
          </div>

          {/* Navigation */}
          <nav
            className={`hidden lg:flex items-center space-x-10 transition-all duration-300 ${
              scrollY > 50 ? "bg-white/95 backdrop-blur-md" : "bg-transparent"
            }`}
          >
            <a
              href="#platform"
              className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
            >
              Platform
            </a>
            <a
              href="#features"
              className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
            >
              How It Works
            </a>
          </nav>

          {/* CTA */}
          <div className="hidden lg:flex items-center space-x-3">
            <button
              className="text-gray-700 hover:text-cyan-600 transition-colors font-medium px-4 py-2"
              onClick={() => setShowSignIn(true)}
            >
              Sign In
            </button>
            <button
              className="bg-gradient-to-r from-sky-600 to-yellow-600 text-white px-8 py-3 rounded-2xl hover:from-sky-700 hover:to-yellow-700 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              onClick={() => setShowSignUp(true)}
            >
              Get Started
            </button>
            <button
              className="border-2 border-sky-600 text-blue-600 px-6 py-2 rounded-2xl hover:bg-sky-50 transition-all font-semibold"
              onClick={() => setShowMentorSignUp(true)}
            >
              Be a Mentor now
            </button>
          </div>

          {/* Log In Modal */}
          <Modal
            open={showSignIn}
            onCancel={handleCancel}
            footer={null}
            centered
            width={420}
            styles={{
              body: {
                padding: "2rem",
              },
            }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <img src="FIB_logo.png" className="object-cover h-[5vh]" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to continue your learning journey
              </p>
            </div>

            {/* Log in Modal */}
            <Form
              form={loginForm}
              layout="vertical"
              // onFinish={handleLogin}
              initialValues={{
                remember: true,
              }}
              className="space-y-4"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Username!",
                  },
                ]}
              >
                <Input
                  name="username"
                  id="loginUsername"
                  prefix={<UserOutlined className="mr-2" />}
                  placeholder="Username"
                  className="text-xl"
                  onChange={handleInputChange} // Gán hàm xử lý onChange
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please enter your password!" },
                ]}
              >
                <Input.Password
                  name="password"
                  id="loginPassword"
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Enter your password"
                  size="large"
                  onChange={handleInputChange}
                />
              </Form.Item>

              <div className="flex items-center justify-between mb-4">
                {/* <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Remember me</Checkbox>
              </Form.Item> */}
                <a
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Forgot password?
                </a>
              </div>

              <Form.Item>
                <Button
                  textcolor="text-white"
                  bgcolor="bg-main-1"
                  bghover="hover:bg-main-2"
                  htmlType="submit"
                  loading={loading}
                  onClick={handleLogin}
                  size="large"
                  className="w-full h-12 !bg-gradient-to-r !from-sky-600 !to-blue-600 !border-none !rounded-xl !font-semibold !text-lg hover:!from-blue-700 hover:!to-blue-700 !text-white"
                >
                  Sign in{" "}
                </Button>
              </Form.Item>
              <Divider style={{ borderColor: "#C1C1C1" }}>Sign in with</Divider>
              <Button
                icon={<FcGoogle size={20} />}
                block
                onClick={handleLoginGoogle}
                className="w-full bg-gray-100 hover:bg-blue-300 flex items-center justify-center"
              >
                Google
              </Button>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button
                  onClick={() => {
                    setShowSignIn(false);
                    setShowSignUp(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up here
                </button>
              </p>
            </div>
          </Modal>

          {/* Register Modal - Learner */}
          <Modal
            open={showSignUp}
            onCancel={handleCancel}
            footer={null}
            centered
            width={450}
            styles={{
              body: { padding: "2rem" },
            }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img src="FIB_logo.png" className="object-cover h-[5vh]" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Join Edube
              </h2>
              <p className="text-gray-600">
                Create your account and start learning today
              </p>
            </div>

            <div className="max-h-70 overflow-y-auto p-5">
              <Form
                form={registerForm}
                layout="vertical"
                onFinish={handleRegister}
              >
                <Form.Item
                  label="FullName"
                  name="fullName"
                  rules={[
                    { required: true, message: "Please enter your full name" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter your full name"
                    className="rounded-xl"
                  />
                </Form.Item>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    { required: true, message: "Please enter your username" },
                  ]}
                >
                  <Input
                    id="registerUsername"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter your username"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Invalid email format" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Enter your email"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please create a password" },
                  ]}
                >
                  <Input.Password
                    id="registerPassword"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Create a password"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    id="register-confirm-password"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Confirm your password"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    className="w-full h-12 !bg-gradient-to-r !from-sky-600 !to-yellow-600 !border-none !rounded-xl !font-semibold !text-lg hover:!from-sky-700 hover:!to-yellow-700 !text-white"
                  >
                    Create Account
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="text-center mt-2">
              Already have an account?{" "}
              <button
                onClick={switchToSignIn}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </button>
            </div>
          </Modal>

          <Modal
            open={showMentorSignUp}
            onCancel={handleCancel}
            footer={null}
            centered
            width={450}
            styles={{
              body: { padding: "2rem" },
            }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <img src="FIB_logo.png" className="object-cover h-[5vh]" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Become a Mentor
              </h2>
              <p className="text-gray-600">
                Share your knowledge and inspire learners worldwide
              </p>
            </div>

            <div className="max-h-70 overflow-y-auto p-5">
              <Form
                form={mentorRegisterForm}
                layout="vertical"
                onFinish={handleMentorRegister}
              >
                <Form.Item
                  label="FullName"
                  name="fullName"
                  rules={[
                    { required: true, message: "Please enter your full name" },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter your full name"
                    className="rounded-xl"
                  />
                </Form.Item>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    { required: true, message: "Please enter your username" },
                  ]}
                >
                  <Input
                    id="mentorUsername"
                    prefix={<UserOutlined className="text-gray-400" />}
                    placeholder="Enter your username"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Invalid email format" },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined className="text-gray-400" />}
                    placeholder="Enter your email"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please create a password" },
                  ]}
                >
                  <Input.Password
                    id="mentorPassword"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Create a password"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  dependencies={["password"]}
                  rules={[
                    { required: true, message: "Please confirm your password" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(
                          new Error("Passwords do not match")
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    id="mentor-confirm-password"
                    prefix={<LockOutlined className="text-gray-400" />}
                    placeholder="Confirm your password"
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Bio"
                  name="bio"
                  rules={[
                    { required: true, message: "Please enter your bio" },
                    // { min: 50, message: "Bio must be at least 50 characters" },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder="Tell us about yourself and your passion for teaching..."
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Expertise Areas"
                  name="expertiseAreas"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your expertise areas",
                    },
                    // { min: 10, message: "Expertise areas must be at least 10 characters" },
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="e.g., C++, Java, Data Structure & Algorithm, Web Development..."
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label="Qualifications"
                  name="qualification"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your qualifications",
                    },
                    // { min: 10, message: "Qualifications must be at least 10 characters" },
                  ]}
                >
                  <Input
                    prefix={<TrophyOutlined className="text-gray-400" />}
                    placeholder="e.g., Top 10 Students in the class, 5 years experience..."
                    className="rounded-xl"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    className="w-full h-12 !bg-gradient-to-r !from-sky-600 !to-blue-600 !border-none !rounded-xl !font-semibold !text-lg hover:!from-sky-700 hover:!to-blue-700 !text-white"
                  >
                    Become a Mentor
                  </Button>
                </Form.Item>
              </Form>
            </div>

            <div className="text-center mt-2">
              Already have an account?{" "}
              <button
                onClick={switchToSignIn}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </button>
            </div>
          </Modal>
        </div>
      </div>
    </header>
  );
};

export default PublicNavigate;
