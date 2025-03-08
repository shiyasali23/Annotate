"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { processBiometricData, processConditions } from "@/utils/biometrics-worker";
import { cacheManager } from "@/utils/cache-wroker";
import { getConditions } from "@/lib/biochemicals-api";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [isLogined, setIsLogined] = useState(false);
  const [userData, setUserData] = useState(null);
  const [latestBiometricsEntryId, setLatestBiometricsEntryId] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [biometrics, setBiometrics] = useState(null);
  const [biometricsEntries, setBiometricsEntries] = useState(null);
  const [latestBiometrics, setLatestBiometrics] = useState(null);
  const [hyperBiochemicals, setHyperBiochemicals] = useState(null);
  const [hypoBiochemicals, setHypoBiochemicals] = useState(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  useEffect(() => {
    setUserDataLoading(true);
    const cachedData = cacheManager.multiGet([
      "token",
      "userData",
      "latestBiometricsEntryId",
      "healthScore",
      "biometrics",
      "latestBiometrics",
      "hyperBiochemicals",
      "hypoBiochemicals",
      "biometricsEntries",
    ]);

    if (cachedData.token && cachedData.userData) {
      setIsLogined(true);
      setUserData(cachedData.userData);
      setHealthScore(cachedData.healthScore);
      setBiometrics(cachedData.biometrics);
      setLatestBiometrics(cachedData.latestBiometrics);
      setHyperBiochemicals(cachedData.hyperBiochemicals);
      setHypoBiochemicals(cachedData.hypoBiochemicals);
      setBiometricsEntries(cachedData.biometricsEntries);
      setLatestBiometricsEntryId(cachedData.latestBiometricsEntryId);
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

    if (data.latest_biometrics_entry_id) {
      cacheManager.set("latestBiometricsEntryId", data.latest_biometrics_entry_id);
      setLatestBiometricsEntryId(data.latest_biometrics_entry_id);
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
    setLatestBiometricsEntryId(null);
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
        latestBiometricsEntryId,
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
