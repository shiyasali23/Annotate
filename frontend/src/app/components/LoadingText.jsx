import React from 'react';

const LoadingText = ({ text = "Loading...", className }) => {
  return (
    <h2 className={`xl:text-2xl text-lg  flex items-center justify-center font-semibold text-gray-700 animate-pulse ${className}`}>{text}...</h2>
  );
};

export default LoadingText;
