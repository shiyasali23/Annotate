"use client";

import React, { createContext, useContext, useState } from "react";
import { processBiometricData } from "@/workers/biometricsWorker";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [foodScore, setFoodScore] = useState([]);
  const [healthScore, setHealthScore] = useState([]);
  const [biochemicals, setBiochemicals] = useState([]);
  const [latestBiometrics, setLatestBiometrics] = useState([]);
  const [hyperBiochemicals, setHyperBiochemicals] = useState([]);
  const [hypoBiometrics, setHypoBiometrics] = useState([]);

  const [biometricsLoading, setBiometricsLoading] = useState(false);

  const handleAuthResponse = (data) => {
    setBiometricsLoading(true);
    localStorage.setItem("token", data.token);

    if (data.food_score) {
      setFoodScore(data.food_score);
    }

    if (data.biometrics_entries && Array.isArray(data.biometrics_entries)) {
      const {
        healthScore,
        biochemicals,
        latestBiometrics,
        hyperBiochemicals,
        hypoBiometrics,
      } = processBiometricData(data.biometrics_entries);
      setHealthScore(healthScore);
      setBiochemicals(biochemicals);
      setLatestBiometrics(latestBiometrics);
      setHyperBiochemicals(hyperBiochemicals);
      setHypoBiometrics(hypoBiometrics);
    }
    setBiometricsLoading(false);
  };

console.log("biochemicals", biochemicals);
console.log("latestBiometrics", latestBiometrics);
console.log("hyperBiochemicals", hyperBiochemicals);
console.log("hypoBiometrics", hypoBiometrics);
console.log("healthScore", healthScore);






  return (
    <UserContext.Provider
      value={{
        handleAuthResponse,
        foodScore,
        healthScore,
        biochemicals,
        latestBiometrics,
        hyperBiochemicals,
        hypoBiometrics,
        biometricsLoading,
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
