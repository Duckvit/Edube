import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { MailOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/useUserStore";
import { sendOTPEmail } from "../../apis/UserServices";
import icons from "../../utils/icon";

export const ForgotPass = () => {
  const [form] = Form.useForm();
  const [payload, setPayload] = useState({});
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState(false);
  const { setEmail, setUsername } = useUserStore();
  const { FaSignInAlt } = icons;
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý sau khi form được submit
  const onFinish = (values) => {
    setPayload(values);
    handleCheckEmail(values);
  };

    const handleCheckEmail = async (dataSent) => {
      setIsLoading(true);
      const response = await sendOTPEmail(dataSent);
      setIsLoading(false);
      if (response?.statusCode === 200) {
        setUsername(dataSent.username)
        setEmail(dataSent.email);
        navigate("/send-recovery-otp");
      } else setIsValid(true);
    };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center p-6 mt-4">
      <div className="w-full max-w-md shadow-2xl p-6 gap-8 border flex flex-col items-center justify-center rounded-lg">
        <h1 className="text-3xl font-semibold text-cyan-600 font-Merriweather text-center">
          Welcome To Edube
        </h1>
        <div className="flex justify-start items-center w-full gap-5 border-b text-lg font-bold">
          <span className="text-gray-600 border-b-4 border-blue-600">
            Find your account
          </span>
        </div>
        <div className="w-full">
          <Form
            name="normal_login"
            initialValues={{ remember: true }}
            form={form}
            onFinish={onFinish}
          >
            <Form.Item
              name="username"
              rules={[
                {
                  required: true,
                  message: "Please input your username!",
                },
              ]}
            >
              <Input
                id="username"
                prefix={<UserOutlined className="mr-2" />}
                placeholder="Username"
                className="text-xl"
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Please input your email!",
                },
                {
                  type: "email",
                  message: "Please enter a valid email !",
                },
              ]}
            >
              <div>
                <Input
                  prefix={<MailOutlined className="mr-2" />}
                  placeholder="Email"
                  className="text-xl"
                  onChange={() => {
                    setIsValid(false);
                  }}
                />
                {isValid && <p className="text-red-500">Email or Username not valid !!!</p>}
              </div>
            </Form.Item>

            <Form.Item className="flex items-center justify-center w-full">
              <Button
                textcolor="text-white"
                bgcolor="bg-main-1"
                bghover="hover:bg-main-2"
                htmlType="submit"
                isLoading={isLoading}
                // size="large"
                className="w-full h-12 !bg-gradient-to-r !from-sky-600 !to-blue-600 !border-none !rounded-xl !font-semibold !text-lg hover:!from-blue-700 hover:!to-blue-700 !text-white"
              >
                Next
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;
