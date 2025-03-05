"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getBiochemicals } from "@/lib/biochemicals-api";
import { processCacheData } from "@/utils/cache-wroker";
import { processBiochemicals } from "@/utils/biochemical-worker";

const BiochemicalContext = createContext();

export const BiochemicalProvider = ({ children }) => {
  const [biochemicalData, setBiochemicalData] = useState(null);
  const [biochemicalDataLoading, setBiochemicalDataLoading] = useState(true);

  useEffect(() => {
    setBiochemicalDataLoading(true);
    // Retrieve data from our in-memory cache
    const { localBiochemicals } = processCacheData();
    if (localBiochemicals) {
      setBiochemicalData(localBiochemicals);
    } else {
      fetchBiochemicals();
    }
    setBiochemicalDataLoading(false);
  }, []);

  const fetchBiochemicals = async () => {
    setBiochemicalDataLoading(true);
    const biochemicals = await getBiochemicals();
    if (biochemicals) {
      const processedBiochemicals = processBiochemicals(biochemicals);
      if (processedBiochemicals) {
        // Update the state and the in-memory cache
        setBiochemicalData(processedBiochemicals);
        processCacheData({ biochemicals: processedBiochemicals });
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
