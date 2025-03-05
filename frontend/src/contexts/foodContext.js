"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getFoodNutrients } from "@/lib/food-reccomendation-api";
import { processCacheData } from "@/utils/cache-wroker";
import { processFoodNutrients } from "@/utils/food-woker";

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodNutrientsData, setFoodNutrientsData] = useState(null);
  const [foodsNamesArray, setFoodsNamesArray] = useState(null);
  const [foodNutrientsDataLoading, setFoodNutrientsDataLoading] = useState(true);


  useEffect(() => {
    setFoodNutrientsDataLoading(true);
      const { localFoodNutrients, localFoodsNamesArray } = processCacheData();
      if (localFoodNutrients) {
        setFoodNutrientsData(localFoodNutrients);
      }
      if(localFoodsNamesArray) {
          setFoodsNamesArray(localFoodsNamesArray);
      }
      setFoodNutrientsDataLoading(false);
    }, []);

  const fetchFoodNutrients = async () => {
    setFoodNutrientsDataLoading(true);
    const foodNutrients = await getFoodNutrients();
    if (foodNutrients) {
      const processedFoodNutrients = processFoodNutrients(foodNutrients);
      if (processedFoodNutrients) {
        setFoodNutrientsData(processedFoodNutrients);
        const foodsNamesArray = processedFoodNutrients.map(item => Object.keys(item)[0]);
        setFoodsNamesArray(foodsNamesArray);
        processCacheData({ foodNutrients: processedFoodNutrients, foodsNamesArray: foodsNamesArray });
      }
    }
    setFoodNutrientsDataLoading(false);
  };

  return (
    <FoodContext.Provider
      value={{
        foodNutrientsData,
        foodNutrientsDataLoading,
        fetchFoodNutrients,
        
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFood must be used within a FoodProvider");
  }
  return context;
};
