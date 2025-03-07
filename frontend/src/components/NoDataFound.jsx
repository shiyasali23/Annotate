import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

import { AiOutlineCloseSquare } from "react-icons/ai";
import { TiTick } from "react-icons/ti";

import CustomButton from "@/components/CustomButton";
import { useData } from "@/contexts/dataContext";

const NoDataFound = ({
  isOpen,
  onClose,
  isModal,
  heading = "Oops.. No Records Found.",
  buttonText,
  handleButtonClick,
}) => {
  const router = useRouter();
  const { servicesArray } = useData();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const settingUpArray = useMemo(
    () => [0, 2, 1, 3].map((index) => servicesArray[index][1]),
    [servicesArray]
  );

  useEffect(() => {
    if (!isSettingUp) return setCurrentStep(0);
    if (currentStep >= settingUpArray.length) {
      setTimeout(() => router.push("/food"), 500);
    }

    const timer = setTimeout(
      () => setCurrentStep((prev) => prev + 1),
      currentStep === 0 ? 0 : 1000
    );
    return () => clearTimeout(timer);
  }, [isSettingUp, currentStep]);

  // For modal mode, if it's not open then don't render anything.
  if (isModal && !isOpen) return null;

  const content = (
    <div className="relative bg-white  w-11/12 max-w-md sm:max-w-lg lg:max-w-xl p-6 rounded-xl flex flex-col align-center justify-center">
      {isModal && (
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />
      )}

      <div className="flex flex-col gap-3 animate-dropdown">
        {isSettingUp ? (
          <div className="mt-4">
            <h1 className="font-bold text-center xl:text-2xl text-lg mb-6">
              Setting Up
            </h1>
            {settingUpArray.map(
              (item, index) =>
                index <= currentStep && (
                  <div key={item} className="flex items-center space-x-2 mt-3">
                    <span
                      className={`text-l font-semibold transition-all duration-300 ${
                        index < currentStep
                          ? "text-gray-800"
                          : "text-gray-400 animate-pulse"
                      }`}
                    >
                      {item}
                    </span>
                    {index < currentStep && (
                      <TiTick
                        className="text-green-500 ml-2 animate-fade-in"
                        size={18}
                      />
                    )}
                  </div>
                )
            )}
          </div>
        ) : (
          <div>
            <h1 className="mt-5 font-bold text-xl text-center">{heading}</h1>
            <div className="flex flex-col items-center gap-5 mt-12">
              <button
                className="font-bold text-center xl:text-xl text-lg underline hover:scale-110 transition duration-150"
                onClick={() => setIsSettingUp(true)}
              >
                Try with a dummy account
              </button>
              <span className="font-bold text-center xl:text-xl text-lg">
                Or
              </span>

              <CustomButton
                text={buttonText}
                className="xl:w-1/2 mx-auto text-xs"
                onClick={() => handleButtonClick()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If used as a modal, wrap content in a container that only centers it without forcing full viewport width/height.
  return isModal ? (
    <div className="z-50 flex items-center justify-center shadow-lg">
      {content}
    </div>
  ) : (
    content
  );
};

export default NoDataFound;
