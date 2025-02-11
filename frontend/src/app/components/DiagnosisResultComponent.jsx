import React, { useMemo } from "react";
import { IoChevronBackCircle } from "react-icons/io5";
import ResultComponent from "./ResultComponent";
import ProbabilitiesGraphComponent from "./ProbabilitiesGraphComponent";

const DiagnosisResultComponent = ({ onClose, prediction }) => {
  
  const probabilitiesArray = useMemo(() => prediction?.probabilities ?? null, [prediction]);

  
  if (!prediction) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-[95vw] max-w-6xl p-6 h-[90vh]">
        <IoChevronBackCircle
          size={36}
          className="absolute left-5 top-5 cursor-pointer text-3xl   hover:scale-110 transition duration-150"
          onClick={onClose}
        />
        <div className="flex  animate-dropdown mt-12">
          <div className="w-full  pl-10">
            <h1 className="text-3xl gap-2 font-bold items-center"> <h1 className="font-semibold text-xl">Result:</h1> {prediction.prediction}</h1>
          </div>
          <div className="w-1/3">
            {probabilitiesArray && (
              <ProbabilitiesGraphComponent probabilities={probabilitiesArray} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResultComponent;
