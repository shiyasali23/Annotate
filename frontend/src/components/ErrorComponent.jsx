import React from "react";
import CustomButton from "@/components/CustomButton";

const ErrorComponent = ({handleTryAgain}) => {
  return (
    <div className="w-full h-full  mt-10 flex flex-col items-center justify-center gap-4">
      <h1 className="w-full  text-center text-2xl font-semibold">
        Something Went Wrong 
      </h1>
      <CustomButton onClick={handleTryAgain} text="Try Again"/>
    </div>
  );
};

export default ErrorComponent;
