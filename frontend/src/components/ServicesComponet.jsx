import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ServicesModal from "./ServicesModal";
import DiseaseDetectionModal from "./DiseaseDetectionModal";
import DiagnosisModal from "./DiagnosisModal";

import { useData } from "@/contexts/dataContext";
import CustomButton from "./CustomButton";
import { useUser } from "@/contexts/userContext";

const ServicesComponent = () => {
  const { servicesArray } = useData();
  const {isLogined} = useUser();

  const router = useRouter();
  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [diseaseDetectionModalOpen, setDiseaseDetectionModalOpen] =
    useState(false);
  const [diagnosisModalOpen, setDiagnosisModalOpen] = useState(false);

  const handleServiceClick = (index) => {
    index === 2 && isLogined ? router.push("/analytics") : setServicesModalOpen(true);
    index === 1 && setDiseaseDetectionModalOpen(true);
    index === 3 && setDiagnosisModalOpen(true);
  };

  return (
    <div className="w-full min-h-[85vh] xl:h-[88vh] flex flex-col items-center justify-evenly p-4 ">
      <h1 className="text-3xl xl:text-4xl underline underline-offset-8  font-bold">
        Our Services
      </h1>
      <div className=" grid grid-cols-2 md:grid-cols-3 gap-7 xl:px-12 w-full">
        {servicesArray.map((service, index) => (
          <div
            key={index}
            onClick={() => handleServiceClick(index)}
            className="shadow-[0_0_8px_2px_rgba(0,0,0,0.0.05)] rounded border-dashed border  cursor-pointer py-2 px-2 xl:py-5 hover:shadow-2xl  sm:h-[10rem] xl:h-[10rem] flex flex-col justify-between   gap-4"
          >
            <h1 className="tracking-wider word-spacing-wider text-xs xl:text-lg font-semibold text-left leading-tight px-2 xl:px-8">
              {service[0]}
            </h1>
            <div className="px-1 xl:px-8">
            <CustomButton text={service[1]} className="mx-auto w-full  text-xs rounded" />
            </div>
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
