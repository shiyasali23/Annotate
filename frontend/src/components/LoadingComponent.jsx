import { Loader } from "lucide-react";
import React from "react";

const LoadingComponent = ({ text , className }) => {
  return (
    <div className="flex justify-center flex-col items-center w-full h-full gap-5 m-auto">
      <h2
        className={`xl:text-2xl text-lg  flex items-center justify-center font-semibold text-gray-700 animate-pulse ${className}`}
      >
        {text}
      </h2>
      <Loader className="animate-spin" />
    </div>
  );
};

export default LoadingComponent;
