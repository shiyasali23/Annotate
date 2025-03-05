"use client";
import React, { useEffect, useState } from "react";

import { detectFood } from "@/lib/food-reccomendation-api";

import CameraModule from "@/components/CameraModule";
import Header from "@/components/Header";
import { useFood } from "@/contexts/foodContext";
import LoadingComponent from "@/components/LoadingComponent";
import ErrorComponent from "@/components/ErrorComponent";

const Food = () => {
  const { foodNutrientsData, foodNutrientsDataLoading, fetchFoodNutrients, foodsNamesArray } =
    useFood();


    useEffect(() => {
      if(!foodNutrientsData){
        fetchFoodNutrients();
      }
    }, []);

    console.log(foodNutrientsData);
    

  const [predictedFoods, setPredictedFoods] = useState(null);
  const [message, setMessage] = useState(null);

  const handleImage = async (image) => {
    setPredictedFoods(null);
    const { detectedFoods, message } = await detectFood(image, foodsNamesArray);

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
      ) : !foodNutrientsData ? (
        <ErrorComponent
          heading={"Something Went Wrong"}
          buttonText={"Try Again"}
          handleTryAgain={fetchFoodNutrients}
        />
      ) : (
        <div>
          <div className=" w-screen  h-[78vh] xl:h-[87vh] flex ">
            <div className=" flex  flex-col w-full">
              <div
                className={`flex-1  w-full pb-48 pl-1 mt-2 xl:px-24  m-auto ${
                  predictedFoods && "pb-0 xl:py-0"
                }`}
              >
                <CameraModule handleImage={handleImage} />
              </div>
              {predictedFoods && <div className="flex-1">results</div>}
            </div>
            <div className=" w-full xl:w-[80vw]">left</div>
          </div>
          <div className="w-screen  h-[50vh]  flex">graph</div>
        </div>
      )}
    </div>
  );
};

export default Food;
