import React from "react";
import { useUser } from "@/contexts/userContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  SubTitle,
} from "chart.js";
import ErrorComponent from "./ErrorComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  SubTitle
);

const HealthScoreGraph = ({ handleBiometricEntry }) => {
  const {  healthScore } = useUser();
  if (!healthScore) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date
      .getFullYear()
      .toString()
      .slice(2)}`;
  };

  const data = {
    labels: healthScore.map((item) => formatDate(item.created_at)),
    datasets: [
      {
        label: "Biometrics Entries",
        data: healthScore.map((item) => item.health_score),
        borderColor: "#006A71",
        backgroundColor: "rgba(0, 106, 113, 0.1)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#006A71",
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      title: {
        display: true,
        text: "Biometrics Entries",
        font: {
          size: 17,
          weight: "bold",
          letterSpacing: 1.5,
        },
        color: "#333333",
        padding: {
          top: 10,
        },
      },
      subtitle: {
        display: true,
        text: "*(Click on the dates)",
        font: {
          size: 10,
          weight: "bold",
        },
        color: "rgba(51, 51, 51, 0.84)",
        padding: {
          top: 10,
        },
      },
      legend: { display: false },
    },
    scales: {
      x: {
        offset: true,
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: false, drawBorder: false },
        ticks: { display: false },
        afterDataLimits: (scale) => {
          if (scale.min > 0) scale.min = 0;
          if (scale.max < 0) scale.max = 0;
          const range = scale.max - scale.min;
          scale.min -= range * 0.1;
          scale.max += range * 0.1;
        },
      },
    },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
    elements: { line: { borderJoinStyle: "round" } },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const { index } = elements[0];
        const createdAt = healthScore[index].created_at;
        handleBiometricEntry(createdAt);
      }
    },
  };

  return (
    <div className="w-[97vw] xl:w-[85vw] m-auto h-[40vh] xl:h-[50vh] mt-5 bg-[#ECF4F3] shadow-[0_0_8px_2px_rgba(0,0,0,0.05)]">
      {!healthScore ? (
        <ErrorComponent/>
      ) : (
        <div className="w-full h-full">
          <Line
            data={data}
            options={options}
            plugins={[
              {
                id: "zeroLine",
                afterDatasetsDraw: (chart) => {
                  const { ctx, chartArea, scales } = chart;
                  if (!chartArea) return;
                  const zeroY = scales.y.getPixelForValue(0);
                  if (zeroY >= chartArea.top && zeroY <= chartArea.bottom) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(0, 105, 113, 0.49)";
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([]);
                    ctx.moveTo(chartArea.left, zeroY);
                    ctx.lineTo(chartArea.right, zeroY);
                    ctx.stroke();
                    ctx.restore();
                  }
                },
              },
              {
                id: "customBackground",
                beforeDraw: (chart) => {
                  const { ctx, chartArea } = chart;
                  if (!chartArea) return;
                  ctx.save();
                  ctx.fillStyle = "#ECF4F3";
                  ctx.fillRect(0, 0, chart.width, chart.height);
                  ctx.restore();
                },
              },
              {
                id: "dateLabels",
                afterDatasetsDraw: (chart) => {
                  const { ctx, data, scales } = chart;
                  ctx.save();
                  ctx.font = "bold 12px 'Inter', sans-serif";
                  ctx.fillStyle = "#333333";
                  ctx.textAlign = "center";
                  data.datasets[0].data.forEach((datapoint, index) => {
                    const xPos = scales.x.getPixelForValue(index);
                    const yPos = scales.y.getPixelForValue(datapoint);
                    const chartMiddle = (scales.y.top + scales.y.bottom) / 2;
                    const isAboveMiddle = yPos < chartMiddle;
                    const labelYPos = isAboveMiddle ? yPos + 35 : yPos - 35;
                    const label = data.labels[index];
                    ctx.font = "bold 9px 'Inter', sans-serif";
                    ctx.fillText(label, xPos, labelYPos);
                    ctx.beginPath();
                    ctx.strokeStyle = "#006A71";
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(xPos, yPos + (isAboveMiddle ? 4 : -4));
                    ctx.lineTo(xPos, labelYPos + (isAboveMiddle ? -4 : 4));
                    ctx.stroke();
                  });
                  ctx.restore();
                },
              },
              {
                id: "clickablePoints",
                afterDatasetsDraw: (chart) => {
                  const { ctx, data, scales } = chart;
                  ctx.save();

                  // Create larger invisible hit areas around each point
                  data.datasets[0].data.forEach((datapoint, index) => {
                    const xPos = scales.x.getPixelForValue(index);
                    const yPos = scales.y.getPixelForValue(datapoint);

                    // Add cursor style to make points appear clickable
                    chart.canvas.style.cursor = "pointer";

                    // Store data point positions for click detection
                    if (!chart.clickableAreas) chart.clickableAreas = [];
                    chart.clickableAreas[index] = {
                      x: xPos,
                      y: yPos,
                      radius: 15, // Larger than visible point for easier clicking
                      dataIndex: index,
                    };
                  });

                  ctx.restore();
                },
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default HealthScoreGraph;
