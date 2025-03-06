"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { getFoodNutrients } from "@/lib/food-reccomendation-api";
import { cacheManager } from "@/utils/cache-wroker";
import { processFoodNutrients } from "@/utils/food-woker";

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [foodNutrients, setFoodNutrients] = useState(null);
  const [nutrientsFoods, setNutrientsFoods] = useState(null);
  const [foodsData, setFoodsData] = useState(null);
  const [nutrientsData, setNutrientsData] = useState(null);
  const [foodsNameArray, setFoodsNameArray] = useState(null);
  const [foodNutrientsDataLoading, setFoodNutrientsDataLoading] = useState(true);

  useEffect(() => {
    setFoodNutrientsDataLoading(true);
    const cached = cacheManager.multiGet([
      "foodNutrients",
      "nutrientsFoods",
      "foodsData",
      "nutrientsData",
      "foodsNameArray",
    ]);
    if (cached.foodNutrients) setFoodNutrients(cached.foodNutrients);
    if (cached.nutrientsFoods) setNutrientsFoods(cached.nutrientsFoods);
    if (cached.foodsData) setFoodsData(cached.foodsData);
    if (cached.nutrientsData) setNutrientsData(cached.nutrientsData);
    if (cached.foodsNameArray) setFoodsNameArray(cached.foodsNameArray);
    setFoodNutrientsDataLoading(false);
  }, []);

  const fetchFoodNutrients = async () => {
    setFoodNutrientsDataLoading(true);
    const foodNutrientsData = await getFoodNutrients();
    if (foodNutrientsData) {
      const {
        foodNutrients,
        nutrientsFoods,
        foodsData,
        nutrientsData,
        foodsNameArray,
      } = processFoodNutrients(foodNutrientsData);
      
      cacheManager.multiSet({
        foodNutrients,
        nutrientsFoods,
        foodsData,
        nutrientsData,
        foodsNameArray,
      });
      
      setFoodNutrients(foodNutrients);
      setNutrientsFoods(nutrientsFoods);
      setFoodsData(foodsData);
      setNutrientsData(nutrientsData);
      setFoodsNameArray(foodsNameArray);
    }
    setFoodNutrientsDataLoading(false);
  };

  // console.log(JSON.stringify(foodsData, null, 2));
  // console.log(JSON.stringify(nutrientsData, null, 2));

  return (
    <FoodContext.Provider
      value={{
        fetchFoodNutrients,
        foodNutrientsDataLoading,
        foodNutrients, 
        nutrientsFoods,
        foodsData,
        nutrientsData,
        foodsNameArray,
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
