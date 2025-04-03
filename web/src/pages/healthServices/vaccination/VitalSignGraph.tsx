import React from "react";
import ReactECharts from "echarts-for-react";

function VitalSignsChart() {
  const options = {
    title: {
      text: "Vital Signs History",
    },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: [
        "Heart Rate (bpm)",
        "Blood Pressure (mmHg)",
        "Oxygen Saturation (%)",
      ],
    },
    xAxis: {
      type: "category",
      data: ["2024-02-20", "2024-02-21", "2024-02-22", "2024-02-23"], // Fixed dates
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        name: "Heart Rate (bpm)",
        type: "line",
        data: [75, 78, 80, 76], // Fixed heart rate values
      },
      {
        name: "Blood Pressure (mmHg)",
        type: "line",
        data: [120, 122, 125, 118], // Fixed blood pressure values
      },
      {
        name: "Oxygen Saturation (%)",
        type: "line",
        data: [98, 97, 96, 98], // Fixed oxygen saturation values
      },
    ],
  };

  return (
    <ReactECharts option={options} style={{ height: 400, width: "100%" }} />
  );
}

export default VitalSignsChart;
