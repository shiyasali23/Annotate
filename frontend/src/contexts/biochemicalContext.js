"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getBiochemicals } from "@/lib/biochemicals-api";
import { cacheManager } from "@/utils/cache-wroker";
import { processBiochemicals } from "@/utils/biochemical-worker";

const BiochemicalContext = createContext();

export const BiochemicalProvider = ({ children }) => {
  const [biochemicalData, setBiochemicalData] = useState(null);
  const [biochemicalDataLoading, setBiochemicalDataLoading] = useState(true);

  useEffect(() => {
    setBiochemicalDataLoading(true);
    const localBiochemicals = cacheManager.get("biochemicals");
    if (localBiochemicals) {
      setBiochemicalData(localBiochemicals);
    }
    setBiochemicalDataLoading(false);
  }, []);

  const fetchBiochemicals = async () => {
    setBiochemicalDataLoading(true);
    const biochemicals = await getBiochemicals();
    if (biochemicals) {
      const processedBiochemicals = processBiochemicals(biochemicals);
      if (processedBiochemicals) {
        setBiochemicalData(processedBiochemicals);
        cacheManager.set("biochemicals", processedBiochemicals);
      }
    }
    setBiochemicalDataLoading(false);
  };

  return (
    <BiochemicalContext.Provider
      value={{
        biochemicalData,
        biochemicalDataLoading,
        fetchBiochemicals,
        setBiochemicalDataLoading,
      }}
    >
      {children}
    </BiochemicalContext.Provider>
  );
};

export const useBiochemical = () => {
  const context = useContext(BiochemicalContext);
  if (!context) {
    throw new Error("useBiochemical must be used within a BiochemicalProvider");
  }
  return context;
};
