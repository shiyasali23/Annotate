import React, { useState, useEffect } from "react";
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
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register Chart.js components along with ChartDataLabels
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const FoodNutrientBarGraph = ({ selectedData, isItemFood }) => {
  const itemName = Object.keys(selectedData)[0] || "";
  const itemData = selectedData[itemName] || {};
  const associations = itemData.associations || {};

  const unit = Object.values(associations)[0]?.unit || "";

  const categories = Object.values(associations)
    .filter((value) => value.category)
    .map((value) => value.category)
    .filter((value, index, self) => self.indexOf(value) === index);

  const [dataKey, setDataKey] = useState(JSON.stringify(selectedData));
  const [activeCategory, setActiveCategory] = useState(categories[0] || "");

  useEffect(() => {
    const newDataKey = JSON.stringify(selectedData);
    if (newDataKey !== dataKey) {
      setDataKey(newDataKey);
      if (categories.length > 0) {
        setActiveCategory(categories[0]);
      }
    }
  }, [selectedData, categories, dataKey]);

  if (!itemName || categories.length === 0) {
    return null;
  }

  const items = Object.entries(associations)
    .filter(([_, data]) => data.category === activeCategory && data.value !== undefined)
    .map(([name, data]) => ({
      name,
      value: data.value,
    }));

  // Calculate the maximum value from the data to adjust x-axis scale.
  const maxDataValue = Math.max(...items.map((item) => item.value));

  const chartData = {
    labels: items.map((item) => item.name),
    datasets: [
      {
        label: "",
        data: items.map((item) => item.value),
        backgroundColor: "#006A71",
        borderColor: "white",
        borderWidth: 1,
      },
    ],
  };

  const chartTitle = `${isItemFood ? "100 Grams" : ""} ${itemName}`;

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        beginAtZero: true,
        grid: { display: false },
        // Extend x-axis range by 10% so data labels at the tip are visible.
        suggestedMax: maxDataValue * 1.1,
      },
      y: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: chartTitle,
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw} ${unit}`;
          },
        },
      },
      // Data labels configuration remains as before.
      datalabels: {
        anchor: "end",
        align: "right",
        offset: 4,
        clip: false,
        formatter: (value) => `${value} ${unit}`,
        font: {
          weight: "bold",
        },
        color: "gray",
      },
    },
  };

  // Handler for category selection
  const handleCategorySelect = (category) => {
    setActiveCategory(category);
  };

  return (
    <div className="bg-[#ECF4F3] w-full flex flex-col gap-2 p-4 h-full">
      {/* Category selection buttons */}
      {categories.length > 0 && (
        <div className="py-2 px-4 flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-4 py-2 text-xs rounded-full font-medium ${
                activeCategory === category
                  ? "bg-[#006A71] text-white font-medium"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <div className="relative w-full h-full">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default FoodNutrientBarGraph;
