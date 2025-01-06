"use client";
import { useState } from "react";
import CameraModule from "../components/CameraModule";
import ResultComponent from "../components/ResultComponent";
import Header from "../components/Header";

const Result = () => {
  const [cameraAllow, setCameraAllow] = useState(false);
  const ResultsArray = [
    ["Dryness", 26],
    ["Pimples", 40],
    ["Wrinkles", 64],
    ["Dark Circles", 20],
    ["Redness", 60],
    ["Freckles", 86],
  ];
  const servicesArray = [
    ["Food recemenation based on your biochemcials", "Food Recomendands"],
    ["Have a look in our desease detection tools", "Desease Detection"],
    ["Get a analytics report for your biochemcials", "Analytics Platform"],
    ["Feeling any symptoms try our diagnostics", "Diagnostics Center"],
  ];

  const handleStartCamera = () => {
    setCameraAllow(!cameraAllow);
  };

  return (
    <div className="h-screen">
      <Header />
      <div className="flex items-center w-full h-[50%] justify-center">
        <div className="w-full h-full justify-center  flex flex-col items-center gap-5 p-8">
          <CameraModule
            loading={false}
            cameraAllow={cameraAllow}
            setCameraAllow={setCameraAllow}
            isFromResult={true}
          />
          <button
            className="px-4 py-2  bg-black text-white rounded-md hover:bg-gray-800 transition-colors  lg:text-l md:text-md sm:text-sm font-medium"
            onClick={handleStartCamera}
          >
            {cameraAllow ? "Stop Camera" : "Start Camera"}
          </button>
        </div>
        <div className="w-full h-full flex items-center justify-center p-3">
          <ResultComponent ResultsArray={ResultsArray} />
        </div>
      </div>
      <div className="w-full h-[50%] lg:h-[50%] border-t border-gray-200 flex flex-col lg:flex-row items-center p-3">
        {/* Left Side - Try Our Services */}
        <div className="w-full lg:w-1/2 text-center lg:text-left flex flex-col items-center justify-center lg:mb-0 ">
          <h2 className="text-5xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
            Try Our
          </h2>
          <h3 className="text-sm sm:text-base md:text-lg lg:text-3xl font-medium">
            Other Services
          </h3>
        </div>

        {/* Right Side - Services Buttons */}
        <div className="w-full lg:w-1/2 flex flex-col  justify-center items-center lg:items-start">
          {servicesArray.map((service, index) => (
            <div
              key={index}
              className="flex flex-col items-start justify-between w-full lg:w-[90%] p-1"
            >
              <h2 className="text-center text-xs sm:text-sm font-bold">
                {service[0]}
              </h2>
              <button className="px-3 py-1 bg-black text-white text-xs sm:text-xs md:text-sm lg:text-base font-medium  hover:bg-gray-800 transition-all duration-300 w-full lg:w-auto">
                {service[1]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
