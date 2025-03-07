import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const BiochemicalLineGraph = ({ biochemical, name }) => {
  if (!biochemical || !biochemical.entries || biochemical.entries.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center border">No data available</div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const sortedEntries = [...biochemical.entries].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  const middleValue = (biochemical.healthy_min + biochemical.healthy_max) / 2;
  const dataMin = Math.min(...sortedEntries.map((e) => e.value));
  const dataMax = Math.max(...sortedEntries.map((e) => e.value));
  
  const range =
    Math.max(
      Math.abs(dataMax - middleValue),
      Math.abs(middleValue - dataMin),
      (biochemical.healthy_max - biochemical.healthy_min) * 0.75
    ) * 1.5;

  const yMin = Math.max(0, middleValue - range);
  const yMax = middleValue + range;

  const data = {
    labels: sortedEntries.map((entry) => formatDate(entry.createdAt)),
    datasets: [
      {
        label: name,
        data: sortedEntries.map((entry) => entry.value),
        borderColor: "#006D77",
        backgroundColor: "#006D77",
        tension: 0.3,
        pointBackgroundColor: sortedEntries.map((entry) =>
          entry.isHyper === null ? "#006D77" : "#FF6B6B"
        ),
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const horizontalLinePlugin = {
    id: "horizontalLinePlugin",
    beforeDatasetsDraw: (chart, args, options) => {
      const {
        ctx,
        chartArea: { left, right },
        scales: { y },
      } = chart;
      const yHealthyMax = y.getPixelForValue(biochemical.healthy_max);
      const yHealthyMin = y.getPixelForValue(biochemical.healthy_min);
      ctx.save();
      ctx.strokeStyle = options.lineColor || "darkgrey";
      ctx.lineWidth = options.lineWidth || 2;
      ctx.setLineDash(options.lineDash || [5, 5]);
      ctx.beginPath();
      ctx.moveTo(left, yHealthyMax);
      ctx.lineTo(right, yHealthyMax);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(left, yHealthyMin);
      ctx.lineTo(right, yHealthyMin);
      ctx.stroke();
      ctx.restore();
    },
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `${name}: ${(sortedEntries[sortedEntries.length - 1]?.value ?? 'N/A').toFixed(2)} ${biochemical.unit} (${biochemical.healthy_min.toFixed(2)}-${biochemical.healthy_max.toFixed(2)}) `,
        font: {
          size: 13,
          letterSpacing: 2,
        },
        color: "#052C3B",
        padding: {
          top: 10,
        },
      },
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const entry = sortedEntries[context.dataIndex];
            let label = `${name}: ${entry.value.toFixed(2)} ${biochemical.unit}`;
            if (entry.isHyper === true) {
              label += " (Hyper)";
            } else if (entry.isHyper === false) {
              label += " (Hypo)";
            } else if (entry.value < biochemical.healthy_min) {
              label += " (Below optimum)";
            } else if (entry.value > biochemical.healthy_max) {
              label += " (Above optimum)";
            } else {
              label += " (Optimum range)";
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: yMin,
        max: yMax,
        title: {
          display: false,
        },
        ticks: {
          callback: function (value) {
            return value.toFixed(2);
          },
        },
        grid: {
          display: false,
        },
      },
      x: {
        title: {
          display: false,
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="w-[450px] xl:w-[600px] p-4 w-full border border-dashed shadow-[0_0_8px_2px_rgba(0,0,0,0.03)]">
      <div className="h-[300px] bg-[#F3F3F3] p-2">
        <Line data={data} options={options} plugins={[horizontalLinePlugin]} />
      </div>
      <div className="my-2 flex justify-evenly">
        <h1 className="text-xs font-semibold text-gray-500">
          Last Updated:- {new Date(biochemical.lastUpdated).toLocaleDateString()}
        </h1>
        <h1 className="text-xs font-semibold text-gray-500">
          Expiry On:- {new Date(biochemical.expiryOn).toLocaleDateString()}
          {new Date(biochemical.expiryOn) < new Date() && (
            <span className="text-red-500 ml-2 text-xs">(Expired)</span>
          )}
        </h1>
      </div>
    </div>
  );
};

export default BiochemicalLineGraph;