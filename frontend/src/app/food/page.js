"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { detectFood } from "@/lib/foods-api";
import CameraModule from "@/components/CameraModule";
import Header from "@/components/Header";
import { useFood } from "@/contexts/foodContext";
import LoadingComponent from "@/components/LoadingComponent";
import FoodSearch from "@/components/FoodSearch";
import FoodNutrientList from "@/components/FoodNutrientList";
import FoodNutrientBarGraph from "@/components/FoodNutrientBarGraph";
import FoodScores from "@/components/FoodScores";
import { mapDetectedFoods, scrollToElementById } from "@/utils/food-utils";
import FoodPredictionsBarGraph from "@/components/FoodPredictionsBarGraph";

const Food = () => {
  const {
    nutrientsData,
    foodsData,
    foodNutrients,
    nutrientsFoods,
    foodNutrientsDataLoading,
    fetchFoodNutrients,
    foodNutriscoreData,
  } = useFood();

  const [predictedFoodsData, setPredictedFoodsData] = useState();
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [isItemFood, setIsItemFood] = useState(null);

  const memoizedFoodsData = useMemo(() => foodsData, [foodsData]);
  const memoizedNutrientsData = useMemo(() => nutrientsData, [nutrientsData]);

  const domIds = ["predicted-foods", "food-nutrient-chart"];

  const handleSelectedItem = useCallback(
    (item, isFood) => {      
      setSelectedItem(item);
      setIsItemFood(isFood);
      const selectedDetails = isFood
        ? foodNutrients.find((food) => Object.keys(food)[0] === item)
        : nutrientsFoods.find((nutrient) => Object.keys(nutrient)[0] === item);
      setSelectedData(selectedDetails || null);
      scrollToElementById(domIds[1]);
    },
    [foodNutrients, nutrientsFoods]
  );

  const handleImage = async (image) => {
    setMessage(null);
    setPredictionLoading(true);
    setPredictedFoodsData(null);

    const { detectedFoods, message: detectMessage } = await detectFood(
      image,
      foodNutriscoreData
    );

    if (detectMessage && !detectedFoods) {
      setMessage(detectMessage || "Something went wrong");
      setPredictedFoodsData(null);
    } else if (detectedFoods) {
      const { mappedPredictedFoods, maxNutriScoreFood } = mapDetectedFoods(
        detectedFoods,
        foodNutriscoreData
      );
      if (mappedPredictedFoods) {
        setPredictedFoodsData(mappedPredictedFoods);
        handleSelectedItem(maxNutriScoreFood, true);
      } else {
        setMessage("No Food Detected. Try New");
      }
    }
    setPredictionLoading(false);
  };

  useEffect(() => {
    if (!foodNutriscoreData && !foodNutrientsDataLoading) fetchFoodNutrients();
  }, [foodNutriscoreData, foodNutrientsDataLoading, fetchFoodNutrients]);
  
  useEffect(() => {
    if (selectedItem && !predictedFoodsData) {
      scrollToElementById(domIds[1]);
    }
  }, [selectedItem, predictedFoodsData]);

  return (
    <div className="flex w-screen min-h-screen flex-col">
      <Header />
      {foodNutrientsDataLoading ? (
        <LoadingComponent text="Loading Data." />
      ) : (
        <div className="flex flex-col w-full gap-10">
          <section className="w-full h-[75vh] flex flex-col gap-5 mt-5  overflow-hidden">
            <div className="px-2">
              <FoodSearch
                nutrientsData={memoizedNutrientsData}
                foodsData={memoizedFoodsData}
                handleSelectedItem={handleSelectedItem}
              />
            </div>

            {message && (
              <p className="w-full text-center text-red-500">{message}</p>
            )}

            <div
              className="w-full flex gap-2 overflow-hidden"
              style={{ height: "calc(100% - 60px)" }}
            >
              <div className="w-[40%] xl:w-1/2 h-full px-2 overflow-auto">
                <CameraModule
                  handleImage={handleImage}
                  setPredictionLoading={setPredictionLoading}
                  predictionLoading={predictionLoading}
                />
              </div>

              <div className="w-[60%] xl:w-1/2 h-full flex gap-1 overflow-hidden">
                {memoizedFoodsData && (
                  <div className="w-1/2 h-full overflow-auto">
                    <FoodNutrientList
                      itemsArray={memoizedFoodsData}
                      selectedItem={selectedItem}
                      handleSelectedItem={handleSelectedItem}
                      isFood={true}
                    />
                  </div>
                )}

                {memoizedNutrientsData && (
                  <div className="w-1/2 h-full overflow-auto">
                    <FoodNutrientList
                      itemsArray={memoizedNutrientsData}
                      selectedItem={selectedItem}
                      handleSelectedItem={handleSelectedItem}
                      isFood={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section id={domIds[0]} className="w-full min-h-[40vh] flex">
            {predictedFoodsData && (
              <div className="flex-1 px-2 w-1/2">
                <FoodPredictionsBarGraph
                  predictedFoodsData={predictedFoodsData}
                  isNutriScore={true}
                  handleSelectedItem={handleSelectedItem}
                />
              </div>
            )}
            <div className="flex-1 w-1/2">
              <FoodScores />
            </div>
          </section>

          <section id={domIds[1]}>
            {selectedData && (
              <div className="w-full h-full p-4 xl:px-20 xl:py-10 h-[92vh] xl:h-[80vh]">
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
