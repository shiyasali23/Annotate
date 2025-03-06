"use client";
import React, { useEffect, useState } from "react";

import { detectFood } from "@/lib/food-reccomendation-api";

import CameraModule from "@/components/CameraModule";
import Header from "@/components/Header";
import { useFood } from "@/contexts/foodContext";
import LoadingComponent from "@/components/LoadingComponent";
import FoodNutrientAnalytics from "@/components/FoodNutrientAnalytics";

const Food = () => {
  const { foodNutrientsDataLoading, fetchFoodNutrients, foodsNameArray } =
    useFood();
  const [predictedFoods, setPredictedFoods] = useState(false);
  const [message, setMessage] = useState(null);

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
          <div
            className={`w-screen   flex ${
              predictedFoods ? "h-[70vh]" : "h-[55vh]"
            }`}
          >
            <div className=" flex  flex-col w-full">
              <div className="flex-1  w-full     m-auto">
                <CameraModule
                  handleImage={handleImage}
                  setPredictedFoods={setPredictedFoods}
                  className={`${
                    predictedFoods ? "px-1 xl:px-32" : "px-16 xl:px-64"
                  }`}
                />
              </div>
              {predictedFoods && <div className="flex-1">results</div>}
            </div>
            {predictedFoods && <div className=" w-full xl:w-[80vw]">left</div>}
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
