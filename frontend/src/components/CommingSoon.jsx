import React from "react";
import { AiOutlineCloseSquare } from "react-icons/ai";
import { FaClockRotateLeft } from "react-icons/fa6";

const CommingSoon = ({ isOpen, onClose, commingSoonIndex }) => {
  const servicesArray = [
    [
      "Bio Fold",
      "Using advanced protein folding and molecular docking to design custom medications that perfectly matches unique biology. Through quantum-enhanced computational models, simulate how compounds interact with specific cellular receptors at the molecular level.To boost therapeutic outcomes by ensuring optimal drug-target interactions while minimizing adverse effects",
    ],
    [
      "Bio Genes",
      "Genetic analysis to identify inherited health risks by comparing DNA with similar profiles. Advanced algorithms detect subtle genetic variations that traditional tests miss, enabling early intervention before symptoms appear wich shifts healthcare from reactive to preventative",
    ],
    [
      "Bio Intelligence",
      "Personalized health assistant powered by artificial intelligence seamlessly integrated with all of our services. Designed to provide every possible comprehensive health insights and expert guidance empowering to make informed decisions",
    ],
    [
      "Bio Vault",
      "Secure space that allows to store any kind of medical informations digitally. From reports and prescriptions to personal health notes and observations. That can be also shared with trusted individuals. To gain insights, track conditions to make informed decisions",
    ],
  ];

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-[85vw] xl:w-[50vw] h-[75vh] xl:h-[50vh] transition-all duration-300 ">
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />

        <div className="w-full h-full flex flex-col items-center justify-around animate-dropdown ">
          <div className="w-full h-full flex flex-col items-center justify-center mt-10 gap-5">
            <h1 className=" text-3xl font-bold underline">
              {servicesArray[commingSoonIndex][0]}
            </h1>
            <h1 className=" text-sm font-semibold px-10 xl:px-20 leading-[2rem]">
              {servicesArray[commingSoonIndex][1]}
            </h1>
          </div>

          <div className="w-full h-full flex flex-col items-center justify-center">
            <FaClockRotateLeft className={"text-base animate-bounce"} />

            <h1 className=" text-2xl font-bold  animate-pulse-opacity">Comming Soon...</h1>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommingSoon;
