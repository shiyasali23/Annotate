"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import BiometricsAccordion from "@/components/BiometricsAccordion";
import BiometricsEntryModal from "@/components/BiometricsEntryModal";
import ErrorComponent from "@/components/ErrorComponent";
import Header from "@/components/Header";
import HealthScoreGraph from "@/components/HealthScoreGraph";
import HyperHypoConditions from "@/components/HyperHypoConditions";
import LoadingComponent from "@/components/LoadingComponent";
import ServicesModal from "@/components/NoDataFound";

import { useUser } from "@/contexts/userContext";
import { getBiometricEntry } from "@/utils/analytics-utils";
import LatestBiometricsTable from "@/components/LatestBiometricsTable";

const Analytics = () => {
  const {
    isLogined,
    userDataLoading,
    biometricsEntries,
    latestBiometrics,
    biometrics,
    hyperBiochemicals,
    hypoBiochemicals,
    healthScore
  } = useUser();
  const [selectedBiometricEntry, setSelectedBiometricEntry] = useState(null);
  const [biometricsEntryModalOpen, setBiometricsEntryModalOpen] =
    useState(false);

  const router = useRouter();

  const biometricMap = biometricsEntries
    ? new Map(biometricsEntries.map((e) => [e.created_at, e]))
    : new Map();

  const handleBiometricEntry = (timeStamp) => {
    const processedBiometricEntry = getBiometricEntry(biometricMap, timeStamp);
    if (processedBiometricEntry) {
      setSelectedBiometricEntry(processedBiometricEntry);
      setBiometricsEntryModalOpen(true);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      {userDataLoading ? (
        <LoadingComponent text="Processing Data" />
      ) : !isLogined ? (
        <ErrorComponent
          heading={"User Data Not Found"}
          buttonText={"Login"}
          handleTryAgain={() => router.push("/about")}
        />
      ) : !biometricsEntries ? (
        <ServicesModal isOpen={true} onClose={() => {}} />
      ) : (
        <div className="flex mt-5 flex-col">
          <div className="w-[97vw] xl:w-[85vw] m-auto h-[40vh] xl:h-[50vh]">
            <HealthScoreGraph
              healthScore={healthScore}
              handleBiometricEntry={(timestamp) =>
                handleBiometricEntry(timestamp)
              }
            />
          </div>

          <div className="w-[97vw] xl:w-[85vw] m-auto  my-5 ">
            <HyperHypoConditions
              hyperBiochemicals={hyperBiochemicals}
              hypoBiochemicals={hypoBiochemicals}
            />
          </div>

          {latestBiometrics && (
            <div className="w-[97vw] xl:w-[95vw] max-h-[100vh] m-auto my-5 p-2 shadow-lg">
              <LatestBiometricsTable latestBiometrics={latestBiometrics} biometrics={biometrics}/>
            </div>
          )}

          {biometrics && (
            <div className="w-[97vw] xl:w-[95vw] m-auto my-5 shadow-lg">
              <BiometricsAccordion biometrics={biometrics} />
            </div>
          )}

          
        </div>
      )}

      {biometricsEntryModalOpen && (
        <BiometricsEntryModal
          isOpen={biometricsEntryModalOpen}
          onClose={() => {
            setBiometricsEntryModalOpen(false);
            setSelectedBiometricEntry(null);
          }}
          selectedBiometricEntry={selectedBiometricEntry}
        />
      )}
    </div>
  );
};

export default Analytics;
