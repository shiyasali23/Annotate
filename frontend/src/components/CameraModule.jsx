"use client";

import { FlipHorizontal, CameraIcon, Loader } from "lucide-react";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import CustomButton from "@/components/CustomButton";
import { FaCloudUploadAlt } from "react-icons/fa";
import LoadingComponent from "./LoadingComponent";
import { useDropzone } from "react-dropzone";

const CameraModule = ({ handleImage, setPredictedFoods, className }) => {
  const webcamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [fileLoading, setFileLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const videoConstraints = {
    facingMode: isFrontCamera ? "user" : "environment",
  };

  // Handle capturing image from webcam
  const handleCapture = () => {
    setFileLoading(true);
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      handleImage(imageSrc);
    }
    setCameraActive(false);
    setFileLoading(false);
  };

  // Dropzone callback for file upload
  const onDrop = (acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      // Get error messages from rejected files
      const errorMessages = fileRejections
        .map((rejection) =>
          rejection.errors.map((err) => err.message).join(", ")
        )
        .join(", ");
      setUploadError(errorMessages || "Invalid file type or size.");
      return;
    }
    if (acceptedFiles.length > 0) {
      setUploadError(null);
      const file = acceptedFiles[0];
      setFileLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImage(reader.result);
        setFileLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/png": [],
    },
    maxSize: 2 * 1024 * 1024, // 2MB
  });

  return (
    <div className={`w-full h-full max-w-full max-h-full flex flex-col items-center overflow-hidden ${className}`}>
      <div className="w-full h-full relative overflow-hidden">
        {cameraActive ? (
          <div className="w-full h-full">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
              <CustomButton
                className="bg-white text-black opacity-50 border-none rounded-full"
                onClick={() => setIsFrontCamera(!isFrontCamera)}
                text={<FlipHorizontal className="w-6 h-6" />}
              />
              <CustomButton
                className="bg-white text-black opacity-50 border-none rounded-full"
                onClick={handleCapture}
                text={<CameraIcon className="w-6 h-6" />}
              />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-400 p-4 ">
            {fileLoading ? (
              <LoadingComponent text="Processing Data." />
            ) : (
              <div
                {...getRootProps()}
                className="flex flex-col items-center cursor-pointer border-2 border-dashed border-gray-500 p-4 "
              >
                <input {...getInputProps()} />
                <FaCloudUploadAlt className="text-2xl mb-3 text-gray-500" />
                <h1 className="text-sm mb-3 text-gray-500">Upload Image</h1>
                <h1 className="text-xs text-gray-500 text-center">
                  JPG, JPEG, PNG
                  <br />
                  (MAX. 2MB)
                </h1>
                {uploadError && (
                  <p className="text-red-500 mt-2 text-sm">{uploadError}</p>
                )}
                {isDragActive && (
                  <p className="text-blue-500 mt-2 text-sm">
                    Drop the file here...
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Camera Toggle Button */}
      <CustomButton
        className="mt-4 xl:w-1/2"
        onClick={() => {
          setCameraActive(!cameraActive);
          setPredictedFoods(null);
        }}        text={
          fileLoading ? (
            <Loader className="animate-spin" />
          ) : cameraActive ? (
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
