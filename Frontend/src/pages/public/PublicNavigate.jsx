import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { UserRegister, UserLogin } from "../../apis/UserServices";
import { Modal, Form, Input, Button, Checkbox, Radio } from "antd";
import { MailOutlined, LockOutlined, UserOutlined } from "@ant-design/icons";
import path from "../../utils/path";

export const PublicNavigate = ({
  openSignIn,
  openSignUp,
  onCloseSignInSignUp,
}) => {
  const [form] = Form.useForm();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState({ username: "", password: "" });
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [scrollY, setScrollY] = useState(0);

  const navigate = useNavigate();

  const handleCancel = () => {
    setShowSignIn(false);
    setShowSignUp(false);
    if (onCloseSignInSignUp) onCloseSignInSignUp();
  };

  useEffect(() => {
    if (openSignIn) setShowSignIn(true);
    if (openSignUp) setShowSignUp(true);
  }, [openSignIn, openSignUp]);

  // const onFinish = (values) => {
  //   const { email, password } = values;
  //   if (email && password) {
  //     setLoading(true);
  //     console.log("Form values:", values);

  //     setTimeout(() => {
  //       setLoading(false);
  //       setShowSignIn(false);

  //       if (email === "i@gmail.com" && password === "123") {
  //         toast.success("Login successfully!");
  //         navigate(path.PUBLIC_INSTRUCTOR);
  //       } else if (email === "a@gmail.com" && password === "123") {
  //         toast.success("Login successfully!");
  //         navigate(path.PUBLIC_ADMIN);
  //       }else if (email === "learn@gmail.com" && password === "123") {
  //         toast.success("Login successfully!");
  //         navigate(path.PUBLIC_LEARNER);
  //       }
  //       else {
  //         toast.error("Login failed!");
  //         console.log("Email or password incorrect!");
  //       }
  //     }, 1500);
  //   }
  // };

  const onFinish = (values) => {
    setPayload(values);
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await UserLogin(values);
      setLoading(false);
      if (response?.data?.token) {
        navigate("/learner");
        toast.success("Login Successful");
      } else if (response?.status === 400) {
        toast.error(response.data.message || "Login failed, please try again.");
      } else {
        toast.error("Unexpected error occurred, please try again.");
      }
    } catch (error) {
      setLoading(false);
      toast.error("An error occurred during login. Please check your network.");
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await UserRegister(values);
      setLoading(false);

      if (response && response.status === 200) {
        toast.success("Register Successful");
        switchToSignIn;
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

  const switchToSignIn = () => {
    registerForm.resetFields();
    loginForm.resetFields();
    setShowSignUp(false);
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
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-yellow-600 bg-clip-text text-transparent">
              Edube
            </span>
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
          <div className="hidden lg:flex items-center space-x-4">
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
              onFinish={handleLogin}
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
                  id="login-username"
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
                  id="login-password"
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
                  href="#"
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
                  // onClick={handleLogin}
                  size="large"
                  className="w-full h-12 !bg-gradient-to-r !from-sky-600 !to-blue-600 !border-none !rounded-xl !font-semibold !text-lg hover:!from-blue-700 hover:!to-blue-700 !text-white"
                >
                  Sign in{" "}
                </Button>
              </Form.Item>
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

          {/* Register Modal */}
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
                    id="register-username"
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

                {/* <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true }]}
                >
                  <Radio.Group className="w-full flex justify-between">
                    <Radio value="student">Student</Radio>
                    <Radio value="instructor">Instructor</Radio>
                  </Radio.Group>
                </Form.Item> */}

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please create a password" },
                  ]}
                >
                  <Input.Password
                    id="register-password"
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
                    id="confirm-register-password"
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
        </div>
      </div>
    </header>
  );
};

export default PublicNavigate;
