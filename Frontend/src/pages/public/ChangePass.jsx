import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import {
  EyeInvisibleFilled,
  EyeTwoTone,
  LockOutlined,
} from "@ant-design/icons";
import { useUserStore } from "../../store/useUserStore";
import icons from "../../utils/icon";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ChangePass = () => {
  const [form] = Form.useForm();
  const [isShowPass, setIsShowPass] = useState(false);
  const { email, otp, resetChangePass } = useUserStore();
  const { FaSignInAlt } = icons;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = (values) => {
    const dataSent = {
      newPassword: values.confirmNewPassword,
      otpCode: otp,
      email: email,
    };
    handleChangePass(dataSent);
  };

  const handleChangePass = async (dataSent) => {
    setIsLoading(true);
    const response = await changePassword(dataSent);
    setIsLoading(false);
    if (response?.statusCode === 200) {
      toast.success("Change password successFully!");
    } else toast.error("Change password fail, please try again!");
    navigate("/public/login");
    resetChangePass();
  };

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center p-6">
      <div
        className="w-1/3 shadow-2xl p-6 gap-8 border
                flex flex-col items-center justify-center rounded-lg"
      >
        <h1 className="text-3xl font-semibold text-cyan-600 font-Merriweather text-center">
          Welcome To Edube
        </h1>
        <div className="flex justify-start items-center w-full gap-5 border-b text-lg font-bold">
          <span className="text-gray-600 border-b-4 border-blue-600">
            Change Password
          </span>
        </div>
        <div className="w-full">
          <Form
            name="change_password"
            initialValues={{ remember: true }}
            form={form}
            onFinish={onFinish}
          >
            {/* Password field */}
            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: "Please input your new Password!" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters long",
                },
              ]}
            >
              <Input
                prefix={<LockOutlined className="mr-2" />}
                type={isShowPass ? "text" : "password"}
                placeholder="New Password"
                className="text-xl"
                suffix={
                  isShowPass ? (
                    <EyeTwoTone
                      className="text-gray-400"
                      onClick={() => setIsShowPass(false)}
                    />
                  ) : (
                    <EyeInvisibleFilled
                      className="text-gray-400"
                      onClick={() => setIsShowPass(true)}
                    />
                  )
                }
              />
            </Form.Item>

            {/* Confirm Password field */}
            <Form.Item
              name="confirmNewPassword"
              dependencies={["newPassword"]}
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("The two passwords do not match!")
                    );
                  },
                }),
              ]}
            >
              <Input
                prefix={<LockOutlined className="mr-2" />}
                type={isShowPass ? "text" : "password"}
                placeholder="Confirm Password"
                className="text-xl"
                suffix={
                  isShowPass ? (
                    <EyeTwoTone
                      className="text-gray-400"
                      onClick={() => setIsShowPass(false)}
                    />
                  ) : (
                    <EyeInvisibleFilled
                      className="text-gray-400"
                      onClick={() => setIsShowPass(true)}
                    />
                  )
                }
              />
            </Form.Item>

            {/* Submit button */}
            <Button
              textcolor="text-white"
              bgcolor="bg-main-1"
              bghover="hover:bg-main-2"
              htmlType="submit"
              isLoading={isLoading}
              // size="large"
              className="w-full h-12 !bg-gradient-to-r !from-sky-600 !to-blue-600 !border-none !rounded-xl !font-semibold !text-lg hover:!from-blue-700 hover:!to-blue-700 !text-white"
            >
              Confirm
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChangePass;
