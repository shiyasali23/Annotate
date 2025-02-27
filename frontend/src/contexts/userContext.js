"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  processBiometricData,
  processConditions,
  processResponseData,
} from "@/utils/user-data-worker";
import { getConditions } from "@/lib/user-api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLogined, setIsLogined] = useState(false);
  const [userData, setUserData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [biochemicals, setBiochemicals] = useState(null);
  const [latestBiometrics, setLatestBiometrics] = useState(null);
  const [hyperBiochemicals, setHyperBiochemicals] = useState(null);
  const [hypoBiochemicals, setHypoBiochemicals] = useState(null);

  const [userDataLoading, setUserDataLoading] = useState(true);

  useEffect(() => {
    setUserDataLoading(true);
    const {
      isLogined,
      localUserData,
      localHealthScore,
      localBiochemicals,
      localLatestBiometrics,
      localHyperBiochemicals,
      localHypoBiochemicals,
    } = processResponseData();
    
    if (localUserData && isLogined) {
      
      
      setIsLogined(true);
      setUserData(localUserData);
      setHealthScore(localHealthScore);
      setBiochemicals(localBiochemicals);
      setLatestBiometrics(localLatestBiometrics);
      setHyperBiochemicals(localHyperBiochemicals);
      setHypoBiochemicals(localHypoBiochemicals);
    }
    setUserDataLoading(false);
  }, []);

  const handleAuthResponse = (data) => {
    setUserDataLoading(true);
    if (data.token && data.user) {
      processResponseData({ token: data.token, userdata: data.user });
      setUserData(data.user);
      setIsLogined(true);
    }

    if (
      Array.isArray(data.biometrics_entries) &&
      data.biometrics_entries.length
    ) {
      const {
        healthScore,
        biochemicals,
        latestBiometrics,
        hyperBiochemicals,
        hypoBiometrics,
        hyperHypoBiochemicalsIds,
      } = processBiometricData(data.biometrics_entries);

      setHealthScore(healthScore);
      setBiochemicals(biochemicals);
      setLatestBiometrics(latestBiometrics);

      processResponseData({
        healthScore: healthScore,
        biochemicals: biochemicals,
        latestBiometrics: latestBiometrics,
        hyperBiochemicals: hyperBiochemicals,
        hypoBiochemicals: hypoBiometrics,
      });
      if (hyperHypoBiochemicalsIds?.length) {
        handleConditions(
          hyperHypoBiochemicalsIds,
          hyperBiochemicals,
          hypoBiometrics
        );
      }
    }
    setUserDataLoading(false);
  };

  const handleConditions = async (
    conditionsIds,
    hyperBiochemicals,
    hypoBiometrics
  ) => {
    if (!conditionsIds?.length) return;


    const conditions = await getConditions(conditionsIds);
    if (conditions) {
      const { processedHyperBiochemicals, processedHypoBiochemicals } =
        processConditions(conditions, hyperBiochemicals, hypoBiometrics);

      if (processedHyperBiochemicals)
        setHyperBiochemicals(processedHyperBiochemicals);
      processResponseData({
        hyperBiochemicals: processedHyperBiochemicals,
      });
      if (processedHypoBiochemicals)
        setHypoBiochemicals(processedHypoBiochemicals);
      processResponseData({
        hypoBiochemicals: processedHypoBiochemicals,
      });
    }

  };
console.log(userData);

  const handleUserdata = (data) => {
    setUserDataLoading(true);
    setUserData(data);
    processResponseData({ userdata: data });
    setUserDataLoading(false);
  };

  const logOutUser = () => {
    setIsLogined(false);
    ["token", "userdata", "healthScore", "biochemicals", "latestBiometrics", "hyperBiochemicals", "hypoBiochemicals"]
      .forEach(key => localStorage.removeItem(key));
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
        biochemicals,
        latestBiometrics,
        hyperBiochemicals,
        hypoBiochemicals,
        userDataLoading,
        userData,
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
