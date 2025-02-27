import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";

import { useData } from "@/contexts/dataContext";
import { getModels, getDiagnosisPrediction } from "@/lib/diagnosis-api";

import LoadingComponent from "./LoadingComponent";
import ErrorComponent from "./ErrorComponent";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import DiagnosisResultComponent from "./DiagnosisResultComponent";

const DiagnosisModal = ({ isOpen, onClose }) => {
  const { diagnosisModel, setDiagnosisModel, dignosisModelsTypes } = useData();
  const [inputValues, setInputValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [diagnosisPrediction, setDiagnosisPrediction] = useState(null);

  const featuresCategory = useMemo(() => {
    return diagnosisModel?.[0]?.feature_category
      ? JSON.parse(diagnosisModel[0].feature_category)
      : null;
  }, [diagnosisModel]);

  const mappableFeatures = useMemo(() => {
    return diagnosisModel?.[0]?.feature_maps
      ? JSON.parse(diagnosisModel[0].feature_maps)
      : {};
  }, [diagnosisModel]);



  const loadModel = useCallback(async () => {
    setLoading(true);
    const model = await getModels(dignosisModelsTypes[0]);
    setDiagnosisModel(model);
    setLoading(false);
  }, [setDiagnosisModel]);

  const initializeInputValues = () => {
    if (!featuresCategory) return;
    const initialValues = {};
    Object.values(featuresCategory)
      .flat()
      .forEach((symptom) => {
        initialValues[symptom] = mappableFeatures[symptom]
          ? Object.keys(mappableFeatures[symptom]).find(
              (key) => mappableFeatures[symptom][key] === 0
            ) || Object.keys(mappableFeatures[symptom])[0]
          : 0;
      });
    setInputValues(initialValues);
  };

  const validateInputValues = useCallback(() => {
    return Object.values(inputValues).filter((v) => v !== 0).length >= 5;
  }, [inputValues]);

  

  const handleChange = (symptom, value) => {
    setInputValues((prev) => ({ ...prev, [symptom]: value }));
  };

  const handleDiagnosis = async () => {
    if (!validateInputValues()) return;
    setPredictionLoading(true);
    const prediction = await getDiagnosisPrediction(
      diagnosisModel[0]?.id,
      inputValues
    );
    setDiagnosisPrediction(prediction || null);
    setPredictionLoading(false);
  };

  useEffect(() => {
    if (diagnosisModel.length === 0) loadModel();
  }, []);

  useEffect(() => {
    initializeInputValues();
  }, [featuresCategory, mappableFeatures]);

  useEffect(() => {
    setErrorMessage(validateInputValues() ? null : "Select atleast 5 symptoms");
  }, [inputValues, validateInputValues]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative  bg-white shadow-lg w-[95vw] max-w-6xl p-6 max-h-[90vh] min-h-[30vh] ">
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />
        {loading || predictionLoading ? (
          <LoadingComponent
            text={predictionLoading ? "Finding disease" : "Setting up"}
          />
        ) : diagnosisModel.length === 0 ? (
          <ErrorComponent handleTryAgain={() => loadModel()} />
        ) : diagnosisPrediction ? (
          <DiagnosisResultComponent
            onClose={() => setDiagnosisPrediction(null)}
            prediction={diagnosisPrediction}
          />
        ) : (
          <div className="flex  animate-dropdown">
            <div className="w-2/3 pr-4 max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(mappableFeatures).map(([symptom, options]) => (
                  <div key={symptom} className="flex items-center gap-2">
                    <label className="text-md" htmlFor={symptom}>
                      {symptom}
                    </label>
                    <Select
                      value={inputValues[symptom]}
                      onValueChange={(value) => handleChange(symptom, value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Select value" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(options).map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
                {errorMessage && (
                  <h2 className="text-sm mb-2 w-full text-center font-semibold text-red-600">
                    {errorMessage}
                  </h2>
                )}
              </div>
              <Accordion type="multiple" className="w-full">
                {Object.entries(featuresCategory || {}).map(
                  ([category, symptoms]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger>{category}</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {symptoms
                            .filter((symptom) => !mappableFeatures[symptom])
                            .map((symptom) => (
                              <div
                                key={symptom}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  id={symptom}
                                  checked={inputValues[symptom] === 1}
                                  onCheckedChange={() =>
                                    handleChange(
                                      symptom,
                                      inputValues[symptom] === 0 ? 1 : 0
                                    )
                                  }
                                />
                                <label htmlFor={symptom}>{symptom}</label>
                              </div>
                            ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                )}
              </Accordion>
            </div>
            <div className="w-1/3 relative mt-5 max-h-[85vh] overflow-y-auto">
              <h2 className="text-md mb-5 font-semibold underline text-center">
                Selected Symptoms
              </h2>
              <div className="space-y-2">
                {Object.entries(inputValues)
                  .filter(([, v]) => v !== 0)
                  .map(([symptom]) => (
                    <h1
                      key={symptom}
                      className="text-sm p-2 bg-gray-100 rounded text-center"
                    >
                      {symptom}
                    </h1>
                  ))}
              </div>
              <Button
                variant="default"
                size="lg"
                className="absolute mx-auto bottom-4 w-full"
                disabled={!validateInputValues()}
                onClick={handleDiagnosis}
              >
                Get Diagnosis
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosisModal;
