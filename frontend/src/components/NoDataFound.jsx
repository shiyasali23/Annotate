import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { AiOutlineCloseSquare } from "react-icons/ai";
import { TiTick } from "react-icons/ti";

import CustomButton from "@/components/CustomButton";
import { useData } from "@/contexts/dataContext";
import { useUser } from "@/contexts/userContext";

const NoDataFound = ({
  isOpen,
  onClose,
  isModal,
  route,
}) => {
  const router = useRouter();
  const { servicesArray } = useData();
  const { loadDummyData } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupStatus, setSetupStatus] = useState({
    isSettingUp: false,
    failed: false
  });

  const settingUpSteps = [0, 2, 1, 3].map((index) => servicesArray[index][1]);

  const handleDummyAccountSetup = async () => {
    // Reset state
    setSetupStatus({
      isSettingUp: true,
      failed: false
    });
    setCurrentStep(0);

    // Complete the animation first
    await runAnimationSteps();
    
    // Then load the dummy data
    try {
      const success = await loadDummyData();
      
      if (success) {
        router.push(`/${route ?? "analytics"}`);
      } else {
        setSetupStatus(prev => ({ ...prev, failed: true }));
      }
    } catch (error) {
      console.error("Error loading dummy account:", error);
      setSetupStatus(prev => ({ ...prev, failed: true }));
    }
  };

  // Separate function to run the animation steps
  const runAnimationSteps = async () => {
    // First step without delay
    setCurrentStep(1);
    
    // Run all remaining steps with delays
    for (let i = 2; i <= settingUpSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCurrentStep(i);
    }
    
    // Add a final delay to show all steps completed
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  // For modal mode, if it's not open then don't render anything.
  if (isModal && !isOpen) return null;

  const content = (
    <div className="relative bg-white w-[80vw] xl:w-[40vw] p-6 flex flex-col align-center justify-center m-auto shadow-[0_0_8px_2px_rgba(0,0,0,0.03)] border border-dashed">
      {isModal && (
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />
      )}

      <div className="flex flex-col gap-3 animate-dropdown">
        {setupStatus.isSettingUp ? (
          <div className="mt-4">
            <h1 className="font-bold text-center xl:text-2xl text-lg mb-6">
              Setting Up
            </h1>
            {settingUpSteps.map(
              (item, index) =>
                index <= currentStep && (
                  <div key={item} className="flex items-center space-x-2 mt-3">
                    <span
                      className={`text-l font-semibold transition-all  ${
                        index < currentStep
                          ? "text-gray-800"
                          : "text-gray-400 animate-pulse-opacity"
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
            
            {setupStatus.failed && (
             <p className="text-red-500 text-center w-full mt-5">Failed to load dummy account</p>
            )}
          </div>
        ) : (
          <div>
            <h1 className="font-bold text-xl text-center">Oops.. No Records Found.</h1>
            <div className="flex flex-col items-center gap-5 mt-12">
              <button
                className="font-bold text-center xl:text-xl text-lg underline hover:scale-110 transition duration-150"
                onClick={handleDummyAccountSetup}
              >
                Try with a dummy account
              </button>
              <span className="font-bold text-center xl:text-xl text-lg">
                Or
              </span>

              <CustomButton
                text={"Create Account"}
                className="xl:w-1/2 mx-auto text-xs"
                onClick={() => router.push("/about")}
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