import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useOPTMonthlyReport } from "@/pages/healthServices/Reports/opt-tracking-summary/queries/fetch";
import CardLayout from "@/components/ui/card/card-layout";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
import { useState } from "react";
import { CardTitle } from "@/components/ui/card/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select/select";

type ChartCategory = "WFA" | "HFA" | "WFH";

interface NutritionalChartProps {
  initialMonth: string;
  initialCategory?: ChartCategory;
}

interface StatusData {
  Male: number;
  Female: number;
}

interface AgeGroupData {
  [status: string]: StatusData | number;
  Total: number;
}

export function OPTStatusChart({
  initialMonth,
  initialCategory = "WFA",
}: NutritionalChartProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [category, setCategory] = useState<ChartCategory>(initialCategory);
  const { data, isLoading, error } = useOPTMonthlyReport(currentMonth);

  const currentDate = parseISO(`${currentMonth}-01`);
  const today = new Date();
  const currentMonthDate = parseISO(`${format(today, "yyyy-MM")}-01`);

  const nextMonthDisabled = isSameMonth(currentDate, currentMonthDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1);
    setCurrentMonth(format(newDate, "yyyy-MM"));
  };

  const getCategoryName = (cat: ChartCategory) => {
    switch (cat) {
      case "WFA":
        return "Weight-for-Age";
      case "HFA":
        return "Height-for-Age";
      case "WFH":
        return "Weight-for-Height";
      default:
        return cat satisfies never;
    }
  };

  const isAllZeroData = (reportData: any) => {
    if (!reportData || !reportData[category]) return true;

    for (const ageGroup of Object.values(reportData[category].age_groups)) {
      for (const [key, value] of Object.entries(ageGroup as AgeGroupData)) {
        if (key === "Total") continue;
        const status = value as StatusData;
        if (status.Male !== 0 || status.Female !== 0) {
          return false;
        }
      }
    }
    return true;
  };

  if (error) {
    return (
      <CardLayout
        title="Nutritional Status Chart"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              Failed to load nutritional status data. Please try again later.
            </AlertDescription>
          </Alert>
        }
        cardClassName="border border-gray-200 shadow-sm rounded-xl"
      />
    );
  }

  const statusTypes = data?.report
    ? Object.keys(data.report[category].age_groups["0-5"] || {}).filter(
        (status) => status !== "Total"
      )
    : [];

  const chartData = data?.report
    ? Object.entries(data.report[category].age_groups).map(
        ([ageGroup, statusData]) => {
          const result: Record<string, string | number> = { ageGroup };
          statusTypes.forEach((status) => {
            const statusValue = statusData[status] as StatusData;
            result[status] =
              (statusValue?.Male || 0) + (statusValue?.Female || 0);
          });
          return result;
        }
      )
    : [];

  const statusColors = {
    WFA: {
      N: "#22c55e", // Normal - Green (better contrast)
      UW: "#f59e0b", // Underweight - Amber
      SUW: "#ef4444", // Severe Underweight - Red
      OW: "#3b82f6", // Overweight - Blue
    },
    HFA: {
      N: "#22c55e", // Normal - Green
      ST: "#f59e0b", // Stunted - Amber
      SST: "#ef4444", // Severe Stunted - Red
      T: "#8b5cf6", // Tall - Purple
    },
    WFH: {
      N: "#22c55e", // Normal - Green
      W: "#f59e0b", // Wasted - Amber
      SW: "#ef4444", // Severe Wasted - Red
      OW: "#3b82f6", // Overweight - Blue
    },
  };

  const statusLabels = {
    WFA: {
      N: "Normal",
      UW: "Underweight",
      SUW: "Severely Underweight",
      OW: "Overweight",
    },
    HFA: {
      N: "Normal",
      ST: "Stunted",
      SST: "Severely Stunted",
      T: "Tall",
    },
    WFH: {
      N: "Normal",
      W: "Wasted",
      SW: "Severely Wasted",
      OW: "Overweight",
    },
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-3 p-4 ">
      {payload?.map((entry: any, index: number) => (
        <div
          key={`legend-${index}`}
          className="flex items-center gap-2 px-3 py-1.5 "
        >
          <div
            className="w-4 h-4 rounded-sm border border-gray-200"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-800">
            {statusLabels[category][
              entry.value as keyof (typeof statusLabels)[ChartCategory]
            ] || entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <CardLayout
      title={
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              {`${getCategoryName(category)} Status Distribution`}
            </CardTitle>
          </div>
          <Select
            value={category}
            onValueChange={(value: any) => setCategory(value as ChartCategory)}
          >
            <SelectTrigger className="w-[180px] border-gray-200">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WFA">Weight-for-Age</SelectItem>
              <SelectItem value="HFA">Height-for-Age</SelectItem>
              <SelectItem value="WFH">Weight-for-Height</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
      description={
        <div className="text-sm text-gray-600 ">
          Comprehensive view of children's nutritional status for{" "}
          {format(currentDate, "MMMM yyyy")}
        </div>
      }
      content={
        <div className="space-y-6 p-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("prev")}
                className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous</span>
              </Button>
              <div className="px-4 py-1.5 bg-blue-50 text-blue-800 rounded-md text-sm font-medium min-w-[120px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth("next")}
                disabled={nextMonthDisabled}
                className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                aria-label="Next month"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : !data?.report || isAllZeroData(data.report) ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
              <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Data Available
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No nutritional status data available for the selected period and
                category.
              </p>
            </div>
          ) : (
            <div className="h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20 }}
                  layout="horizontal"
                >
                  <XAxis
                    dataKey="ageGroup"
                    type="category"
                    label={{
                      position: "insideBottom",
                      offset: -10,
                      className: "text-sm font-semibold text-gray-500",
                    }}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#d1d5db" }}
                    tickLine={{ stroke: "#d1d5db" }}
                  />
                  <YAxis
                    type="number"
                    tick={{
                      fontSize: 12,
                      fontWeight: "semibold",
                      fill: "#6b7280",
                    }}
                    label={{
                      position: "insideLeft",
                      style: {
                        textAnchor: "middle",
                        fontSize: "14px",
                        fontWeight: "bold",
                        color: "#6b7280",
                      },
                    }}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} children`,
                      statusLabels[category][
                        name as keyof (typeof statusLabels)[ChartCategory]
                      ] || name,
                    ]}
                    labelFormatter={(label) => `Age Group: ${label}`}
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      color: "#6b7280",
                    }}
                  />
                  <Legend
                    content={CustomLegend}
                    wrapperStyle={{ paddingTop: "10px" }}
                  />

                  {statusTypes.map((status) => (
                    <Bar
                      key={status}
                      dataKey={status}
                      name={status}
                      fill={
                        statusColors[category][
                          status as keyof (typeof statusColors)[ChartCategory]
                        ]
                      }
                      animationDuration={600}
                      barSize={20}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      }
      cardClassName="  w-full  mt-4"
      headerClassName="border-b  border-gray-100 pb-6 border-gray-200"
    />
  );
}
