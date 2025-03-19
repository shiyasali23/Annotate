import React from "react";
import { GiBrain } from "react-icons/gi";
import { AiOutlineCloseSquare } from "react-icons/ai";
import { FaClockRotateLeft } from "react-icons/fa6";


const CommingSoon = ({ isOpen, onClose }) => {
  
if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white shadow-lg w-[95vw] h-[35vh] w-[55vw] transition-all duration-300 ">
        <AiOutlineCloseSquare
          className="absolute right-5 top-5 cursor-pointer text-3xl bg-black text-white hover:scale-110 transition duration-150"
          onClick={onClose}
        />

        <div className="w-full h-full flex flex-col items-center justify-center gap-3 animate-dropdown ">
        <FaClockRotateLeft className={"text-3xl"}/>

          <h1 className=" text-3xl font-bold">Comming Soon...</h1>
        </div>
      </div>
    </div>
  );
};

export default CommingSoon;