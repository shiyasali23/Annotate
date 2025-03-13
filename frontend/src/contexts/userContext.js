"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { processBiometricData, processConditions } from "@/utils/biometrics-worker";
import { cacheManager } from "@/utils/cache-wroker";
import { getConditions } from "@/lib/biochemicals-api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLogined, setIsLogined] = useState(false);
  const [userData, setUserData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [biometrics, setBiometrics] = useState(null);
  const [biometricsEntries, setBiometricsEntries] = useState(null);
  const [latestBiometrics, setLatestBiometrics] = useState(null);
  const [hyperBiochemicals, setHyperBiochemicals] = useState(null);
  const [hypoBiochemicals, setHypoBiochemicals] = useState(null);
  
  const [foodsScore, setFoodsScore] = useState(null);
  
  const [userDataLoading, setUserDataLoading] = useState(true);

  useEffect(() => {
    setUserDataLoading(true);
    const cachedData = cacheManager.multiGet([
      "token",
      "userData",
      "healthScore",
      "biometrics",
      "biometricsEntries",
      "latestBiometrics",
      "hyperBiochemicals",
      "hypoBiochemicals",
      
      "foodsScore",
    ]);

    if (cachedData.token && cachedData.userData) {
      setIsLogined(true);
      setUserData(cachedData.userData);
      setHealthScore(cachedData.healthScore);
      setBiometrics(cachedData.biometrics);
      setBiometricsEntries(cachedData.biometricsEntries);
      setLatestBiometrics(cachedData.latestBiometrics);
      setHyperBiochemicals(cachedData.hyperBiochemicals);
      setHypoBiochemicals(cachedData.hypoBiochemicals);
      setFoodsScore(cachedData.foodsScore);
    }
    setUserDataLoading(false);
  }, []);

  const handleAuthResponse = (data) => {
    setUserDataLoading(true);
    
    if (data.token && data.user) {
      cacheManager.multiSet({
        token: data.token,
        userData: data.user,
      });
      setUserData(data.user);
      setIsLogined(true);
    }
    
    if (data.foods_score.foods_score){
      cacheManager.set("foodsScore", data.foods_score.foods_score);
      setFoodsScore(data.foods_score.foods_score);
    }

   

    if (Array.isArray(data.biometrics_entries) && data.biometrics_entries.length) {
      setBiometricsEntries(data.biometrics_entries);

      const {
        healthScore,
        biometrics,
        latestBiometrics,
        hyperBiochemicals: processedHyperBiochemicals,
        hypoBiochemicals: processedHypoBiochemicals,
        hyperHypoBiochemicalsIds,
      } = processBiometricData(data.biometrics_entries);

      setHealthScore(healthScore);
      setBiometrics(biometrics);
      setLatestBiometrics(latestBiometrics);

      cacheManager.multiSet({
        biometricsEntries: data.biometrics_entries,
        healthScore,
        biometrics,
        latestBiometrics,
      });

      if (hyperHypoBiochemicalsIds?.length) {
        handleConditions(
          hyperHypoBiochemicalsIds,
          processedHyperBiochemicals,
          processedHypoBiochemicals
        );
      }
    }
    setUserDataLoading(false);
  };

  const handleConditions = async (conditionsIds, hyperData, hypoData) => {
    if (!conditionsIds?.length) return;
    const conditions = await getConditions(conditionsIds);
    if (conditions) {
      const { processedHyperBiochemicals, processedHypoBiochemicals } =
        processConditions(conditions, hyperData, hypoData);

      cacheManager.multiSet({
        hyperBiochemicals: processedHyperBiochemicals,
        hypoBiochemicals: processedHypoBiochemicals,
      });

      setHyperBiochemicals(processedHyperBiochemicals);
      setHypoBiochemicals(processedHypoBiochemicals);
    }
  };

  const handleUserdata = (data) => {
    setUserDataLoading(true);
    setUserData(data);
    cacheManager.set("userData", data);
    setUserDataLoading(false);
  };

  const logOutUser = () => {
    setIsLogined(false);
    setHealthScore(null);
    setBiometrics(null);
    setLatestBiometrics(null);
    setHyperBiochemicals(null);
    setHypoBiochemicals(null);
    setUserData(null);
    setBiometricsEntries(null);
    setFoodsScore(null);
    cacheManager.clearAll();
  };

  return (
    <UserContext.Provider
      value={{
        handleAuthResponse,
        logOutUser,
        setUserDataLoading,
        handleUserdata,
        isLogined,
        healthScore,
        userData,
        biometrics,
        biometricsEntries,
        latestBiometrics,
        hyperBiochemicals,
        hypoBiochemicals,
        foodsScore,
        userDataLoading,
        
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
