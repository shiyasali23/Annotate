import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BiochemicalsBarGraph = ({ biochemicalsArray, isHyper, isHealthy }) => {
  if (!biochemicalsArray || biochemicalsArray.length === 0) {
    return null;
  }

  // Set the appropriate title based on the parameters
  let graphTitle = "Minimum Range <= Normal Biochemicals => Maximum Range";
  if (!isHealthy) {
    graphTitle = isHyper ? "Hyper Biochemicals" : "Hypo Biochemicals";
  }

  // Determine if we should use horizontal bars:
  // For healthy or when isHyper is null, we use horizontal bars.
  const isHorizontal = isHealthy || isHyper === null;

  // Prepare data for the chart
  const labels = biochemicalsArray.map((item) => item.name);
  const values = biochemicalsArray.map((item) => {
    // For hypo values, make them negative to face downward if they aren't already
    if (!isHealthy && !isHyper && item.scaled_value > 0) {
      return -item.scaled_value;
    }
    return item.scaled_value;
  });

  // Determine bar color based on status
  const barColor = isHealthy
    ? "rgba(75, 192, 75, 0.8)"
    : "rgba(255, 99, 132, 0.8)";

  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: barColor,
        borderColor: isHealthy
          ? "rgba(75, 192, 75, 1)"
          : "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        barPercentage: isHorizontal ? 0.5 : 0.3,
        categoryPercentage: isHorizontal ? 0.7 : 0.6,
        barThickness: isHorizontal ? 5 : undefined,
      },
    ],
  };

  // Configuration options with:
  // - Hidden numeric (scaled) tick labels on the appropriate axis.
  // - All vertical grid lines removed (x-axis grid disabled).
  const options = {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        position: !isHealthy && !isHyper ? 'top' : 'bottom',
        beginAtZero: true,
        display: true,
        grid: {
          display: false, // Hides all vertical grid lines
        },
        ticks: {
          // For horizontal charts, the x-axis is numeric so hide its ticks.
          // For vertical charts, the x-axis shows categories so display them.
          display: isHorizontal ? false : true,
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 7,
          },
        },
        border: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        display: true,
        grid: {
          // For horizontal charts, the y-axis grid lines (horizontal lines) remain.
          // For vertical charts, they are horizontal grid lines.
          display: true,
          color: "#e0e0e0",
          drawBorder: false,
        },
        ticks: {
          // For vertical charts, the y-axis is numeric so hide its ticks.
          // For horizontal charts, the y-axis shows categories so display them.
          display: isHorizontal ? true : false,
          autoSkip: false,
          color: "#333",
          font: {
            size: 7,
          },
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            return label.length > 15 ? label.substr(0, 15) + '...' : label;
          }
        },
        border: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const biochemical = biochemicalsArray[index];
            let label = ` ${biochemical.value} ${biochemical.unit}`;
            if (!isHealthy) {
              if (isHyper) {
                label += ` (Max Healthy: ${biochemical.healthy_max})`;
              } else {
                label += ` (Min Healthy: ${biochemical.healthy_min})`;
              }
            }
            return label;
          },
        },
      },
      title: {
        display: true,
        text: graphTitle,
        font: {
          size: 12,
          weight: "bold",
        },
      },
    },
  };

  return (
    <div className={`${isHorizontal ? "h-[75vh] " : "h-[40vh] "} xl:h-full w-full shadow-[0_0_8px_2px_rgba(0,0,0,0.05)] rounded`}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BiochemicalsBarGraph;
