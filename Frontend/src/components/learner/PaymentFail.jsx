import React from "react";
import { Link } from "react-router-dom";

export const PaymentFail = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h4 className="text-2xl font-semibold text-red-600 mb-3">
        Thanh toán thất bại ❌
      </h4>
      <p className="text-gray-700 mb-5">
        Nếu có bất kỳ câu hỏi nào, hãy gửi email tới{" "}
        <a
          href="mailto:support@payos.vn"
          className="text-indigo-600 hover:underline"
        >
          support@payos.vn
        </a>
      </p>
      <Link
        to="/learner"
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
      >
        Trở về trang Tạo Link thanh toán
      </Link>
    </div>
  );
}

export default PaymentFail;