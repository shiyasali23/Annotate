import React from "react";
import CustomButton from "@/components/CustomButton";

const ErrorComponent = ({heading = "Something Went Wrong",buttonText="Try Again",handleTryAgain}) => {
  return (
    <div className="w-full h-full  m-auto flex flex-col items-center justify-center gap-8 ">
      <h1 className="w-full  text-center text-3xl font-semibold">
        {heading} 
      </h1>
      <CustomButton onClick={() => handleTryAgain} text={buttonText} />
    </div>
  );
};

export default ErrorComponent;
