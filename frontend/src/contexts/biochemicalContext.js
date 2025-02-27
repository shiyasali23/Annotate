"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getBiochemicals } from "@/lib/biochemicals-api";
import { processLocalStorrageData, processBiochemicals } from "@/utils/data-worker";

const BiochemicalContext = createContext();

export const BiochemicalProvider = ({ children }) => {
  const [biochemicalData, setBiochemicalData] = useState(null);
  const [biochemicalDataLoading, setBiochemicalDataLoading] = useState(true);

  useEffect(() => {
    setBiochemicalDataLoading(true);
    const { localBiochemicals } = processLocalStorrageData();
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
      if(processedBiochemicals){
        setBiochemicalData(biochemicals);
        processLocalStorrageData({ biochemicals: processedBiochemicals });
      }
      
      
    }
    setBiochemicalDataLoading(false);
  };


  return (
    <BiochemicalContext.Provider
      value={{ biochemicalData, biochemicalDataLoading,fetchBiochemicals, setBiochemicalDataLoading }}
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
