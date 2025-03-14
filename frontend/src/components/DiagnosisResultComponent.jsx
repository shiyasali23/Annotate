import React, { useMemo } from "react";
import { IoChevronBackCircle } from "react-icons/io5";
import ProbabilitiesGraphComponent from "./ProbabilitiesGraphComponent";

const DiagnosisResultComponent = ({ onClose, prediction }) => {
  const probabilitiesArray = useMemo(
    () => prediction?.probabilities ?? null,
    [prediction]
  );

  const predictionReportArray = [
    ["Medications", "medications"],
    ["Precautions", "precautions"],
    ["Diets", "diets"],
  ];

  if (!prediction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-[95vw] p-4 h-[100vh] xl:h-[90vh] overflow-y-scroll">
        <IoChevronBackCircle
          size={36}
          className="absolute left-5 top-5 cursor-pointer text-3xl hover:scale-110 transition duration-150"
          onClick={onClose}
        />
        <div className="flex h-full animate-dropdown mt-12">
          <div className="w-full h-full flex flex-col gap-3 p-2">
            {prediction.prediction && (
              <h1 className="text-3xl  font-bold items-center ml-5">
                {prediction.prediction}
              </h1>
            )}

            {prediction.description && (
              <h1 className="text-xs gap-2 font-bold items-center ml-5">
                * {prediction.description}
              </h1>
            )}



            {predictionReportArray.map(([title, key], index) => (
              prediction[key] && (
                <div key={index} className="w-full border border-dashed p-3 flex flex-col gap-5">
                  <h1 className="font-semibold text-base w-full text-center underline underline-offset-4">
                    {title}:
                  </h1>
                  <div className="grid xl:grid-cols-4 grid-cols-2 gap-2 gap-y-6 gap-x-2 p-2 list-disc list-inside">
                    {prediction[key].map((item, idx) => (
                      <li key={idx} className="text-xs font-bold">
                        {item}
                      </li>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {probabilitiesArray && (
            <div className="w-1/3 h-full flex flex-col  items-center">
              <ProbabilitiesGraphComponent probabilities={probabilitiesArray} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisResultComponent;
