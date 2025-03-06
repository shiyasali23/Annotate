export const processFoodNutrients = (rawData) => {
  // Handle null or empty data case
  if (!rawData || rawData.length === 0) {
    return {
      foodNutrients: null,
      nutrientsFoods: null,
      foodsData: null,
      nutrientsData: null,
      foodsNameArray: null,
    };
  }

  // Helper maps and sets
  const foodNutrientsMap = {};
  const nutrientsFoodsMap = {};
  const foodsDataSet = new Set();
  const nutrientsDataSet = new Set();
  const foodsNameSet = new Set();

  // Single pass over the raw data
  for (const entry of rawData) {
    const { food, nutrient, value } = entry;
    const foodName = food.name;
    const nutrientName = nutrient.name;
    const category = food.category;
    const subCategory = food.subcategory;
    const nutrientCategory = nutrient.nutrient_category;

    // Record unique food names
    foodsNameSet.add(foodName);

    // Store foodsData in the required format
    foodsDataSet.add(JSON.stringify({ name: foodName, category, subCategory }));

    // Store nutrientsData in the required format
    nutrientsDataSet.add(JSON.stringify({ name: nutrientName, category: nutrientCategory }));

    // Update foodNutrientsMap for the given food
    if (!foodNutrientsMap[foodName]) {
      foodNutrientsMap[foodName] = {
        nutriScore: food.nutriscore,
        category,
        subCategory,
      };
    }
    // Set nutrient data for the food
    foodNutrientsMap[foodName][nutrientName] = {
      value,
      unit: nutrient.unit,
      category: nutrientCategory,
    };

    // Update nutrientsFoodsMap for the given nutrient
    if (!nutrientsFoodsMap[nutrientName]) {
      nutrientsFoodsMap[nutrientName] = {
        category: nutrientCategory,
        unit: nutrient.unit,
      };
    }
    // Set food details for this nutrient
    nutrientsFoodsMap[nutrientName][foodName] = {
      value,
      category,
      subcategory: subCategory,
    };
  }

  // Convert maps to arrays as specified in the desired output structure

  // foodNutrients: array of objects keyed by food name
  const foodNutrientsArray = Object.entries(foodNutrientsMap).map(
    ([foodName, data]) => ({ [foodName]: data })
  );

  // nutrientsFoods: array of objects keyed by nutrient name
  const nutrientsFoodsArray = Object.entries(nutrientsFoodsMap).map(
    ([nutrientName, data]) => ({ [nutrientName]: data })
  );

  // Convert Sets to arrays and parse JSON back to objects
  const foodsDataArray = Array.from(foodsDataSet).map(JSON.parse);
  const nutrientsDataArray = Array.from(nutrientsDataSet).map(JSON.parse);

  // Convert the Set of food names to an array
  const foodsNameArray = Array.from(foodsNameSet);

  return {
    foodNutrients: foodNutrientsArray,
    nutrientsFoods: nutrientsFoodsArray,
    foodsData: foodsDataArray,
    nutrientsData: nutrientsDataArray,
    foodsNameArray,
  };
};






// const resposne = [
//   {
//     "food": {
//         "name": "Strawberry",
//         "category": "fruit",
//         "subcategory": "Berries",
//         "nutriscore": 0.9
//     },
//     "nutrient": {
//         "name": "Carbohydrates",
//         "nutrient_category": "Macronutrients",
//         "unit": "g"
//     },
//     "value": 7.7
// },
// {
//   "food": {
//       "name": "Strawberry",
//       "category": "fruit",
//       "subcategory": "Berries",
//       "nutriscore": 0.9
//   },
//   "nutrient": {
//       "name": "Proteins",
//       "nutrient_category": "Macronutrients",
//       "unit": "g"
//   },
//   "value": 0.7
// },
// {
//   "food": {
//       "name": "Mackerel",
//       "category": "seafood",
//       "subcategory": "Oily Fishs",
//       "nutriscore": 0.8
//   },
//   "nutrient": {
//       "name": "Vitamin E",
//       "nutrient_category": "Vitamins",
//       "unit": "mg"
//   },
//   "value": 2.0
// },
// {
//   "food": {
//       "name": "Mackerel",
//       "category": "seafood",
//       "subcategory": "Oily Fishs",
//       "nutriscore": 0.8
//   },
//   "nutrient": {
//       "name": "Vitamin K",
//       "nutrient_category": "Vitamins",
//       "unit": "µg"
//   },
//   "value": 0.0
// },
// ]


// foodNutrients = [
//   {
//     "Strawberry": {
//       "nutriScore": 0.9,
//       "category": "fruit",
//       "subCategory": "Berries",
//       "Carbohydrates": { "value": 7.7, "unit": "g", "category": "Macronutrients" },
//       "Proteins": { "value": 0.7, "unit": "mg", "category": "Macronutrients" },
//       "Glycine": { "value": 0.2, "unit": "g", "category": "Amino Acids" }
//     }
//   },
//   {
//     "Apple": {
//       "nutriScore": 0.8,
//       "category": "fruit",
//       "subCategory": "Pome Fruits",
//       "Carbohydrates": { "value": 10.0, "unit": "g", "category": "Macronutrients"},
//       "Proteins": { "value": 0.5, "unit": "mg", "category": "Macronutrients"},
//       "Glycine": { "value": 0.2, "unit": "g", "category": "Amino Acids" }
//     }
//   }
// ]
 
// nutrientsFoods = [
//   {
//     "Carbohydrates":{
//       "category": "Macronutrients",
//       "unit":"g",
//       "sortedFoods":[i need a list of foods that is sorted for this nutrient from maximum to minium],
//       "Apple":{"value":10.0, "category":"fruit", "subcategory":"Pome Fruits"},
//       "Onion":{"value":7.7,"category":"vegetable", "subcategory":"Rooted vegetables"},
//     }
//   },
//   "Glycine":{
//     "category": "Amino Acids"
//     "unit":"g", 
//     "sortedFoods":[i need a list of foods that is sorted for this nutrient from maximum to minium],
//     "Apple":{"value":80.0,"category":"fruit", "subcategory":"Pome Fruits"},
//     "Onion":{"value":5.7"category":"vegetable", "subcategory":"Rooted vegetables"},
//   },
//   "Proteins":{
//     "category": "Macronutrients",
//     "unit":"g", 
//     "sortedFoods":[i need a list of foods that is sorted for this nutrient from maximum to minium],
//     "Apple":{"value":50.0,"category":"fruit", "subcategory":"Pome Fruits"},
//     "Onion":{"value":7.7"category":"vegetable", "subcategory":"Rooted vegetables"},
//   }
// ]

// foodsData = [
//   {
//     "fruits":{
//       "Pome fruits":[all foods in this subcategory],
//       "berrys":[all foods in this subcategory]
//     },
//     {
//       "vegetables":{
//         "rooted vegatables":[all foods in this subcategory],
//         ..............
//       }
//     }
//   }
// ]

// const nutrientsData = [
//   {
//     "Carbohydrates":[
//       i need to list all the nutrients in this category
//     ],
//     "amino acids":[i need to list all the nutrients in this category]
//   },
//   .....
// ]

// const foodsNameArray = ["Apple", "Strawberry", "Onion" ...]