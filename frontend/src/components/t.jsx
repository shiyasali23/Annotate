import React from "react";

const FoodList = ({ foodsData }) => {
  const categorizedFoods = foodsData.reduce(
    (acc, { category, subCategory, name }) => {
      acc[category] ??= {};
      acc[category][subCategory] ??= [];
      acc[category][subCategory].push(name);
      return acc;
    },
    {}
  );

  return (
    <ol className="px-1 mt-2 flex flex-col gap-2">
      {Object.entries(categorizedFoods).map(([category, subCategories]) => (
        <li key={category} className="font-bold text-md capitalize text-center">
          {category}
          <ol className="list-disc pl-6 flex flex-col gap-1">
            {Object.entries(subCategories).map(([subCategory, foods]) => (
              <li key={subCategory} className="font-semibold text-sm">
                {subCategory}
                <ul className="list-inside list-circle pl-3 flex flex-col gap-1 mt-1">
                  {foods.map((food) => (
                    <li key={food} className="border text-xs px-3 py-1 text-center">
                      {food}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
};

export default FoodList;
