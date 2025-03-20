"use client";
import React, { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const companyName = "Biolabs";
  const servicesArray = [
    ["Detect Diseases With Biochemicals", "Diseases Detections"],
    ["Feeling Any kind of Symptoms?", "Diagnostics Center"],
    ["Get Suggestions Of Foods For You", "Food Recommendation"],
    ["Monitoring  Health And Biochemicals", "Analytics Platform"],
    ["Create Biology Specific Medicines", "Bio Fold"],
    ["Analysis And Report Over DNA Sequences", "Bio Genes"],
    ["Personalized Artificial Intelligence", "Bio Intelligence"],
    ["Archive Medical Records And Insight", "Bio Vault"],
  ];

  const [diseaseDetectionModals, setDiseaseDetectionModals] = useState([]);
  const [diagnosisModel, setDiagnosisModel] = useState([]);
  const dignosisModelsTypes = ["diagnosis_model", "disease_detections"];
  const authApiOPtions = ["authenticate", "signup"];

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
        authApiOPtions,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
