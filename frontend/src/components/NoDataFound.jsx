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
  route,
}) => {
  const router = useRouter();
  const { servicesArray } = useData();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasNavigated, setHasNavigated] = useState(false);

  const settingUpArray = useMemo(
    () => [0, 2, 1, 3].map((index) => servicesArray[index][1]),
    [servicesArray]
  );

  useEffect(() => {
    if (!isSettingUp) {
      setCurrentStep(0);
      setHasNavigated(false);
      return;
    }
    
    // If we've completed all steps and haven't navigated yet
    if (currentStep >= settingUpArray.length && !hasNavigated) {
      setHasNavigated(true);
      setTimeout(() => router.push(`/${route ?? "analytics"}`), 500);
      return;
    }

    // Only continue with the timer if we haven't navigated yet
    if (!hasNavigated && currentStep < settingUpArray.length) {
      const timer = setTimeout(
        () => setCurrentStep((prev) => prev + 1),
        currentStep === 0 ? 0 : 1000
      );
      return () => clearTimeout(timer);
    }
  }, [isSettingUp, currentStep, settingUpArray.length, router, route, hasNavigated]);

  // For modal mode, if it's not open then don't render anything.
  if (isModal && !isOpen) return null;

  const content = (
    <div className="relative bg-white w-[80vw] xl:w-[40vw]  p-6 flex flex-col align-center justify-center m-auto shadow-[0_0_8px_2px_rgba(0,0,0,0.03)] border border-dashed">
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
            <h1 className="font-bold text-xl text-center">{heading}</h1>
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
                text={buttonText || "Create Account"}
                className="xl:w-1/2 mx-auto text-xs"
                onClick={() => handleButtonClick?.()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // If used as a modal, wrap content in a proper modal overlay with backdrop
  return isModal ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto ">
      <div className="relative z-50 animate-fade-in-up">{content}</div>
    </div>
  ) : (
    content
  );
};

export default NoDataFound;