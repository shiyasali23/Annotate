"use client";
import React, { useEffect, useState } from "react";

import { detectFood } from "@/lib/foods-api";

import CameraModule from "@/components/CameraModule";
import Header from "@/components/Header";
import { useFood } from "@/contexts/foodContext";
import LoadingComponent from "@/components/LoadingComponent";
import FoodNutrientAnalytics from "@/components/FoodNutrientAnalytics";
import { useUser } from "@/contexts/userContext";
import ErrorComponent from "@/components/ErrorComponent";
import ServicesModal from "@/components/NoDataFound";

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
  const [isItemFood, setIsItemFood] = useState(true);
  const memoizedFoodsData = useMemo(() => foodsData, [foodsData]);
  const memoizedNutrientsData = useMemo(() => nutrientsData, [nutrientsData]);

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

  useEffect(() => {
    if (!foodsNameArray) {
      fetchFoodNutrients();
    }
  }, []);

  const handleImage = async (image) => {
    const { detectedFoods, message } = await detectFood(image, foodsNameArray);

    if (message && !detectedFoods) {
      setMessage(message || "Something went wrong");
    } else if (detectedFoods) {
      setPredictedFoods(detectedFoods);
    }

    setPredictedFoods(false);
  };

  return (
    <div className="flex w-screen min-h-screen flex-col">
      <Header />
      {message && <p className="w-full text-center text-red-500">{message}</p>}

      {foodNutrientsDataLoading ? (
        <LoadingComponent text={"Loading Data."} />
      ) : (
        <div>
          <div className="w-screen  h-[70vh]  flex">
            <div className=" flex  flex-col w-full">
              <div className="flex-1  w-full     m-auto">
                <CameraModule
                  handleImage={handleImage}
                  setPredictedFoods={setPredictedFoods}
                  className={`px-2`}
                />
              </div>
            </div>
            <div className="w-full xl:w-[80vw]">Food score components</div>
          </div>

          {foodsNameArray && (
            <div className="w-scree flex">
              <FoodNutrientAnalytics />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Food;
