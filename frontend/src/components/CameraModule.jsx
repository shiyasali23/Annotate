"use client";

import {  FlipHorizontal, CameraIcon } from "lucide-react";
import React, {  useRef, useState } from "react";
import Webcam from "react-webcam";
import Button from "./Button";

const CameraModule = ({setHaveResult}) => {
  const webcamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [loading] = useState(false); 

  const videoConstraints = {
    facingMode: isFrontCamera ? "user" : "environment",
  };

  return (
    <div className="w-full flex flex-col items-center p-2">
      {/* Camera Preview Container */}
      <div className="w-full md:aspect-video aspect-[3/4] relative  rounded-lg overflow-hidden">
        {cameraActive ? (
          <div>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
            {/* Camera Controls */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
            <Button
                  className="bg-black opacity-50 border-none hover:bg-white text-black p-3 rounded-full"
                  onClick={() => setIsFrontCamera(!isFrontCamera)}
                  text={<FlipHorizontal className="w-6 h-6" />}
                />
              <Button
                  className="bg-black opacity-50 border-none hover:bg-white text-black p-3 rounded-full"
                  onClick={() => {
                  const imageSrc = webcamRef.current?.getScreenshot();
                  setCameraActive(false);
                  setHaveResult(true);
                }}
                  text={<CameraIcon className="w-6 h-6" />}
                />
            </div>
          </div>
        ) : (
          // Upload Preview Area
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-400">
            <svg
              className="w-8 h-8 mb-2 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-500 text-center">
              JPG, JPEG, PNG<br />(MAX. 2MB)
            </span>
          </div>
        )}
      </div>

      {/* Camera Toggle Button */}
      <Button
        className="mt-4 xl:w-1/2 "
        onClick={() => setCameraActive(!cameraActive)}
        text={cameraActive ? "Stop Camera" : "Start Camera"}
      />
    </div>
  );
};

export default CameraModule;