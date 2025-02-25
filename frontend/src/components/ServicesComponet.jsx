import React, { useState } from "react";
import ServicesModal from "./ServicesModal";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import DiagnosisModal from "./DiagnosisModal";

import { useData } from "@/contexts/dataContexts";

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
    <div className="w-full min-h-[92vh] xl:h-[88vh] flex flex-col items-center justify-evenly p-4 ">
      <h1 className="text-4xl xl:text-5xl underline underline-offset-8  font-bold">Our Services</h1>
      <div className=" grid grid-cols-2 md:grid-cols-3 gap-7 xl:px-12 w-full">
        {servicesArray.map((service, index) => (
          <div
            key={index}
            onClick={() => handleServiceClick(index)}
            className="shadow-xl  hover:shadow-2xl px-1 py-4 xl:p-5 sm:h-[8rem] xl:h-[12rem] flex flex-col justify-center   gap-2"
          >
            <p className="text-xs xl:text-xl  font-semibold text-center leading-tight px-2">
              {service[0]}
            </p>
            <span className="mx-auto relative inline-flex w-fit justify-center items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-black text-white text-xs sm:text-xs lg:text-base font-medium cursor-pointer overflow-hidden group border-2 border-black">
              <span className="absolute inset-0 bg-white transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
              <span className="relative sm:text-xs lg:text-base  group-hover:text-black transition-colors duration-500 ease-out">
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
