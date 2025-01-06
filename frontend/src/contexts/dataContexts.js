// src/contexts/DataContext.js
"use client";
import React, { createContext, useContext, useState } from "react";

// Define the context
const DataContext = createContext();

// Provider component
export const DataProvider = ({ children }) => {
  // Services array: stored in the context, accessible globally
  const [servicesArray, setServicesArray] = useState([
    ["Food Recommendation", "FoodRecomendandion"],
    ["Disease Detection", "Detection"],
    ["Analytics Platform", "Analytics"],
    ["Diagnostics Center", "Diagnostics"],
  ]);

  return (
    <DataContext.Provider value={{ servicesArray, setServicesArray }}>
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
