"use client";
import { useState } from "react";
import CameraModule from "../components/CameraModule";
import ResultComponent from "../components/ResultComponent";

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
    ["Have a look in our desease detection tools", "Detect Desease"],
    ["Get a analytics report for your biochemcials", "Analytics Platform"],
    ["Feeling any symptoms try our diagnostics", "Diagnostics Center"],
  ];

  const handleStartCamera = () => {
    setCameraAllow(!cameraAllow);
  };

  return (
    <div className="h-screen">
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
      <div className="w-full h-[50%] border-t borer-1 border-dashed border-gray-100   flex flex-col items-center ">
        <h2 className=" w-full  my-5 flex items-center justify-center text-3xl font-bold">
          Try Our
        </h2>
        <div className="w-full  p-5 gap-6  flex  justify-around ">
          {servicesArray.map((service, index) => (
            <div key={index} className="w-full h-100 border borer-1 border-dashed border-gray-100    flex flex-col p-3 ">
              <h2 className="w-full h-full flex text-l font-bold text-right">
  {service[0]}
</h2>

              <button className="relative left-[50%] w-[50%] h-[20%] px-2 py-6 flex items-center justify-center bg-black text-white   lg:text-md md:text-sm sm:text-xs font-medium">
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
