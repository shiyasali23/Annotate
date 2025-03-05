"use client";

import BiometricsAccordion from "@/components/BiometricsAccordion";
import BiometricsEntryModal from "@/components/BiometricsEntryModal";
import ErrorComponent from "@/components/ErrorComponent";
import Header from "@/components/Header";
import HealthScoreGraph from "@/components/HealthScoreGraph";
import HyperHypoConditions from "@/components/HyperHypoConditions";
import LoadingComponent from "@/components/LoadingComponent";
import ServicesModal from "@/components/ServicesModal";
import { useUser } from "@/contexts/userContext";
import { getBiometricEntry } from "@/utils/biochemical-worker";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Analytics = () => {
  const { isLogined, userDataLoading, biometricsEntries } = useUser();
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
        <ErrorComponent heading={"User Data Not Found"} buttonText={"Login"} handleTryAgain={()=>router.push("/about")}/>
      ) : !biometricsEntries ? (
        <ServicesModal isOpen={true} onClose={() => {}} />
      ) : (
        <div className="flex mt-5 flex-col">
          <HealthScoreGraph
            handleBiometricEntry={(timestamp) =>
              handleBiometricEntry(timestamp)
            }
          />
          <HyperHypoConditions/>
          <BiometricsAccordion/>
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
