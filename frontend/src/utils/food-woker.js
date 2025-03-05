export const processFoodNutrients = (foodNutrients) => {
    if (foodNutrients.length === 0) return null;
      const processedData = {};
      foodNutrients.forEach(item => {
      const { food, nutriscore, nutrient, value, unit } = item;
        if (!processedData[food]) {
        processedData[food] = {
          NutriScore: nutriscore,  
        };
      }
        processedData[food][nutrient] = { value, unit };
    });
  
    return Object.entries(processedData).map(([food, nutrients]) => {
      return { [food]: nutrients };
    });
  };
