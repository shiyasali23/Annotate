"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { detectFood } from "@/lib/food-reccomendation-api";
import CameraModule from "@/components/CameraModule";
import Header from "@/components/Header";
import { useFood } from "@/contexts/foodContext";
import LoadingComponent from "@/components/LoadingComponent";
import FoodSearch from "@/components/FoodSearch";
import FoodNutrientList from "@/components/FoodNutrientList";
import FoodNutrientBarGraph from "@/components/FoodNutrientBarGraph";
import FoodScores from "@/components/FoodScores";

const Food = () => {
  const [predictedFoods, setPredictedFoods] = useState(false);
  const [message, setMessage] = useState(null);

  const {
    nutrientsData,
    foodsData,
    foodNutrients,
    nutrientsFoods,
    foodNutrientsDataLoading,
    fetchFoodNutrients,
    foodsNameArray,
  } = useFood();

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [isItemFood, setIsItemFood] = useState(null);

  const memoizedFoodsData = useMemo(() => foodsData, [foodsData]);
  const memoizedNutrientsData = useMemo(() => nutrientsData, [nutrientsData]);

  const handleSelectedItem = useCallback(
    (item, isFood) => {
      setSelectedItem(item);
      setIsItemFood(isFood);
      const selectedDetails = isFood
        ? foodNutrients.find((food) => Object.keys(food)[0] === item)
        : nutrientsFoods.find((nutrient) => Object.keys(nutrient)[0] === item);

      setSelectedData(selectedDetails || null);

      // Smooth scroll to the chart section
      const section = document.getElementById("food-nutrient-chart");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    },
    [foodNutrients, nutrientsFoods]
  );

  const handleImage = async (image) => {
    const { detectedFoods, message } = await detectFood(image, foodsNameArray);
    if (message && !detectedFoods) {
      setMessage(message || "Something went wrong");
    } else if (detectedFoods) {
      setPredictedFoods(detectedFoods);
    }
    setPredictedFoods(false);
  };

  useEffect(() => {
    if (!foodsNameArray) {
      fetchFoodNutrients();
    }
  }, [foodsNameArray, fetchFoodNutrients]);

  useEffect(() => {
    if (selectedData) {
      const section = document.getElementById("food-nutrient-chart");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [selectedData]);

  return (
    <div className="flex w-screen min-h-screen flex-col">
      <Header />

      {foodNutrientsDataLoading ? (
        <LoadingComponent text="Loading Data." />
      ) : (
        <div className="flex flex-col w-full">
          {/* First Section */}
          <section className="w-full h-[80vh] flex flex-col gap-5  pb-16 mt-5">
            <FoodSearch
              nutrientsData={memoizedNutrientsData}
              foodsData={memoizedFoodsData}
              handleSelectedItem={handleSelectedItem}
            />
            {message && (
              <p className="w-full text-center text-red-500">{message}</p>
            )}
            <div className="w-full h-full flex items-center gap-2 px-2 ">
              <CameraModule handleImage={handleImage} />
              <div className="w-full h-full flex items-center gap-2">
                <FoodNutrientList
                  itemsArray={memoizedFoodsData}
                  selectedItem={selectedItem}
                  handleSelectedItem={handleSelectedItem}
                  isFood={true}
                />
                <FoodNutrientList
                  itemsArray={memoizedNutrientsData}
                  selectedItem={selectedItem}
                  handleSelectedItem={handleSelectedItem}
                  isFood={false}
                />
              </div>
            </div>
          </section>

          <section className="w-full min-h-[72vh] xl:min-h-[40vh]   flex ">
            {predictedFoods && <div className="flex-1 border">hi</div>}
            <div className="flex-1 ">
              <FoodScores />
            </div>
          </section>

          <section id="food-nutrient-chart">
            {selectedData && (
              <div className="w-full  h-full  p-4 xl:p-20 h-[92vh] xl:h-[88vh]">
                <FoodNutrientBarGraph
                  selectedData={selectedData}
                  isItemFood={isItemFood}
                />
              </div>
            )}
          </section>

          
       
        </div>
      )}
    </div>
  );
};

export default Food;
