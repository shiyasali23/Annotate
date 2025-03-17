"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { processBiometricData } from "@/utils/biometrics-worker";
import { cacheManager } from "@/utils/cache-wroker";

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
  const [userDataLoading, setUserDataLoading] = useState(true);

  const [foodsScore, setFoodsScore] = useState(null);


  useEffect(() => {
    setUserDataLoading(true);
    const cachedData = cacheManager.multiGet([
      "token",
      "userData",
      "latestBiometrics",
      "healthScore",
      "biometrics",
      "biometricsEntries",
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

  const handleAuthResponse = async (data) => {
    console.log(data);
    
    setUserDataLoading(true);
    
    if (data.token && data.user) {
      cacheManager.multiSet({
        token: data.token,
        userData: data.user,
      });
      setUserData(data.user);
      setIsLogined(true);
    }
    
    if (Array.isArray(data.biometrics_entries) && data.biometrics_entries.length) {
      setBiometricsEntries(data.biometrics_entries);

      // The processBiometricData now handles API calls internally and returns processed data
      const {
        healthScore,
        biometrics,
        latestBiometrics,
        hyperBiochemicals: processedHyperBiochemicals,
        hypoBiochemicals: processedHypoBiochemicals,
      } = await processBiometricData(data.biometrics_entries);
      setHealthScore(healthScore);
      setBiometrics(biometrics);
      setLatestBiometrics(latestBiometrics);
      setHyperBiochemicals(processedHyperBiochemicals);
      setHypoBiochemicals(processedHypoBiochemicals);

      // Cache all the processed data
      cacheManager.multiSet({
        biometricsEntries: data.biometrics_entries,
        healthScore,
        biometrics,
        latestBiometrics,
        hyperBiochemicals: processedHyperBiochemicals,
        hypoBiochemicals: processedHypoBiochemicals,
      });
    }

    if (data.foods_score?.foods_score) {
      setFoodsScore(data.foods_score.foods_score);
      cacheManager.multiSet({
        foodsScore: data.foods_score.foods_score,
      });
    } 
    
    setUserDataLoading(false);
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