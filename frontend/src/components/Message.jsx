import React from 'react';

const Message = ({ message, onClose }) => {
  return (
    <div className="fixed top-10 left-1/2 transform -translate-x-1/2 w-[300px] sm:w-[400px] bg-red-500 bg-opacity-90 text-white p-4 rounded-lg shadow-lg flex items-center justify-between z-50">
      <p className="text-sm">{message}</p>
      <button onClick={onClose} className="ml-4 text-white">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          ></path>
        </svg>
      </button>
    </div>
  );
};

export default Message;
