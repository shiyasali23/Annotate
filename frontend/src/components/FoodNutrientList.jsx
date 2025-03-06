"use client";
import React, { useMemo } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const FoodNutrientList = ({ itemsArray, selectedItem, handleSelectedItem, isFood }) => {
  // Group items by category (or subCategory if available)
  const categorizedItems = useMemo(() => {
    return itemsArray.reduce((acc, { category, subCategory, name }) => {
      const categoryKey = subCategory || category;
      if (!acc[categoryKey]) {
        acc[categoryKey] = [];
      }
      acc[categoryKey].push(name);
      return acc;
    }, {});
  }, [itemsArray]);

  // Compute the default open accordion based on selectedItem
  const defaultAccordionValue = useMemo(() => {
    if (!selectedItem) return undefined;
    for (const [category, items] of Object.entries(categorizedItems)) {
      if (items.includes(selectedItem)) return category;
    }
    return undefined;
  }, [categorizedItems, selectedItem]);

  return (
    <div className="w-full flex-1 flex flex-col h-full overflow-y-scroll border px-5">
      <Accordion 
        type="single" 
        defaultValue={defaultAccordionValue} 
        collapsible
        // Using a key ensures the Accordion re-mounts when defaultAccordionValue changes.
        key={defaultAccordionValue || "none"}
      >
        {Object.entries(categorizedItems).map(([category, items]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="  text-xs font-bold text-center w-full">
              {category}
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  onClick={() => handleSelectedItem(item, isFood)}
                  key={item}
                  className={`border border-dashed border-gray-300 text-xs py-1 w-full mt-2 font-semibold ${
                    item === selectedItem ? "bg-gray-800 text-white border-none" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FoodNutrientList;
