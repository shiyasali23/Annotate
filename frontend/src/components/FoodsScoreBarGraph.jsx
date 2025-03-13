import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

// Custom plugin for fixed container borders with improved positioning
const containerPlugin = {
  id: "containerPlugin",
  beforeDatasetsDraw: (chart, args, options) => {
    const { ctx } = chart;
    const xScale = chart.scales.x;
    const meta = chart.getDatasetMeta(0);

    meta.data.forEach((bar) => {
      const barHeight = bar.height;
      const barTop = bar.y - barHeight / 2;
      const xStart = xScale.getPixelForValue(0);
      const xEnd = xScale.getPixelForValue(options.globalMax);

      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.strokeRect(xStart, barTop, xEnd - xStart, barHeight);
      ctx.restore();
    });
  }
};

// Ensure consistent bar heights and spacing
const calculateBarThickness = (numItems) => {
  // Improved thickness calculation to prevent bars from overflowing
  return Math.min(0.8, Math.max(0.3, 3 / numItems));
};

const FoodsScoreBarGraph = ({ data, handleSelectedItem }) => {
  const processData = (inputData) => {
    return Array.isArray(inputData) ? inputData : [];
  };

  if (!data) {
    return <div>No data available</div>;
  }

  const processedData = processData(data);
  const globalMaxValue = Math.max(
    ...processedData.map((item) => parseFloat(item.value) || 0),
    1
  );

  const createCategories = (items) => {
    const categories = {};
    items.forEach((item) => {
      const categoryName = item.category || "Other";
      if (!categories[categoryName]) {
        categories[categoryName] = [];
      }
      categories[categoryName].push({
        name: item.name,
        value: parseFloat(item.value) || 0
      });
    });
    return categories;
  };

  const categorizedData = createCategories(processedData);
  const categoryNames = Object.keys(categorizedData).sort();
  const [activeCategory, setActiveCategory] = useState(categoryNames[0] || "");

  useEffect(() => {
    if (categoryNames.length > 0 && !categoryNames.includes(activeCategory)) {
      setActiveCategory(categoryNames[0]);
    }
  }, [data, categoryNames, activeCategory]);

  const activeItems = categorizedData[activeCategory] || [];
  const barThickness = calculateBarThickness(activeItems.length);

  // Prepare data for the current category
  const chartData = {
    labels: activeItems.map((item) => item.name),
    datasets: [
      {
        label: "Score",
        data: activeItems.map((item) => item.value),
        backgroundColor: "#3D3D3D",
        borderWidth: 0,
        borderSkipped: false,
        barThickness: "flex"
      }
    ]
  };

  const chartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "nearest",
      intersect: false
    },
    layout: {
      padding: {
        top: 30
      }
    },
    scales: {
      x: {
        min: 0,
        max: globalMaxValue,
        grid: {
          display: false
        },
        ticks: {
          display: false
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        offset: true,
        ticks: {
          font: {
            size: 12
          }
        }
      }
    },
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Recommended Foods",
        padding: {
          bottom: 10
        },
        font: {
          size: 16,

        }
      },
      datalabels: { display: false },
      containerPlugin: {
        globalMax: globalMaxValue,
        borderColor: "#666666",
        borderWidth: 1.5
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function (context) {
            return `Score: ${context.parsed.x}`;
          }
        }
      },
      subtitle: {
        display: true,
        text: "*(Click on the bars)",
        font: {
          size: 10,
          weight: "bold"
        },
        padding: {
          bottom: 10
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        // Use activeItems to get the correct food name
        const foodName = activeItems[index].name;
        handleSelectedItem(foodName, true);
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? "pointer" : "default";
    },
    elements: {
      bar: {
        borderSkipped: false,
        categoryPercentage: 0.85,
        barPercentage: 0.95
      }
    }
  };

  return (
    <div className=" bg-[#F3F3F3] w-full flex flex-col  p-4  h-full overflow-hidden">
      {categoryNames.length > 0 && (
        <div className="p-1 flex flex-wrap justify-center gap-2">
          {categoryNames.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1 text-xs font-medium rounded-full border-none cursor-pointer transition-colors ${
                activeCategory === category
                  ? "bg-[#3D3D3D] text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      <div className="w-full h-full">
        <Bar data={chartData} options={chartOptions} plugins={[containerPlugin]} />
      </div>
    </div>
  );
};

export default FoodsScoreBarGraph;
