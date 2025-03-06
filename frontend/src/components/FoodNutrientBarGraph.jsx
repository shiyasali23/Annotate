import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const FoodNutrientBarGraph = ({ selectedData }) => {
  // Extract the nutrient name (first key in the object)
  const nutrientName = Object.keys(selectedData)[0] || "";
  const nutrientData = selectedData[nutrientName] || {};

  // Get unit and categories directly from the data
  const unit = nutrientData.unit || "";

  // Extract unique categories from the data
  const categories = Object.entries(nutrientData)
    .filter(([key, value]) => typeof value === "object" && value.category)
    .map(([_, value]) => value.category)
    .filter((value, index, self) => self.indexOf(value) === index);

  // State for active category
  const [activeCategory, setActiveCategory] = useState(categories[0] || "");

  // If no data or categories, return null
  if (!nutrientName || categories.length === 0) {
    return null;
  }

  // Group foods by subcategory for the active category
  const foodsBySubcategory = {};
  Object.entries(nutrientData).forEach(([foodName, foodData]) => {
    if (
      typeof foodData === "object" &&
      foodData.category === activeCategory &&
      foodData.value !== undefined
    ) {
      const subcategory = foodData.subcategory || "Other";

      if (!foodsBySubcategory[subcategory]) {
        foodsBySubcategory[subcategory] = [];
      }

      foodsBySubcategory[subcategory].push({
        name: foodName,
        value: foodData.value,
      });
    }
  });

  // Prepare chart data
  const allLabels = [];

  // Collect all food names across subcategories
  Object.values(foodsBySubcategory).forEach((foods) => {
    foods.forEach((food) => {
      if (!allLabels.includes(food.name)) {
        allLabels.push(food.name);
      }
    });
  });

  // Sort labels alphabetically for consistency
  allLabels.sort();

  // Create datasets for each subcategory
  const datasets = Object.entries(foodsBySubcategory).map(
    ([subcategory, foods], index) => {
      // Create a color for this subcategory
      const hue = (index * 50) % 360;

      // Create data array matching the full labels array
      const dataArray = allLabels.map((label) => {
        const food = foods.find((f) => f.name === label);
        return food ? food.value : null;
      });

      return {
        label: subcategory,
        data: dataArray,
        backgroundColor: `hsla(${hue}, 70%, 60%, 0.8)`,
        borderColor: `hsla(${hue}, 70%, 50%, 1)`,
        borderWidth: 1,
      };
    }
  );

  const chartData = {
    labels: allLabels,
    datasets: datasets,
  };

  const options = {
    indexAxis: "y", // Make the bar chart horizontal/vertical (food items on y-axis)
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: {
          display: false, // Remove grid lines
        },
        title: {
          display: true,
          text: unit, // Only show the unit
        },
      },
      y: {
        grid: {
          display: false, // Remove grid lines
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `${nutrientName} in ${activeCategory} in 100 grams`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 10
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            if (value === null) return `${context.dataset.label}: N/A`;
            return `${context.dataset.label}: ${value} ${unit}`;
          },
        },
      },
    },
  };

  return (
    <div className="border w-full h-full flex flex-col gap-2">
      {categories.length > 0 && (
        <div className="py-2 px-4 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-sm rounded ${
                activeCategory === category
                  ? "bg-blue-500 text-white font-medium"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      <div className="flex-grow p-2">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default FoodNutrientBarGraph;