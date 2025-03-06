import React, { useMemo } from "react";

const FoodNutrientList = ({ itemsArray, selectedItem, handleSelectedItem, isFood }) => {
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

  

  return (
    <div className="w-full flex flex-col h-full">
      {Object.entries(categorizedItems).map(([category, items]) => (
        <div key={category} className="w-full flex flex-col gap-3 mt-2">
          <div className="flex flex-col gap-3 mx-auto border p-2">
            <h1 className="underline font-bold text-sm text-center w-[115px] xl:w-[150px]">
              {category}
            </h1>
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <button
                  onClick={() => handleSelectedItem(item, isFood)}
                  key={item}
                  className={`border border-dashed border-1 border-gray-300 text-xs py-1 w-[115px] xl:w-[150px] ${
                    item === selectedItem ? "bg-gray-800 text-white border-none" : ""
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FoodNutrientList;
