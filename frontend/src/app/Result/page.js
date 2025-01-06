"use client";

import { useState } from "react";
import CameraModule from "../components/CameraModule";
import ResultComponent from "../components/ResultComponent";
import Header from "../components/Header";
import Button from "../components/Button";
import { useData } from "@/contexts/dataContexts";

const Result = () => {
  const { servicesArray } = useData();
  const [cameraAllow, setCameraAllow] = useState(false);
  const ResultsArray = [
    ["Dryness", 26],
    ["Pimples", 40],
    ["Wrinkles", 64],
    ["Dark Circles", 20],
    ["Redness", 60],
    ["Freckles", 86],
  ];

  const handleStartCamera = () => {
    setCameraAllow(!cameraAllow);
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Header />

      {/* Main Content Wrapper */}
      <div className="flex-grow flex  items-center justify-center overflow-hidden">
        <div className="w-full h-full flex flex-col items-center gap-2 p-8 overflow-hidden">
          <CameraModule
            loading={false}
            cameraAllow={cameraAllow}
            setCameraAllow={setCameraAllow}
            isFromResult={true}
          />
          <Button
            text={cameraAllow ? "Stop Camera" : "Start Camera"}
            onClick={handleStartCamera}
            className="px-3 py-2 sm:px-6 sm:py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-base sm:text-lg font-medium"
          />
        </div>
        <div className="w-full h-[90%] flex items-center justify-center p-3 overflow-hidden">
          <ResultComponent ResultsArray={ResultsArray} />
        </div>
      </div>

      <div className="w-full   flex  items-center justify-center ">
        <h1 className="text-align-right text-5xl  font-bold">
          Try Our <br /> Other Services
        </h1>

        <div className="flex flex-col overflow-auto p-3">
          {servicesArray.map((service, index) => (
            <div key={index} className="flex flex-col items-end mb-3 w-[15vw]">
              <Button
                className="w-full rounded-sm text-xs  font-medium py-2 px-5"
                text={service[0]} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Result;
