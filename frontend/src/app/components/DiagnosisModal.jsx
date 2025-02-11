import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";
import LoadingComponent from "./LoadingComponent";
import ErrorComponent from "./ErrorComponent";

import { getModels } from "@/utils/diagnosisUtils";
import { useData } from "@/contexts/dataContexts";


const DiagnosisModal = ({ isOpen, onClose }) => {
  const { diagnosisModel, setDiagnosisModel } = useData();
  const [loading, setLoading] = useState(false);

 

 
  

  const updateInputValuesArray = (model) => {
    
  };

  const loadModel = useCallback(async () => {
    setLoading(true);
    const model = await getModels("diagnosis");
    setDiagnosisModel(model);
    updateInputValuesArray(model);
    setLoading(false);
  }, [setDiagnosisModel]);

  



  useEffect(() => {
    if (!diagnosisModel) {
      loadModel();
    }
  }, [diagnosisModel, loadModel]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-[95vw] min-w-[300px] max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl p-6 transition-all duration-300 max-h-[90vh] overflow-y-auto">
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />
        <div className="flex flex-col gap-3 animate-dropdown">
          {loading ? (
            <LoadingComponent text="Setting Up" />
          ) : !diagnosisModel ? (
            <ErrorComponent handleTryAgain={loadModel} />
          ) : (
            <div>hello</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisModal;
