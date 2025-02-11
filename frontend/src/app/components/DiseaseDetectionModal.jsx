import React, { useEffect, useState, useCallback } from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";
import LoadingComponent from "./LoadingComponent";
import ErrorComponent from "./ErrorComponent";
import { getModels, getDiseasePredictions } from "@/utils/diagnosisUtils";
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader } from "lucide-react";

const DiseaseDetectionModal = ({ isOpen, onClose }) => {
  const { diseaseDetectionModals, setDiseaseDetectionModals } = useData();
  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [openAcc, setOpenAcc] = useState(null);
  const [inputValuesArray, setInputValuesArray] = useState([]);
  const [errorsDict, setErrorsDict] = useState({});
  const [predictionsDict, setPredictionsDict] = useState({});
  const UpCommingModelsArray = [
    "Alzheimers Detection",
    "Kidney Function",
    "Cancer Prediction",
  ];

  const dictValidator = (obj) =>
    Object.values(obj).every((value) => value !== "");

  const isModelValid = (modelId) => {
    const currentItem = inputValuesArray.find((item) => item.id === modelId);
    const isValid = currentItem ? dictValidator(currentItem.features) : false;
    return isValid ? currentItem.features : false;
  };

  const initializeErrorsDict = (models) => {
    setErrorsDict(
      models.reduce((acc, model) => {
        acc[model.id] = "All fields are required";
        return acc;
      }, {})
    );
  };

  const updateInputValuesArray = (models) => {
    if (models.length > 0) {
      setInputValuesArray(
        models.map((model) => {
          const featureNames = JSON.parse(model.feature_names);
          return {
            id: model.id,
            features: featureNames.reduce((acc, feature) => {
              acc[feature] = "";
              return acc;
            }, {}),
          };
        })
      );
    } else {
      setInputValuesArray([]);
    }
  };

  const loadModels = useCallback(async () => {
    setLoading(true);
    const models = await getModels("disease_detections");
    setDiseaseDetectionModals(models);
    updateInputValuesArray(models);
    initializeErrorsDict(models);
    setLoading(false);
  }, [setDiseaseDetectionModals]);

  const handleValuesChange = (modelId, feature, value) => {
    setInputValuesArray((prev) => {
      const updated = prev.map((item) =>
        item.id === modelId
          ? {
              ...item,
              features: {
                ...item.features,
                [feature]: value,
              },
            }
          : item
      );

      const valid = isModelValid(modelId, updated);
      setErrorsDict((prevErrors) => ({
        ...prevErrors,
        [modelId]: !valid ? "All fields are required" : "",
      }));

      return updated;
    });
  };

  const handlePredict = (modelId) => {
    const valid = isModelValid(modelId, inputValuesArray);
    if (!valid) {
      setOpenAcc(modelId);
    } else {
      const featuresDict = isModelValid(modelId);
      handlePredictRequest(modelId, featuresDict);
    }
  };

  const handlePredictRequest = async (modelId, featuresDict) => {
    setPredictionLoading(true);
    setErrorsDict((prev) => ({
      ...prev,
      [modelId]: "",
    }));
    const predictions = await getDiseasePredictions(modelId, featuresDict);
    if (predictions) {
      setPredictionsDict((prev) => ({
        ...prev,
        [modelId]: predictions,
      }));
    } else {
      setErrorsDict((prev) => ({
        ...prev,
        [modelId]: "Something went wrong",
      }));
    }
    setOpenAcc(modelId);
    setPredictionLoading(false);
  };

  const checkIsMostImpacted = (feature, modelId) => {
    if (!predictionsDict[modelId]) return false;
    const modal = diseaseDetectionModals.find((model) => model.id === modelId);
    return modal ? modal.max_feature_impact === feature : false;
  };

  useEffect(() => {
    if (!diseaseDetectionModals.length) {
      loadModels();
    }
  }, [diseaseDetectionModals, loadModels]);

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
          ) : !diseaseDetectionModals.length ? (
            <ErrorComponent handleTryAgain={loadModels} />
          ) : (
            <Accordion
              type="single"
              value={openAcc}
              collapsible
              onValueChange={setOpenAcc}
              className="mt-5"
            >
              {diseaseDetectionModals.map((model) => {
                const features = JSON.parse(model.feature_names);
                const featureMaps = model.feature_maps
                  ? JSON.parse(model.feature_maps)
                  : {};
                return (
                  <AccordionItem
                    key={model.id}
                    value={model.id}
                    className="mb-5"
                  >
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
                      {errorsDict[model.id] && (
                        <p className="text-md font-semibold ml-4 text-red-500 my-3">
                          {errorsDict[model.id]}
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
                        {features.map((feature) => (
                          <div key={feature} className="space-y-1">
                            <Label
                              className={`text-xs   truncate block ${
                                checkIsMostImpacted(feature, model.id)
                                  ? "text-red-500"
                                  : ""
                              }`}
                            >
                              {checkIsMostImpacted(feature, model.id)
                                ? "* "
                                : ""}
                              {feature}
                            </Label>
                            {featureMaps[feature] ? (
                              <Select
                                onValueChange={(val) =>
                                  handleValuesChange(model.id, feature, val)
                                }
                              >
                                <SelectTrigger
                                  className={`${
                                    checkIsMostImpacted(feature, model.id)
                                      ? "border-2 border-red-500 text-red-500"
                                      : ""
                                  }`}
                                >
                                  <SelectValue
                                    placeholder={`Select ${feature}`}
                                    className={`${
                                      checkIsMostImpacted(feature, model.id)
                                        ? "text-red-500"
                                        : ""
                                    }`}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(featureMaps[feature]).map(
                                    ([key]) => (
                                      <SelectItem key={key} value={key}>
                                        {key}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                type="text"
                                value={
                                  inputValuesArray.find(
                                    (item) => item.id === model.id
                                  )?.features[feature] || ""
                                }
                                onChange={(e) =>
                                  handleValuesChange(
                                    model.id,
                                    feature,
                                    e.target.value
                                  )
                                }
                                className={`${
                                  checkIsMostImpacted(feature, model.id)
                                    ? "border-2 border-red-500 text-red-500"
                                    : ""
                                }`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-5 px-5">
                      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full">
                        {Object.entries(JSON.parse(model.output_maps)).map(
                          ([label], idx) => (
                            <Button
                              key={idx}
                              variant={`${
                                predictionsDict[model.id]?.prediction === label
                                  ? "destructive"
                                  : "secondary"
                              }`}
                              className="w-full sm:w-auto sm:min-w-[120px] "
                            >
                              {label}{" "}
                              {predictionsDict?.[model.id]?.probabilities?.[
                                label
                              ] !== undefined
                                ? `(${predictionsDict[model.id].probabilities[
                                    label
                                  ].toFixed(1)}%)`
                                : ""}
                            </Button>
                          )
                        )}
                        {predictionsDict[model.id] && (
                          <p className="text-gray-500 text-xs">
                            *most impacted
                          </p>
                        )}
                      </div>
                      <Button
                        variant="default"
                        size="lg"
                        className="mr-10 w-1/2 xl:w-1/4"
                        disabled={predictionLoading}
                        onClick={() => handlePredict(model.id)}
                      >
                        {predictionLoading ? (
                          <Loader className="animate-spin" />
                        ) : (
                          "Predict"
                        )}
                      </Button>
                    </div>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
          <h1 className="text-xl w-full text-center font-semibold ml-4 underline underline-offset-4 ">
            Upcomming Models
          </h1>
          <div className="flex flex-wrap justify-center gap-4 mt-5">
            {UpCommingModelsArray.map((model) => (
              <div
                key={model}
                className="group bg-card/80 backdrop-blur-sm p-4  shadow-md  border border-border/30"
              >
                <p className="text-sm  flex items-center justify-center font-semibold ">
                  {model}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetectionModal;
