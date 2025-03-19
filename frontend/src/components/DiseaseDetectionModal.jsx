import React, { useEffect, useState, useCallback, useMemo } from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";
import LoadingComponent from "./LoadingComponent";
import ErrorComponent from "./ErrorComponent";
import { getModels, getDiseasePredictions } from "@/lib/diagnosis-api";
import { useData } from "@/contexts/dataContext";

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
import { useUser } from "@/contexts/userContext";

const DiseaseDetectionModal = ({ isOpen, onClose }) => {
  const {
    diseaseDetectionModals,
    setDiseaseDetectionModals,
    dignosisModelsTypes,
  } = useData();
  const { userData, latestBiometrics } = useUser();
  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [openAcc, setOpenAcc] = useState(null);
  const [inputValuesArray, setInputValuesArray] = useState([]);
  const [errorsDict, setErrorsDict] = useState({});
  const [predictionsDict, setPredictionsDict] = useState({});

  const UpCommingModelsArray = useMemo(
    () => ["Alzheimers Detection", "Kidney Function", "Cancer Prediction"],
    []
  );

  const isModelValid = useCallback(
    (modelId) => {
      const currentItem = inputValuesArray.find((item) => item.id === modelId);
      if (!currentItem) return false;
  
      for (const key in currentItem.features) {
        if (!currentItem.features[key]) {
          return false;
        }
      }
      return currentItem.features;
    },
    [inputValuesArray]
  );

  const initializeErrorsDict = useCallback((models) => {
    setErrorsDict(
      models.reduce((acc, model) => {
        acc[model.id] = "All fields are required";
        return acc;
      }, {})
    );
  }, []);

  // Simplified function to pre-populate values from userData and latestBiometrics
  const updateInputValuesArray = useCallback(
    (models) => {
      if (!models.length) {
        setInputValuesArray([]);
        return;
      }

      setInputValuesArray(
        models.map((model) => {
          const featureNames = JSON.parse(model.feature_names);

          // Initialize features with empty values
          const features = featureNames.reduce((acc, feature) => {
            acc[feature] = "";
            return acc;
          }, {});

          // Populate from userData if key exists
          if (userData) {
            Object.keys(features).forEach((feature) => {
              // Use Map for case-insensitive key lookup
              const userDataLowerCase = new Map(
                Object.entries(userData).map(([k, v]) => [k.toLowerCase(), v])
              );
              const lowerFeature = feature.toLowerCase();

              if (
                userDataLowerCase.has(lowerFeature) &&
                userDataLowerCase.get(lowerFeature) !== null
              ) {
                features[feature] = userDataLowerCase
                  .get(lowerFeature)
                  .toString();
              }
            });
          }

          // Populate from latestBiometrics if name matches
          if (latestBiometrics?.length) {
            // Create a Map for O(1) lookups
            const biometricsMap = new Map(
              latestBiometrics.map((biometric) => [
                biometric.name.toLowerCase(),
                biometric,
              ])
            );

            Object.keys(features).forEach((feature) => {
              const biometric = biometricsMap.get(feature.toLowerCase());
              if (biometric?.value !== null) {
                features[feature] = biometric?.value;
              }
            });
          }

          return {
            id: model.id,
            features,
          };
        })
      );
    },
    [userData, latestBiometrics]
  );

  // Helper function to check if a date is expired
  const isExpired = useCallback((expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  }, []);

  // Find biometric expiry date - memoized for performance
  const biometricExpiryDates = useMemo(() => {
    if (!latestBiometrics?.length) return new Map();
    return new Map(
      latestBiometrics.map((b) => [b.name.toLowerCase(), b.expiryDate])
    );
  }, [latestBiometrics]);

  const getBiometricExpiryDate = useCallback(
    (featureName) => {
      return biometricExpiryDates.get(featureName.toLowerCase()) || null;
    },
    [biometricExpiryDates]
  );

  const loadModels = useCallback(async () => {
    setLoading(true);
    const models = await getModels(dignosisModelsTypes[1]);
    setDiseaseDetectionModals(models);
    updateInputValuesArray(models);
    initializeErrorsDict(models);
    setLoading(false);
  }, [
    setDiseaseDetectionModals,
    dignosisModelsTypes,
    updateInputValuesArray,
    initializeErrorsDict,
  ]);

  const handleValuesChange = useCallback((modelId, feature, value) => {
    setInputValuesArray((prev) => {
      const index = prev.findIndex((item) => item.id === modelId);
      if (index === -1) return prev;

      // Create a new array with just the updated item changed
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        features: {
          ...updated[index].features,
          [feature]: value,
        },
      };

      // Check if all fields are filled
      const valid = Object.values(updated[index].features).every(
        (val) => val !== ""
      );

      // Update errors dictionary
      setErrorsDict((prevErrors) => ({
        ...prevErrors,
        [modelId]: valid ? "" : "All fields are required",
      }));

      return updated;
    });
  }, []);

  const handlePredict = useCallback(
    (modelId) => {
      // First check if the model is valid
      const features = isModelValid(modelId);
      
      // If not valid, show error and open accordion
      if (!features) {
        setOpenAcc(modelId);
        setErrorsDict((prev) => ({
          ...prev,
          [modelId]: "All fields are required",
        }));
        return; // Important! Exit the function here if validation fails
      }
      
      // Only proceed with API call if validation passes
      handlePredictRequest(modelId, features);
    },
    [isModelValid]
  );

  const handlePredictRequest = useCallback(async (modelId, featuresDict) => {
    // Double-check validation before API call
    if (!featuresDict || Object.values(featuresDict).some(value => value === "")) {
      setErrorsDict((prev) => ({
        ...prev,
        [modelId]: "All fields are required",
      }));
      return; // Exit if validation fails
    }
    
    try {
      setPredictionLoading(true);
      setErrorsDict((prev) => ({ ...prev, [modelId]: "" }));

      const predictions = await getDiseasePredictions(modelId, featuresDict);
      if (predictions) {
        setPredictionsDict((prev) => ({ ...prev, [modelId]: predictions }));
      } else {
        setErrorsDict((prev) => ({
          ...prev,
          [modelId]: "Something went wrong",
        }));
      }
    } catch (error) {
      setErrorsDict((prev) => ({ ...prev, [modelId]: "An error occurred" }));
      console.error("Prediction error:", error);
    } finally {
      setOpenAcc(modelId);
      setPredictionLoading(false);
    }
  }, []);

  // Memoize important impact checks to avoid recalculation
  const impactFeatures = useMemo(() => {
    if (!diseaseDetectionModals.length) return {};
    return diseaseDetectionModals.reduce((acc, model) => {
      acc[model.id] = model.max_feature_impact;
      return acc;
    }, {});
  }, [diseaseDetectionModals]);

  const checkIsMostImpacted = useCallback(
    (feature, modelId) => {
      if (!predictionsDict[modelId]) return false;
      return impactFeatures[modelId] === feature;
    },
    [impactFeatures, predictionsDict]
  );

  // Initialize data when component mounts
  useEffect(() => {
    if (isOpen && !diseaseDetectionModals.length) {
      loadModels();
    }
  }, [isOpen, loadModels, diseaseDetectionModals.length]);

  // Reset or initialize input values when modal opens with existing data
  useEffect(() => {
    if (isOpen && diseaseDetectionModals.length > 0) {
      updateInputValuesArray(diseaseDetectionModals);
      initializeErrorsDict(diseaseDetectionModals);
    }
  }, [
    isOpen,
    diseaseDetectionModals,
    updateInputValuesArray,
    initializeErrorsDict,
  ]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPredictionsDict({});
      setOpenAcc(null);
    }
  }, [isOpen]);

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
                        {features.map((feature) => {
                          const expiryDate = getBiometricExpiryDate(feature);
                          const expired = isExpired(expiryDate);
                          const isMostImpacted = checkIsMostImpacted(
                            feature,
                            model.id
                          );
                          const inputValue =
                            inputValuesArray.find(
                              (item) => item.id === model.id
                            )?.features[feature] || "";

                          return (
                            <div key={feature} className="space-y-1">
                              <Label
                                className={`text-xs truncate block ${
                                  isMostImpacted ? "text-red-500" : ""
                                }`}
                              >
                                {isMostImpacted ? "* " : ""}
                                {feature}
                              </Label>

                              {expiryDate && expired && (
                                <p className="text-xs text-red-800">
                                  Expired on:{" "}
                                  {new Date(expiryDate).toLocaleDateString()}
                                </p>
                              )}

                              {featureMaps[feature] ? (
                                <Select
                                  onValueChange={(val) =>
                                    handleValuesChange(model.id, feature, val)
                                  }
                                  value={inputValue}
                                >
                                  <SelectTrigger
                                    className={`rounded-none ${
                                      isMostImpacted
                                        ? "border-2 border-red-500 text-red-500"
                                        : ""
                                    } ${expired ? "border-amber-500" : ""}`}
                                  >
                                    <SelectValue
                                      placeholder={`Select ${feature}`}
                                      className={
                                        isMostImpacted ? "text-red-500" : ""
                                      }
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.keys(featureMaps[feature]).map(
                                      (key) => (
                                        <SelectItem key={key} value={key}>
                                          {key}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Input
                                  type="number"
                                  value={inputValue}
                                  onChange={(e) =>
                                    handleValuesChange(
                                      model.id,
                                      feature,
                                      e.target.value
                                    )
                                  }
                                  className={`rounded-none ${
                                    isMostImpacted
                                      ? "border-2 border-red-500 text-red-500"
                                      : ""
                                  } ${expired ? "border-amber-500" : ""}`}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-5 px-5">
                      <div className="grid grid-cols-2 sm:flex sm:flex-row gap-4 w-full">
                        {Object.entries(JSON.parse(model.output_maps)).map(
                          ([label], idx) => {
                            const prediction = predictionsDict[model.id];
                            const isActive = prediction?.prediction === label;
                            const probability =
                              prediction?.probabilities?.[label];

                            return (
                              <Button
                                key={idx}
                                variant={isActive ? "destructive" : "secondary"}
                                className="w-full sm:w-auto sm:min-w-[120px] rounded-none"
                              >
                                {label}{" "}
                                {probability !== undefined
                                  ? `(${probability.toFixed(1)}%)`
                                  : ""}
                              </Button>
                            );
                          }
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
                        className="mr-10 w-1/2 xl:w-1/4 rounded-none"
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
                className="group bg-card/80 backdrop-blur-sm p-4 shadow-md border border-border/30"
              >
                <p className="text-sm flex items-center justify-center font-semibold">
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