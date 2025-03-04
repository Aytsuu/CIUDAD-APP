import React from 'react'
import ReactECharts from "echarts-for-react";
import {
  FaBaby,
  FaChild,
  FaUser,
  FaUserTie,} from "react-icons/fa";
  
const ProfilingDashboard = () => {
    // Sample data for the graph
    const generateData = () => {
      const data = [];
      for (let i = 0; i < 1000; i++) {
        data.push({
          date: new Date(2024, 0, i + 1).toISOString().split("T")[0],
          Child: Math.floor(Math.random() * 1000 + 1000),
          Youth: Math.floor(Math.random() * 1500 + 1500),
          Adult: Math.floor(Math.random() * 2000 + 2000),
          Senior: Math.floor(Math.random() * 800 + 700),
        });
      }
      return data;
    };
  
    const data = generateData();
  
    const option = {
      title: {
        text: "Demographics Trends",
        left: "center",
        top: 0,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          label: {
            backgroundColor: "#6a7985",
          },
        },
      },
      legend: {
        data: ["Child", "Youth", "Adult", "Senior"],
        top: "30px",
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: "none",
          },
          restore: {},
          saveAsImage: {},
          dataView: {},
        },
        right: "20px",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: [
        {
          type: "category",
          boundaryGap: false,
          data: data.map((item) => item.date),
          axisLabel: {
            rotate: 45,
          },
        },
      ],
      yAxis: [
        {
          type: "value",
          name: "Number of People",
        },
      ],
      dataZoom: [
        {
          type: "inside",
          start: 0,
          end: 10,
        },
        {
          start: 0,
          end: 10,
        },
      ],
      series: [
        {
          name: "Child",
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          showSymbol: false,
          data: data.map((item) => item.Child),
          color: "#3B82F6",
        },
        {
          name: "Youth",
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          showSymbol: false,
          data: data.map((item) => item.Youth),
          color: "#10B981",
        },
        {
          name: "Adult",
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          showSymbol: false,
          data: data.map((item) => item.Adult),
          color: "#8B5CF6",
        },
        {
          name: "Senior",
          type: "line",
          stack: "Total",
          areaStyle: {},
          emphasis: {
            focus: "series",
          },
          showSymbol: false,
          data: data.map((item) => item.Senior),
          color: "#F59E0B",
        },
      ],
    };
  
    const recentActivity = [
      {
        name: "Paolo Araneta",
        status: "Registered",
        time: "3 minutes ago",
      },
    ];
  return (
    <div> {/* <div className="flex w-full space-x-8 h-32">
       
        <div className="w-1/4 h-full rounded-lg shadow-md p-6 bg-gradient-to-tr from-blue-200 to-white flex items-center justify-center gap-6">
          <FaBaby className="text-blue-500 w-24 h-24" />
          <div className="flex flex-col items-center">
            <h3 className="text-gray-900 text-xl font-bold tracking-tight">
              Child
            </h3>
            <p className="text-gray-500 text-sm font-medium mt-1">
              0-12 yrs old
            </p>
            <p className="text-blue-600 text-2xl font-bold mt-2">1,200</p>
          </div>
        </div>

        <div className="w-1/4 h-full rounded-lg shadow-md p-6 bg-gradient-to-tr from-green-200 to-white flex items-center justify-center gap-6">
          <FaChild className="text-green-500 w-24 h-24 items-center" />
          <div className="flex flex-col items-center">
            <h3 className="text-gray-900 text-xl font-bold tracking-tight">
              Youth
            </h3>
            <p className="text-gray-500 text-sm font-medium mt-1">
              12 - 18 yrs old
            </p>
            <p className="text-blue-600 text-2xl font-bold mt-2">1,200</p>
          </div>
        </div>

        <div className="w-1/4 h-full rounded-lg shadow-md p-6 bg-gradient-to-tr from-violet-200 to-white flex items-center justify-center gap-6">
          <FaUser className="text-violet-500 w-24 h-24 items-center" />
          <div className="flex flex-col items-center">
            <h3 className="text-gray-900 text-xl font-bold tracking-tight">
              Adult
            </h3>
            <p className="text-gray-500 text-sm font-medium mt-1">
              18 - 59 yrs old
            </p>
            <p className="text-blue-600 text-2xl font-bold mt-2">1,200</p>
          </div>
        </div>

        <div className="w-1/4 h-full rounded-lg shadow-md p-6 bg-gradient-to-tr from-orange-200 to-white flex items-center justify-center gap-6">
          <FaUserTie className="text-orange-500 w-24 h-24 items-center" />
          <div className="flex flex-col items-center">
            <h3 className="text-gray-900 text-xl font-bold tracking-tight">
              Senior Citizen
            </h3>
            <p className="text-gray-500 text-sm font-medium mt-1">
              60+ yrs old
            </p>
            <p className="text-blue-600 text-2xl font-bold mt-2">1,200</p>
          </div>
        </div>
      </div> */}

      {/* <div className="w-full flex gap-4 h-96">
        
        <div className="w-3/4 bg-white rounded-xl shadow-md p-4">
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            opts={{ renderer: "canvas" }}
          />
        </div>

        
        <div className="w-1/4 bg-white rounded-xl shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-800">
              Recent Activity
            </h2>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </div>

          <hr className="my-2" />

          <div className="space-y-1 max-h-[calc(100%-4rem)]">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1 px-2 border-b"
              >
                <div className="flex items-center gap-1">
                  <div className="h-3 w-3 bg-gray-900 rounded-full" />
                  <span className="text-gray-600 text-xs">{activity.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-green-500 text-xs">
                      {activity.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      {activity.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div> */}</div>
  )
}

export default ProfilingDashboard