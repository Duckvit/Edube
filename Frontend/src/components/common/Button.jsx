import React, { memo } from 'react';
import { Link } from 'react-router-dom';

const Button = ({
  to,
  text,
  textColor,
  bgColor,
  bgHover,
  IcBefore,
  onClick,
  fullWidth,
  htmlType,
  isLoading,
  textSize,
  acHover
}) => {
  return to ? (
    <Link to={to} className={`${fullWidth}`}>
      <button
        type={htmlType}
        className={`${textColor} ${bgColor} w-full
            flex items-center justify-center gap-1 cursor-pointer ${textSize}
            p-2 rounded-md hover:underline px-9 font-semibold ${bgHover} `}
        onClick={onClick}
        disabled={isLoading}
      >
        {IcBefore && <IcBefore />}
        {text}
        {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>}
      </button>
    </Link>
  ) : (
    <button
      type={htmlType}
      className={`${textColor} ${bgColor} ${fullWidth} 
            flex items-center justify-center gap-1 cursor-pointer ${textSize}
            p-2 rounded-md hover:underline px-9 ${acHover} font-semibold ${bgHover} `}
      onClick={onClick}
      disabled={isLoading}
    >
      {IcBefore && <IcBefore />}
      {text}
      {isLoading && <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>}
    </button>
  );
};

export default memo(Button);
