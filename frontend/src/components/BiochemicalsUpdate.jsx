import { useBiochemical } from "@/contexts/biochemicalContext";
import React, { useState } from "react";
import { Loader } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateBiometrics } from "@/lib/user-api";
import { useUser } from "@/contexts/userContext";

import CustomButton from "./CustomButton";
import LoadingComponent from "./LoadingComponent";
import ErrorComponent from "./ErrorComponent";

const BiochemicalsUpdate = () => {
  const {
    biochemicalData,
    biochemicalDataLoading,
    setBiochemicalDataLoading,
    fetchBiochemicals,
  } = useBiochemical();
  const { latestBiometrics, handleAuthResponse } = useUser();
  const [openCategory, setOpenCategory] = useState(null);
  const [inputValuesArray, setInputValuesArray] = useState({});
  const [message, setMessage] = useState("");

  const handleInputChange = (id, value) => {
    setInputValuesArray((prevValues) => {
      const numericValue = value === "" ? "" : Number(value);
      const biometricValue = latestBiometrics?.find(
        (item) => item.id === id
      )?.value;

      if (biometricValue === numericValue) {
        const { [id]: _, ...newValues } = prevValues;
        return newValues;
      }

      return { ...prevValues, [id]: { id, value: numericValue } };
    });
  };

  const getBiometricData = (id) =>
    latestBiometrics?.find((item) => item.id === id);

  const handleSave = async (inputValuesArray) => {
    setBiochemicalDataLoading(true);
    const updatedInputValuesArray = Object.values(inputValuesArray);
    const response = await updateBiometrics(updatedInputValuesArray);
    if (response) {
      handleAuthResponse(response);
    } else {
      setMessage("Something went wrong");
    }
    setBiochemicalDataLoading(false);
  };

  return (
    <div className="w-full h-full xl:px-16 px-4 mt-10 flex flex-col gap-2 ">
      
      {biochemicalDataLoading ? (
        <LoadingComponent text="Processing Biometrics Data" />
      ) : !biochemicalData ? (
        <ErrorComponent handleTryAgain={fetchBiochemicals} />
      ) : (
        <Accordion
          type="single"
          collapsible
          value={openCategory}
          onValueChange={setOpenCategory}
          className="w-full flex flex-col"
        >
          {message && (
        <p className="w-full text-center text-md text-red-500">{message}</p>
      )}
          {Object.entries(biochemicalData).map(([category, items]) => (
            <AccordionItem key={category} value={category}>
              
              <AccordionTrigger className="text-sm xl:text-md">
                {category}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-5 px-1 ">
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pt-5 border-t">
                  
                  {items.map((item) => {
                    const biometricData = getBiometricData(item.id);
                    const isExpired = biometricData?.isExpired;
                    const expiryDate = biometricData?.expiryDate
                      ? new Date(biometricData.expiryDate).toLocaleDateString()
                      : null;
                    const healthyMin = biometricData?.healthy_min;
                    const healthyMax = biometricData?.healthy_max;
                    const isHyper = biometricData?.isHyper;
                    const value = biometricData?.value || null;

                    return (
                      <div key={item.id} className="flex flex-col space-y-2">
                        <Label
                          htmlFor={`biochemical-${item.id}`}
                          className="text-xs xl:text-sm font-semibold"
                        >
                          {item.name}
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`biochemical-${item.id}`}
                            type="number"
                            placeholder="0"
                            value={
                              inputValuesArray[item.id]?.value ?? value ?? ""
                            }
                            onChange={(e) =>
                              handleInputChange(item.id, e.target.value)
                            }
                            className="w-[100px] text-xs xl:text-sm"
                          />
                          <h1 className="text-xs xl:text-sm whitespace-nowrap flex items-center">
                            {item.unit}
                          </h1>
                        </div>
                        {isExpired && expiryDate && (
                          <h1 className="text-xs xl:text-sm text-red-800 font-semibold">
                            Expired On: {expiryDate}
                          </h1>
                        )}
                        {isHyper !== null && (
                          <div className="flex gap-2 items-center">
                            <h1 className="text-xs">Optimum Value:</h1>
                            <div className="flex items-center">
                              (
                              <p
                                className={`${
                                  isHyper ? "" : "text-red-600"
                                } text-xs`}
                              >
                                {healthyMin}
                              </p>
                              <span>-</span>
                              <p
                                className={`${
                                  isHyper ? "text-red-600" : ""
                                } text-xs`}
                              >
                                {healthyMax}
                              </p>
                              )
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {Object.keys(inputValuesArray).length > 0 && (
                  <CustomButton
                    text={
                      biochemicalDataLoading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Save"
                      )
                    }
                    className="w-1/8 m-auto"
                    onClick={() => handleSave(inputValuesArray)}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default BiochemicalsUpdate;
