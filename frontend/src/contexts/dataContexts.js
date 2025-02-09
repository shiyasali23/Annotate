// src/contexts/DataContext.js
"use client";
import React, { createContext, useContext, useState } from "react";

// Define the context
const DataContext = createContext();

// Provider component
export const DataProvider = ({ children }) => {
  const companyName = "Biolabs";
  const servicesArray = [
    ["Know which foods are good for you ", "Food Recommendation"],
    ["Detect diseases with your biochemicals detection", "Diseases Detections"],
    ["Monitoring  your health and biochemicals", "Analytics Platform"],
    ["Feeling any symptoms? Check out", "Diagnostics Center"],
    ["Store you records and get insights", "Bio Records"],
    ["Artificail inteligence is here to answer you", "Bio Gpt"],

  ]

  const [diseaseDetectionModals, setDiseaseDetectionModals] = useState([]);

  
  return (
    <DataContext.Provider value={{ servicesArray,companyName, diseaseDetectionModals, setDiseaseDetectionModals }}>
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
