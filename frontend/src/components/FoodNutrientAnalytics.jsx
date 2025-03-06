"use client";

import React, { useState, useCallback, useMemo } from "react";
import FoodSearch from "./FoodSearch";
import { useFood } from "@/contexts/foodContext";
import FoodNutrientList from "./FoodNutrientList";
import FoodNutrientBarGraph from "./FoodNutrientBarGraph";

const FoodNutrientAnalytics = () => {
  const { nutrientsData, foodsData, foodNutrients, nutrientsFoods } = useFood();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [isItemFood, setIsItemFood] = useState(true);

  const handleSelectedItem = useCallback(
    (item, isFood) => {
      setSelectedItem(item);
      setIsItemFood(isFood);
      const selectedDetails = isFood
        ? foodNutrients.find((food) => food.hasOwnProperty(item))
        : nutrientsFoods.find((nutrient) => Object.keys(nutrient)[0] === item);

      setSelectedData(selectedDetails);
    },
    [foodNutrients, nutrientsFoods]
  );

  const memoizedFoodsData = useMemo(() => foodsData, [foodsData]);
  const memoizedNutrientsData = useMemo(() => nutrientsData, [nutrientsData]);

  return (
    <div className="w-screen my-10">
      <h1 className="w-full mb-5 text-center text-2xl font-bold">
        Food & Nutrients
      </h1>
      <FoodSearch
        nutrientsData={memoizedNutrientsData}
        foodsData={memoizedFoodsData}
        handleSelectedItem={handleSelectedItem}
      />
      <div className="flex  align-center justify-center h-[700px]">
        {selectedData && (
          <div className="flex-1 h-full flex flex-col px-1">
            <FoodNutrientBarGraph
              selectedData={selectedData}
              isItemFood={isItemFood}
            />
          </div>
        )}
        <div className="xl:w-[15%] w-[30%] p-1 overflow-y-scroll">
          <FoodNutrientList
            itemsArray={memoizedNutrientsData}
            selectedItem={selectedItem}
            handleSelectedItem={handleSelectedItem}
            isFood={false}
          />
        </div>
        <div className="xl:w-[15%] w-[30%] p-1 overflow-y-scroll">
          <FoodNutrientList
            itemsArray={memoizedFoodsData}
            selectedItem={selectedItem}
            handleSelectedItem={handleSelectedItem}
            isFood={true}
          />
        </div>
      </div>
    </div>
  );
};

export default FoodNutrientAnalytics;
