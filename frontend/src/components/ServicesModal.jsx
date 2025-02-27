import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";



import { AiOutlineCloseSquare } from "react-icons/ai";
import { TiTick } from "react-icons/ti";

import CustomButton from "@/components/CustomButton";
import { useData } from "@/contexts/dataContext";

const ServicesModal = ({ isOpen, onClose }) => {
    const router = useRouter();

  const { servicesArray } = useData();
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const settingUpArray = useMemo(() => 
    [0, 2, 1, 3].map(index => servicesArray[index][1]), 
    [servicesArray]
  );

  useEffect(() => {
    if (!isSettingUp) return setCurrentStep(0);
    if (currentStep >= settingUpArray.length) {
        setTimeout(() => router.push("/food"), 500);
    };

    const timer = setTimeout(() => 
      setCurrentStep(prev => prev + 1), 
      currentStep === 0 ? 0 : 1000
    );
    return () => clearTimeout(timer);
  }, [isSettingUp, currentStep]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-11/12 max-w-md sm:max-w-lg lg:max-w-xl p-6 rounded-xl">
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />

        <div className="flex flex-col gap-3 animate-dropdown">
          {isSettingUp ? (
            <div className="mt-4">
              <h1 className="font-bold text-center xl:text-2xl text-lg mb-6">Setting Up</h1>
              {settingUpArray.map((item, index) => index <= currentStep && (
                <div key={item} className="flex items-center space-x-2 mt-3">
                  <span className={`text-l font-semibold transition-all duration-300 ${
                    index < currentStep ? "text-gray-800" : "text-gray-400 animate-pulse"
                  }`}>
                    {item}
                  </span>
                  {index < currentStep && <TiTick className="text-green-500 ml-2 animate-fade-in" size={18} />}
                </div>
              ))}
              
            </div>
          ) : (
            <div>
              <h1 className="mt-5 font-bold text-2xl text-center">Oops.. No Records Found.</h1>
              <div className="flex flex-col items-center gap-5 mt-12">
                <CustomButton text="Get Started" className="w-1/2 mx-auto" onClick={() => router.push("/About")} />
                <span className="font-bold text-center xl:text-xl text-lg">Or</span>
                <button className="font-bold text-center xl:text-xl text-lg underline hover:scale-110 transition duration-150"
                  onClick={() => setIsSettingUp(true)}>
                  Try a dummy data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesModal;