// utils/food-utils.js

/**
 * Maps detected foods (all lowercase) to the original values from foodNutriscoreData.
 * If a match is found, the original value (with its case) is returned.
 */
export const mapDetectedFoods = (detectedFoods, dataset, scoreKey) => {
  const mappedPredictedFoods = detectedFoods
    .map((detected) => {
      const food = dataset.find((item) => item.name.toLowerCase() === detected.toLowerCase());
      return food ? { name: food.name, score: food[scoreKey] } : null;
    })
    .filter(Boolean); // Remove null values

  if (mappedPredictedFoods.length === 0) {
    return { mappedPredictedFoods: null, maxFood: null };
  }

  // Find the food with the highest score based on scoreKey
  const maxFood = mappedPredictedFoods.reduce((max, food) =>
    food.score > max.score ? food : max
  ).name;

  return { mappedPredictedFoods, maxFood };
}

  /**
   * Scrolls smoothly to the element with the given id.
   */
  export const scrollToElementById = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };
  