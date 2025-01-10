"use client";

import {
  Camera,
  Loader,
  FlipHorizontal,
  Camera as CameraIcon,
} from "lucide-react";
import React, { useCallback, useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import Button from "./Button";
import LoadingText from "./LoadingText";
import { useRouter } from "next/navigation";
import Modal from "./Modal";


const CameraModule = () => {
  const router = useRouter();
  const [cameraAllow, setCameraAllow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 1280, height: 720, aspectRatio: 16/9 });
  const webcamRef = useRef(null);
const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    // Update dimensions based on window size
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      setDimensions({
        width: isMobile ? 720 : 1280,
        height: isMobile ? 1280 : 720,
        aspectRatio: isMobile ? 3/4 : 16/9
      });
    };

    // Set initial dimensions
    updateDimensions();

    // Add event listener for window resize
    window.addEventListener('resize', updateDimensions);

    // Cleanup
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const videoConstraints = {
    width: { ideal: dimensions.width },
    height: { ideal: dimensions.height },
    facingMode: isFrontCamera ? "user" : "environment",
    aspectRatio: dimensions.aspectRatio,
  };

  const handleCamera = () => {
    setLoading(true);
    setMessage("");
    setCameraAllow(!cameraAllow);
    setCapturedImage(null);
    setLoading(false);
  };

  const switchCamera = () => {
    setLoading(true);
    setIsFrontCamera(!isFrontCamera);
    setLoading(false);
  };

  const capture = useCallback(() => {
    setLoading(true);
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
    setCameraAllow(!cameraAllow);
    router.push("/Vision");
  }, [webcamRef, cameraAllow]);

  return (
    <div className="w-full flex flex-col justify-evenly items-center">
      <div className="w-full md:w-1/2">
        {loading || message ? (
          <LoadingText
            text={message ? message : "Processing your data"}
            className="w-full h-[60vh]"
          />
        ) : cameraAllow ? (
          <div className="mb-2 flex flex-col items-center justify-center w-full">
            <div className="w-full relative">
              <div
                className="relative w-full"
                style={{
                  paddingTop: dimensions.aspectRatio === 3/4 ? "133.33%" : "56.25%",
                }}
              >
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                />
              </div>

              {/* Camera Controls */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                <Button
                  className="bg-black opacity-50 border-none hover:bg-white text-black p-3 rounded-full"
                  onClick={switchCamera}
                  text={<FlipHorizontal className="w-6 h-6" />}
                />
                <Button
                  className="bg-black opacity-50 border-none hover:bg-white text-black p-3 rounded-full"
                  onClick={capture}
                  text={<CameraIcon className="w-6 h-6" />}
                />
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor="dropzone-file"
            className="mb-2 flex flex-col items-center justify-center w-1/2 xl:w-full  mx-auto h-[40vh] xl:h-[70vh]  rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
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
        className="mx-auto w-1/4 font-semibold h-10 mt-4 whitespace-nowrap"
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
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CameraModule;