import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useHealthProfilingSummary } from "@/pages/healthServices/Reports/healthprofiling-report/queries/fetchQueries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Home, Loader2 } from "lucide-react";
import { CardTitle } from "@/components/ui/card";
import CardLayout from "@/components/ui/card/card-layout";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";

interface HouseholdInfrastructureChartProps {
  initialYear?: string;
}

type ChartType = "water" | "toilet";

export function HouseholdInfrastructureChart({
  initialYear = "all",
}: HouseholdInfrastructureChartProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [chartType, setChartType] = useState<ChartType>("water");
  const { data, isLoading, error } = useHealthProfilingSummary(
    selectedYear,
    "all"
  );

  // Generate year options for the last 10 years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (error) {
    return (
      <CardLayout
        title="Household Infrastructure"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              Failed to load household infrastructure data. Please try again later.
            </AlertDescription>
          </Alert>
        }
        cardClassName="border border-gray-200 shadow-sm rounded-xl"
      />
    );
  }

  // Water data
  const waterData = [
    {
      name: "Level I (Point Source)",
      value: data?.data?.waterType?.level1 || 0,
      color: "#3b82f6",
    },
    {
      name: "Level II (Communal)",
      value: data?.data?.waterType?.level2 || 0,
      color: "#06b6d4",
    },
    {
      name: "Level III (House Connection)",
      value: data?.data?.waterType?.level3 || 0,
      color: "#0ea5e9",
    },
  ];

  // Toilet data
  const toiletData = [
    {
      name: "Sanitary",
      value: data?.data?.toiletType?.sanitary || 0,
      color: "#22c55e",
    },
    {
      name: "Unsanitary",
      value: data?.data?.toiletType?.unsanitary || 0,
      color: "#ef4444",
    },
  ];

  const currentData = chartType === "water" ? waterData : toiletData;
  const total = currentData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">
            Count: {data.value.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            Percentage: {percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="font-bold text-sm"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <CardLayout
      title={
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Home className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              Household Infrastructure
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={(v: any) => setChartType(v)}>
              <SelectTrigger className="w-[160px] border-gray-200">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="water">Water Source</SelectItem>
                <SelectItem value="toilet">Toilet Type</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[140px] border-gray-200">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      description={
        <div className="text-sm text-gray-600">
          Distribution of {chartType === "water" ? "water sources" : "toilet facilities"} across households
          {selectedYear !== "all" && ` for ${selectedYear}`}
        </div>
      }
      content={
        <div className="space-y-6 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : !data?.data || total === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
              <Home className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Data Available
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No household infrastructure data available for the selected period.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    Total Households
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {data?.data?.numberOfHouseholds?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">
                    Total Families
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {data?.data?.numberOfFamilies?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">
                    Total Population
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {data?.data?.actualPopulation?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700 font-medium">
                    {chartType === "water" ? "Water Systems" : "Toilet Facilities"}
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {total.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={currentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={140}
                      fill="#8884d8"
                      dataKey="value"
                      animationDuration={600}
                    >
                      {currentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry: any) => {
                        const item = currentData.find((d) => d.name === value);
                        return `${value}: ${item?.value?.toLocaleString() || 0}`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 gap-3">
                {currentData.map((item, index) => {
                  const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-gray-700">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          {percentage}%
                        </span>
                        <span className="font-bold text-gray-900">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      }
      cardClassName="w-full mt-4"
      headerClassName="border-b border-gray-100 pb-6 border-gray-200"
    />
  );
}
