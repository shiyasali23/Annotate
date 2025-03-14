import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';
import { Bar } from 'react-chartjs-2';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, SubTitle);



const FoodPredictionsBarGraph = ({ predictedFoodsData, isNutriScore, handleSelectedItem }) => {
  if (!predictedFoodsData || predictedFoodsData.length === 0) {
    return <div className="w-full h-full p-2 flex items-center justify-center">No data available</div>;
  }
  
  const chartTitle = isNutriScore ? 'Nutriscore' : 'Reccomendation';
  
  const barColor = '#001D3D';
  const barBorderColor = '#001D3D';
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false
        },
        ticks: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        callbacks: {
          title: (tooltipItems) => tooltipItems[0].label,
          label: (context) => context.raw.toFixed(2)
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
        data: predictedFoodsData.map(food => food.score),
        backgroundColor: barColor,
        borderColor: barBorderColor,
        borderWidth: 1,
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
