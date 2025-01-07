"use client";

import { Loader } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import LoadingText from "./LoadingText";

const CameraModule = () => {
  const [cameraAllow, setCameraAllow] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [message, setMessage] = useState("");

  const handleCamera = () => {
    setMessage("");
    setCameraAllow(!cameraAllow);
    handleStreaming(!cameraAllow);
  };

  const handleStreaming = (cameraAllow) => {
    if (cameraAllow) {
      startStreaming();
    } else {
      stopStreaming();
    }
  };

  const startStreaming = async () => {
    try {
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      

      setStream(mediaStream);
      // Save the stream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream; // Attach the stream to the video element
        videoRef.current.play();
      }
    } catch (err) {
      setCameraAllow(false);
      stopStreaming();
      setMessage("Error accessing the camera");
    }
  };

  const stopStreaming = () => {
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    return () => {
      stopStreaming();
    };
  }, []);

  return (
    <div className="w-full flex flex-col justify-evenly items-center ">
      <div className="aspect-[9/16]  md:aspect-[16/9]  ">
        {loading || message ? (
          <LoadingText
            text={message ? message : "Processing your data"}
            className={"w-full h-[60vh]"}
          />
        ) : cameraAllow ? (
          <div className="mb-2 flex flex-col items-center  justify-center w-full h-[60vh] ">
            <div className="h-full w-full xl:pt-5 xl:pb-4">
              <video className="h-[26vh] xl:h-full w-full object-contain" ref={videoRef} autoPlay muted />
            </div>
          </div>
        ) : (
          <label
            htmlFor="dropzone-file"
            className="mb-2 flex flex-col items-center justify-center w-full h-[60vh] border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
          >
            <div className="flex flex-col items-center justify-center xl:pt-5 xl:pb-4">
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
              <p className="text-sm text-gray-500 dark:text-gray-400">
                JPG, JPEG, PNG
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                (MAX. 2MB)
              </p>
            </div>
            <input id="dropzone-file" type="file" className="hidden" />
          </label>
        )}
      </div>

      <Button
        className="mx-auto xl:w-1/6 w-1/3 font-semibold h-10"
        onClick={handleCamera}
        text={
          loading ? (
            <Loader className="animate-spin" />
          ) : cameraAllow ? (
            "Stop Camera"
          ) : (
            "Start Camera"
          )
        }
      />
    </div>
  );
};

export default CameraModule;
