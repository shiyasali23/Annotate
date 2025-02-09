import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";
import LoadingComponent from "./LoadingComponent";
import ErrorComponent from "./ErrorComponent";
import { getDiseaseDetectionModals } from "@/utils/diseaseDetectionUtils";
import { useData } from "@/contexts/dataContexts";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DiseaseDetectionModal = ({ isOpen, onClose }) => {
  const { diseaseDetectionModals, setDiseaseDetectionModals } = useData();
  const [featureLoading, setFeatureLoading] = useState(false);
  const [openAccordionId, setOpenAccordionId] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [errors, setErrors] = useState({});

  const loadModels = useCallback(async () => {
    setFeatureLoading(true);
    const models = await getDiseaseDetectionModals();
    setDiseaseDetectionModals(models);
    setFeatureLoading(false);
  }, [setDiseaseDetectionModals]);

  const handlePredict = (modelId) => {
    const model = diseaseDetectionModals.find((m) => m.id === modelId);
    const requiredFields = JSON.parse(model.feature_names);
    const hasEmptyFields = requiredFields.some(
      (field) => !inputValues[modelId]?.[field]
    );

    if (hasEmptyFields) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [modelId]: "All fields required",
      }));
      setOpenAccordionId(modelId);
      return;
    } else {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [modelId]: null,
      }));
    }
  };

  useEffect(() => {
    diseaseDetectionModals.length === 0 && loadModels();
  }, [loadModels, diseaseDetectionModals.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-[95vw] min-w-[300px] max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl p-6  transition-all duration-300 max-h-[90vh] overflow-y-auto">
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />

        <div className="flex flex-col gap-3 animate-dropdown">
          {featureLoading ? (
            <LoadingComponent text={"Setting Up"} />
          ) : diseaseDetectionModals.length === 0 ? (
            <ErrorComponent handleTryAgain={loadModels} />
          ) : (
            <div className="mt-8">
              <Accordion
                type="single"
                value={openAccordionId}
                collapsible
                onValueChange={setOpenAccordionId}
              >
                {diseaseDetectionModals.map((model) => {
                  const features = JSON.parse(model.feature_names);
                  return (
                    <AccordionItem key={model.id} value={model.id} className="mb-5">
                      <AccordionTrigger className="hover:no-underline px-4">
                        <div className="flex w-full items-center justify-between">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <h1 className="text-3xl font-semibold">
                                {model.name}
                              </h1>
                              <p className="text-sm text-muted-foreground">
                                ({(model.accuracy * 100).toFixed(2)}%)
                              </p>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent>
                        {errors[model.id] && (
                          <p className="text-md font-semibold ml-4 text-red-500 my-3">
                            {errors[model.id]}
                          </p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                          {features.map((feature) => (
                            <div key={feature} className="space-y-1">
                              <Label
                                htmlFor={feature}
                                className="text-xs sm:text-sm md:text-base truncate block"
                              >
                                {feature}
                              </Label>
                              <Input
                                id={feature}
                                type="text"
                                onChange={(e) =>
                                  setInputValues((prev) => ({
                                    ...prev,
                                    [model.id]: {
                                      ...prev[model.id],
                                      [feature]: e.target.value,
                                    },
                                  }))
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </AccordionContent>

                      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-3 my-5 px-5">
                        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full">
                          {Object.entries(JSON.parse(model.output_maps)).map(
                            ([label, value], index) => (
                              <Button
                                key={index}
                                variant="secondary"
                                className="w-full sm:w-auto sm:min-w-[120px]"
                              >
                                {label}
                              </Button>
                            )
                          )}
                        </div>
                        <Button
                          variant="default"
                          size="lg"
                          className="mr-10 w-1/2 xl:w-1/4 "
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePredict(model.id);
                          }}
                        >
                          Predict
                        </Button>
                      </div>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionModal;
