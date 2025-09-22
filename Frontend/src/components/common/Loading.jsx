import React from 'react';
import { Alert, Spin } from 'antd';

const Loading = () => {
  const contentStyle = {
    padding: 50,
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4
  };
  const content = <div style={contentStyle} />;

  return (
    <div className="flex items-center justify-center w-full h-full bg-gray-100 bg-opacity-50 fixed top-0 left-0 z-50">
      <Spin tip="Loading" size="large">
        <div style={contentStyle} />
      </Spin>
    </div>
  );
};

export default Loading;