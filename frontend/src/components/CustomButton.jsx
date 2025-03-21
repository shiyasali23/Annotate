import React from "react";
import { Button } from "@/components/ui/button";

const CustomButton = ({ text, onClick, className = "", type = "button" }) => {
  return (
    <Button
      type={type}
      onClick={onClick}
      className={`border border-2 border-black relative px-6 py-2 text-sm sm:text-base bg-black text-white 
                   group overflow-hidden transition-all duration-300 ease-in-out 
                  font-medium flex items-center justify-center rounded-none ${className}`}
    >
      <span className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-300 ease-in-out"></span>
      <span className="relative z-10 group-hover:text-black transition-colors duration-300 ease-in-out">
        {text}
      </span>
    </Button>
  );
};

export default CustomButton;
