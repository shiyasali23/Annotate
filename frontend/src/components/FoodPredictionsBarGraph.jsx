import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, SubTitle } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register only the components we need
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, SubTitle);

const FoodPredictionsBarGraph = ({ predictedFoodsData, isNutriScore, handleSelectedItem }) => {
  if (!predictedFoodsData || predictedFoodsData.length === 0) {
    return <div className="w-full h-full p-2 flex items-center justify-center">No data available</div>;
  }
  
  // Determine the score property to use based on isNutriScore
  const scoreProperty = isNutriScore ? 'nutriScore' : 'foodScore';
  const chartTitle = isNutriScore ? 'Nutriscore' : 'Foodscore';
  
  // Handle case where foodScore might not exist but nutriScore does
  const actualScoreProperty = predictedFoodsData[0][scoreProperty] !== undefined ? 
    scoreProperty : 'nutriScore';
  
  // Unified color for all bars
  const barColor = '#272B4D';
  const barBorderColor = '#272B4D';
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        grid: {
          display: false
        },
        ticks: {
          callback: (value) => value.toFixed(1)
        },
        title: {
          display: false
        },
        borderWidth: 3
      },
      x: {
        grid: {
          display: false
        },
        borderWidth: 5
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (tooltipItems) => {
            return tooltipItems[0].label;
          },
          label: (context) => {
            return context.raw.toFixed(2);
          }
        }
      },
      title: {
        display: true,
        text: `Detected Food's ${chartTitle}`,
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          top: 10,
          bottom: 5
        }
      },
      subtitle: {
        display: true,
        text: '*(Click on the bars)',
        font: {
          size: 10,
          weight: 'bold'
        },
        padding: {
          bottom: 10
        }
      }
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        const foodName = predictedFoodsData[index].name;
        handleSelectedItem(foodName, true);
      }
    },
    onHover: (event, elements) => {
      event.native.target.style.cursor = elements.length > 0 ? 'pointer' : 'default';
    }
  };
  
  const data = {
    labels: predictedFoodsData.map(food => food.name),
    datasets: [
      {
        data: predictedFoodsData.map(food => food[actualScoreProperty]),
        backgroundColor: barColor,
        borderColor: barBorderColor,
        borderWidth: 1,
        borderRadius: 0,
        hoverBackgroundColor: barBorderColor
      }
    ]
  };
  
  return (
    <div className="h-full p-2 bg-[#FAF7E9]">
      <Bar options={options} data={data} />
    </div>
  );
};

export default FoodPredictionsBarGraph;