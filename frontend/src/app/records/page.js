import React from "react";
import Header from "../components/Header";

const Records = () => {
  return (
    <div className="w-screen h-screen flex flex-col align-center justify-center">
      <Header />
      <div className="w-screen h-[92vh] xl:h-[88vh] flex align-center justify-center">
        <div className="border h-full w-[60vw]">right</div>
        <div className="border h-full w-full">left</div>
      </div>
    </div>
  );
};

export default Records;
