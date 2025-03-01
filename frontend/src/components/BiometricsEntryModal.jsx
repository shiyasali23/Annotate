import React from "react";

import { AiOutlineCloseSquare } from "react-icons/ai";
import BiochemicalsBarGraph from "./BiochemicalsBarGraph";
const BiometricsEntryModal = ({ isOpen, onClose, selectedBiometricEntry }) => {
  if (!isOpen || !selectedBiometricEntry) return null;
  console.log("selectedBiometricEntry in modal", selectedBiometricEntry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg  w-[98vw] p-2 overflow-y-scroll">
        <AiOutlineCloseSquare
          className="absolute right-5 top-1 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />

        <div className="flex flex-col gap-1 animate-dropdown">
          <h1 className="text-sm   font-bold my-1 w-full text-center ">
            Registered on:{" "}
            {new Date(selectedBiometricEntry.created).toLocaleDateString()}
          </h1>
          <div className=" flex flex-col xl:flex-row  h-[88vh] w-full gap-2 px-2">
            {selectedBiometricEntry.healthy && (
              <div className="w-full h-full">
                <BiochemicalsBarGraph
                  biochemicalsArray={selectedBiometricEntry.healthy}
                  isHealthy={true}
                  isHyper={null}
                />
              </div>
            )}
            <div className="w-full h-full flex flex-col gap-2">
              {selectedBiometricEntry.hyperBiochemicals && (
                <div className="w-full h-1/2">
                  <BiochemicalsBarGraph
                    biochemicalsArray={selectedBiometricEntry.hyperBiochemicals}
                    isHyper={true}
                    isHealthy={false}
                  />
                </div>
              )}

              {selectedBiometricEntry.hypoBiochemicals && (
                <div className="w-full h-1/2">
                  <BiochemicalsBarGraph
                    biochemicalsArray={selectedBiometricEntry.hypoBiochemicals}
                    isHyper={false}
                    isHealthy={false}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiometricsEntryModal;
