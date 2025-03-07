// utils/food-utils.js

/**
 * Maps detected foods (all lowercase) to the original values from foodNutriscoreData.
 * If a match is found, the original value (with its case) is returned.
 */
export const mapDetectedFoods = (detectedFoods, foodNutriscoreData) => {
  const mappedPredictedFoods = detectedFoods
    .map(detected =>
      foodNutriscoreData.find(item => item.name.toLowerCase() === detected)
    )
    .filter(item => item !== undefined);

  if (mappedPredictedFoods.length === 0) return { mappedPredictedFoods: null, maxNutriScoreFood: null };

  // Find the food with the highest nutriScore and return only its name
  const maxNutriScoreFood = mappedPredictedFoods.reduce((max, food) =>
    food.nutriScore > max.nutriScore ? food : max
  ).name;

  return { mappedPredictedFoods, maxNutriScoreFood };
};
  /**
   * Scrolls smoothly to the element with the given id.
   */
  export const scrollToElementById = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };
  