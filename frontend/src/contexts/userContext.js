"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  processBiometricData,
  processConditions,
  processLocalStorrageData,
} from "@/utils/data-worker";
import { getConditions } from "@/lib/biochemicals-api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLogined, setIsLogined] = useState(false);
  const [userData, setUserData] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [biometrics, setBiometrics] = useState(null);
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
      localBiometrics,
      localLatestBiometrics,
      localHyperBiochemicals,
      localHypoBiochemicals,
    } = processLocalStorrageData();

    if (localUserData && isLogined) {
      setIsLogined(true);
      setUserData(localUserData);
      setHealthScore(localHealthScore);
      setBiometrics(localBiometrics);
      setLatestBiometrics(localLatestBiometrics);
      setHyperBiochemicals(localHyperBiochemicals);
      setHypoBiochemicals(localHypoBiochemicals);
    }
    setUserDataLoading(false);
  }, []);

  const handleAuthResponse = (data) => {
    setUserDataLoading(true);
    if (data.token && data.user) {
      processLocalStorrageData({ token: data.token, userdata: data.user });
      setUserData(data.user);
      setIsLogined(true);
    }

    if (
      Array.isArray(data.biometrics_entries) &&
      data.biometrics_entries.length
    ) {
      const {
        healthScore,
        biometrics,
        latestBiometrics,
        hyperBiochemicals,
        hypoBiochemicals,
        hyperHypoBiochemicalsIds,
      } = processBiometricData(data.biometrics_entries);

      setHealthScore(healthScore);
      setBiometrics(biometrics);
      setLatestBiometrics(latestBiometrics);

      processLocalStorrageData({
        healthScore: healthScore,
        biometrics: biometrics,
        latestBiometrics: latestBiometrics,
      });
      if (hyperHypoBiochemicalsIds?.length) {
        handleConditions(
          hyperHypoBiochemicalsIds,
          hyperBiochemicals,
          hypoBiochemicals
        );
      }
    }
    setUserDataLoading(false);
  };

  const handleConditions = async (
    conditionsIds,
    hyperBiochemicals,
    hypoBiochemicals
  ) => {
    if (!conditionsIds?.length) return;

    const conditions = await getConditions(conditionsIds);
    if (conditions) {
      const { processedHyperBiochemicals, processedHypoBiochemicals } =
        processConditions(conditions, hyperBiochemicals, hypoBiochemicals);

      if (processedHyperBiochemicals)
        setHyperBiochemicals(processedHyperBiochemicals);
      processLocalStorrageData({
        hyperBiochemicals: processedHyperBiochemicals,
      });
      if (processedHypoBiochemicals)
        setHypoBiochemicals(processedHypoBiochemicals);
      processLocalStorrageData({
        hypoBiochemicals: processedHypoBiochemicals,
      });
    }
  };

  const handleUserdata = (data) => {
    setUserDataLoading(true);
    setUserData(data);
    processLocalStorrageData({ userdata: data });
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
  
    // Correcting the localStorage removal syntax
    [
      "token",
      "userdata",
      "healthScore",
      "biometrics",
      "latestBiometrics",
      "hyperBiochemicals",
      "hypoBiochemicals",
    ].forEach((key) => localStorage.removeItem(key));
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
        biometrics,
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
