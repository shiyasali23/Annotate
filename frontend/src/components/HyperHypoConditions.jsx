import { useUser } from "@/contexts/userContext";
import React from "react";
import ConditionsTree from "./ConditionsTree";

const HyperHypoConditions = () => {
  const { hyperBiochemicals, hypoBiochemicals } = useUser();


  console.log("hypoBiochemicals", hypoBiochemicals);
  

  const noBiochemicals = (type) => {
    return <h1 className="text-center text-gray-500">No {type} Biochemicals</h1>;
  };

  return (
    <div className="w-[97vw] xl:w-[85vw] m-auto  my-5 ">
      <h1 className="text-2xl font-bold w-full text-center my-5">
        Conditions May Have
      </h1>
      <div className="w-full flex flex-col gap-5">
        <div className="w-full">
          {(!hyperBiochemicals || hyperBiochemicals.length === 0) 
            ? noBiochemicals("Hyper") 
            : (<ConditionsTree biochemicalsArray={hyperBiochemicals} isHyper={true}/>)}
        </div>
        <div className="w-full">
          {(!hypoBiochemicals || hypoBiochemicals.length === 0) 
            ? noBiochemicals("Hypo") 
            : (<ConditionsTree biochemicalsArray={hypoBiochemicals} isHyper={false}/>)}
        </div>
      </div>
    </div>
  );
};

export default HyperHypoConditions;


  
  
  