// src/contexts/DataContext.js
"use client";
import React, { createContext, useContext, useState } from "react";

// Define the context
const DataContext = createContext();

// Provider component
export const DataProvider = ({ children }) => {
  const companyName = "Biolabs";
  const servicesArray = [
    ["Get Suggestions Of Foods For You", "Food Recommendation"],
    ["Detect Diseases With Biochemicals", "Diseases Detections"],
    ["Monitoring  Health And Biochemicals", "Analytics Platform"],
    ["Feeling Any Symptoms? Check Out", "Diagnostics Center"],
    ["Store Medical Records For Analysis", "Bio Records"],
    ["Chat With Our Artificial Inteligence", "Bio Gpt"],
  ];

  const [diseaseDetectionModals, setDiseaseDetectionModals] = useState([]);
  const [diagnosisModel, setDiagnosisModel] = useState([]);
  const dignosisModelsTypes = ["diagnosis_model", "disease_detections"];

  return (
    <DataContext.Provider
      value={{
        servicesArray,
        companyName,
        diseaseDetectionModals,
        setDiseaseDetectionModals,
        diagnosisModel,
        setDiagnosisModel,
        dignosisModelsTypes,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
