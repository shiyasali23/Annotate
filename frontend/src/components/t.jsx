import { useBiochemical } from "@/contexts/biochemicalContext";
import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const BiochemicalsUpdate = () => {
  const [message, setMessage] = useState();
  const { biochemicalData } = useBiochemical();
  const [values, setValues] = useState({});

  const handleInputChange = (id, value) => {
    setValues((prevValues) => ({
      ...prevValues,
      [id]: value,
    }));
  };

  return (
    <div className="w-full h-full mt-10 xl:px-16 px-4 flex flex-col gap-10 border-t">
      {message && <p className="text-sm">{message}</p>}
      
      <Accordion type="multiple" className="w-full">
        {Object.entries(biochemicalData).map(([category, items]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="text-md font-semibold">
              {category}
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-4">
                {items.map((item) => (
                  <div key={item.id} className="flex flex-col space-y-2">
                    <Label htmlFor={`biochemical-${item.id}`} className="text-sm">
                      {item.name}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`biochemical-${item.id}`}
                        type="number"
                        placeholder="0"
                        value={values[item.id] || ""}
                        onChange={(e) => handleInputChange(item.id, e.target.value)}
                        className="w-[100px]"
                      />
                      <span className="text-sm whitespace-nowrap">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default BiochemicalsUpdate;