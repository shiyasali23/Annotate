"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import BiometricsAccordion from "@/components/BiometricsAccordion";
import BiometricsEntryModal from "@/components/BiometricsEntryModal";
import ErrorComponent from "@/components/ErrorComponent";
import HealthScoreGraph from "@/components/HealthScoreGraph";
import HyperHypoConditions from "@/components/HyperHypoConditions";
import LoadingComponent from "@/components/LoadingComponent";

import { useUser } from "@/contexts/userContext";
import { getBiometricEntry } from "@/utils/analytics-utils";
import LatestBiometricsTable from "@/components/LatestBiometricsTable";
import NoDataFound from "@/components/NoDataFound";

const Analytics = () => {
  const {
    isLogined,
    userDataLoading,
    biometricsEntries,
    latestBiometrics,
    biometrics,
    hyperBiochemicals,
    hypoBiochemicals,
    healthScore,
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
    <div className="min-h-screen flex  flex-col ">
      {userDataLoading ? (
        <LoadingComponent text="Processing Data" />
      ) : !isLogined ? (
        <NoDataFound
          isOpen={true}
          isModal={false}
          route={'analytics'}
          
        />
      ) : !biometricsEntries ? (
         <ErrorComponent heading={"No Biometrics Found"} buttonText={"Update Biometrics"} handleTryAgain={()=>router.push("/profile")}/>
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
            <div className="w-[97vw] xl:w-[95vw]  m-auto my-5 p-2 shadow-lg">
              <LatestBiometricsTable
                latestBiometrics={latestBiometrics}
                biometrics={biometrics}
              />
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
