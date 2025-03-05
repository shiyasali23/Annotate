"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { processBiometricData, processConditions } from "@/utils/biochemical-worker";
import { processCacheData, handleCacheLogout } from "@/utils/cache-wroker"
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
      localBiometricsEntries,
    } = processCacheData();

    if (localUserData && isLogined) {
      setIsLogined(true);
      setUserData(localUserData);
      setHealthScore(localHealthScore);
      setBiometrics(localBiometrics);
      setLatestBiometrics(localLatestBiometrics);
      setHyperBiochemicals(localHyperBiochemicals);
      setHypoBiochemicals(localHypoBiochemicals);
      setBiometricsEntries(localBiometricsEntries);
    }
    setUserDataLoading(false);
  }, []);

  const handleAuthResponse = (data) => {
    setUserDataLoading(true);
    if (data.token && data.user) {
      processCacheData({ token: data.token, userdata: data.user });
      setUserData(data.user);
      setIsLogined(true);
    }

    if (Array.isArray(data.biometrics_entries) && data.biometrics_entries.length) {
      setBiometricsEntries(data.biometrics_entries);
      processCacheData({ biometricsEntries: data.biometrics_entries });
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
      processCacheData({ healthScore, biometrics, latestBiometrics });

      if (hyperHypoBiochemicalsIds?.length) {
        handleConditions(hyperHypoBiochemicalsIds, hyperBiochemicals, hypoBiochemicals);
      }
    }
    setUserDataLoading(false);
  };

  const handleConditions = async (conditionsIds, hyperBiochemicals, hypoBiochemicals) => {
    if (!conditionsIds?.length) return;
    const conditions = await getConditions(conditionsIds);
    if (conditions) {
      const { processedHyperBiochemicals, processedHypoBiochemicals } =
        processConditions(conditions, hyperBiochemicals, hypoBiochemicals);

      if (processedHyperBiochemicals) {
        setHyperBiochemicals(processedHyperBiochemicals);
        processCacheData({ hyperBiochemicals: processedHyperBiochemicals });
      }
      if (processedHypoBiochemicals) {
        setHypoBiochemicals(processedHypoBiochemicals);
        processCacheData({ hypoBiochemicals: processedHypoBiochemicals });
      }
    }
  };

  const handleUserdata = (data) => {
    setUserDataLoading(true);
    setUserData(data);
    processCacheData({ userdata: data });
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
    // Clear the in-memory cache
    handleCacheLogout();
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
        biometricsEntries,
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
