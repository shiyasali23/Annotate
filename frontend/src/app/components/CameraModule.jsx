"use client";

import { Loader } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CameraModule = ({ cameraAllow, setCameraAllow, isFromResult }) => {
  const videoRef = useRef(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [videoStream, setVideoStream] = useState(null);
  const [isFailed, setIsFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      setCameraLoading(true); // Set cameraLoading to true when starting the camera
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setCameraLoading(false); // Set cameraLoading to false once the camera is loaded
      } catch (error) {
        console.error("Error accessing the camera:", error);
        if (error.name === "NotAllowedError") {
          setMessage("Allow permission to open camera");
        } else {
          setMessage("Error accessing the camera");
        }
        setIsFailed(true);
        setCameraLoading(false); // Set cameraLoading to false if there is an error
      }
    };

    if (cameraAllow) {
      startCamera();
    } else {
      // Stop the camera when cameraAllow is false
      if (videoStream) {
        videoStream.getTracks().forEach((track) => track.stop());
        setVideoStream(null);
      }
    }

    // Cleanup function: stop the camera when the component unmounts or when cameraAllow changes
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraAllow]); // Dependency on cameraAllow to start/stop the camera based on state

  const handleVideoError = () => {
    setVideoError(true);
    setMessage("Error displaying video");
  };

  return (
    <div className="overflow-hidden mb-4 rounded-lg flex items-center justify-center w-[90vw] max-w-full aspect-[9/16] mx-auto sm:w-80 sm:aspect-[16/9] md:w-full md:max-w-2xl md:aspect-video border border-gray-300 border-dashed">

      <div className="w-full h-full relative">
        {cameraLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader className="animate-spin" size="2rem" />
          </div>
        ) : isFailed || videoError ? (
          <div className="w-full h-full flex items-center justify-center">
            <h2>{message}</h2>
          </div>
        ) : cameraAllow ? (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              onError={handleVideoError} // Handling video errors
            />
            {!isFromResult ? (
              <Link href="/Result">
                <button
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-transparent border-black border-4 border-opacity-50 font-bold text-white text-opacity-60 px-4 py-2 rounded-full shadow-lg hover:bg-opacity-50 transition-opacity duration-300"
                  onClick={() => setCameraAllow(false)} // Stop the camera when navigating to the result page
                >
                  Capture
                </button>
              </Link>
            ) : (
              <button
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-transparent border-black border-4 border-opacity-50 font-bold text-white text-opacity-60 px-4 py-2 rounded-full shadow-lg hover:bg-opacity-50 transition-opacity duration-300"
                onClick={() => setCameraAllow(false)} // Stop the camera when clicking the capture button
              >
                Capture
              </button>
            )}
          </>
        ) : (
          <div className="border w-full h-full bg-gray-200 flex flex-col items-center justify-center  p-8">
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 ">
              <span className="font-semibold ">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Image (MAX. 100MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CameraModule;
