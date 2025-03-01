import { useUser } from "@/contexts/userContext";
import React, { useMemo } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import BiochemicalLineGraph from "./BiochemicalLineGraph";

const BiometricsAccordion = () => {
  const { biometrics } = useUser();

  const categories = useMemo(() => biometrics ? Object.keys(biometrics) : [], [biometrics]);

  return (
    <div className="w-[97vw] xl:w-[95vw] m-auto my-5">
      {biometrics && (
        <Accordion type="single" collapsible className="border ">
          {categories.map((category) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="ml-7  font-semibold text-sm">{category}</AccordionTrigger>
              <AccordionContent className="grid  grid-cols-1 md:grid-cols-2 gap-2 list-disc px-2">
                {useMemo(() => 
                  Object.entries(biometrics[category]).map(([name, biochemical]) => (
                    <BiochemicalLineGraph key={name} name={name} biochemical={biochemical} />
                  )), 
                [biometrics[category]])}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
};

export default BiometricsAccordion;
