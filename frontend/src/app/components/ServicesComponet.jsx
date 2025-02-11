import { useData } from "@/contexts/dataContexts";
import React, { useState } from "react";
import ServicesModal from "./ServicesModal";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import DiagnosisModal from "./DiagnosisModal";

const ServicesComponent = () => {
  const { servicesArray } = useData();
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [diseaseDetectionModalOpen, setDiseaseDetectionModalOpen] =
    useState(false);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);

  const handleServiceClick = (index) => {
    index === 2 && setServicesModalOpen(true);
    index === 1 && setDiseaseDetectionModalOpen(true);
    index === 3 && setDiagnosisModalOpen(true);
  };

  return (
    <div className="w-full min-h-[92vh] xl:h-[88vh] flex items-center justify-center p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 max-w-6xl w-full">
        {servicesArray.map((service, index) => (
          <div
            key={index}
            onClick={() => handleServiceClick(index)}
            className="bg-white  shadow p-3 sm:p-4 lg:p-6 mx-auto flex flex-col justify-between gap-2 sm:gap-3"
          >
            <h1 className="text-sm sm:text-base lg:text-xl font-semibold text-center leading-tight">
              {service[0]}
            </h1>
            <span className="mx-auto relative inline-flex w-fit justify-center items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-black text-white text-xs sm:text-sm lg:text-base font-medium cursor-pointer overflow-hidden group border-2 border-black">
              <span className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              <span className="relative group-hover:text-black transition-colors duration-500 ease-out">
                {service[1]}
              </span>
            </span>
          </div>
        ))}
      </div>
      {servicesModalOpen && (
        <ServicesModal
          isOpen={servicesModalOpen}
          onClose={() => setServicesModalOpen(false)}
        />
      )}
      {diseaseDetectionModalOpen && (
        <DiseaseDetectionModal
          isOpen={diseaseDetectionModalOpen}
          onClose={() => setDiseaseDetectionModalOpen(false)}
        />
      )}
      {diagnosisModalOpen && (
        <DiagnosisModal
          isOpen={diagnosisModalOpen}
          onClose={() => setDiagnosisModalOpen(false)}
        />
      )}
    </div>
  );
};

export default ServicesComponent;
