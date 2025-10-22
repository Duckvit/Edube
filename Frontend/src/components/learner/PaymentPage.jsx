import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button } from "antd";
import { courseData } from "../../utils/mockData";
import { useCourseStore } from '../../store/useCourseStore';

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courseData[id] || courseData.CRS001;

  const handlePay = () => {
    // mark as enrolled in store
    const { enrollCourse } = useCourseStore.getState();
    enrollCourse(id);
    alert("Thanh toán thành công!");
    // navigate to learner dashboard my-learning or detail
    navigate(`/learner/course-detail/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">Payment</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card title="Thông tin khóa học" className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="font-semibold text-lg">{course.title}</div>
              <div className="text-sm text-gray-600">
                by {course.instructor}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-gray-900">
                {course.price ? `${course.price} USD` : "Free"}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex space-x-4">
            <Button
              className="!bg-gray-200 !text-black"
              onClick={() => navigate(-1)}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              className="!bg-gradient-to-r !from-sky-600 !to-yellow-600 !border-none"
              onClick={handlePay}
            >
              Thanh toán
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;
