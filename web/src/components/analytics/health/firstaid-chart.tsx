import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
  } from "recharts";
  import CardLayout from "@/components/ui/card/card-layout";
  import { Alert, AlertDescription } from "@/components/ui/alert";
  import { AlertCircle, Loader2, BarChart3 } from "lucide-react";
  import { Button } from "@/components/ui/button/button";
  import { ChevronLeft, ChevronRight } from "lucide-react";
  import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
  import { useState } from "react";
  import { CardTitle } from "@/components/ui/card";
  import { useFirstAidChart } from "@/pages/healthServices/Reports/firstaid-report/queries/fetchQueries";
  import { FirstAidChartResponse } from "@/pages/healthServices/Reports/firstaid-report/types";
  interface FirstAidChartProps {
    initialMonth: string;
  }
  
  const COLORS = [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#8b5cf6", // Violet
    "#ec4899", // Pink
    "#14b8a6", // Teal
    "#f97316", // Orange
    "#64748b", // Slate
  ];
  
  export function FirstAidDistributionChart({ initialMonth }: FirstAidChartProps) {
    const [currentMonth, setCurrentMonth] = useState(initialMonth);
    const { data, isLoading, error } = useFirstAidChart(currentMonth);
  
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
  
    // Transform and sort data with proper null checks
    const allFirstAidItems = data?.first_aid_counts
      ? Object.entries(data.first_aid_counts)
          .filter(([name]) => name !== "null" && name !== "undefined")
          .map(([name, count]) => ({ name, count: Number(count) || 0 }))
          .sort((a, b) => b.count - a.count)
      : [];
  
    // Take top 10 and group the rest
    const topN = 10;
    const displayData = allFirstAidItems.slice(0, topN);
    const othersCount = allFirstAidItems.slice(topN)
      .reduce((sum, item) => sum + item.count, 0);
    
    if (othersCount > 0) {
      displayData.push({ name: "Other Items", count: othersCount });
    }
  
    const totalItems = allFirstAidItems.length;
    const otherItemsCount = Math.max(0, totalItems - topN);
  
    const CustomTooltip = ({
      active,
      payload,
      label,
    }: {
      active?: boolean;
      payload?: any[];
      label?: string;
    }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
            <p className="font-semibold">{payload[0].payload.name}</p>
            <p className="text-sm">
              Count: <span className="font-medium">{payload[0].value}</span>
            </p>
            <p className="text-sm">
              Percentage:{" "}
              <span className="font-medium">
                {((payload[0].value / (data?.total_records ?? 1)) * 100 || 0).toFixed(1)}%
              </span>
            </p>
            {payload[0].payload.name === "Other Items" && otherItemsCount > 0 && (
              <p className="text-sm mt-1">
                (Combines {otherItemsCount} other first aid items)
              </p>
            )}
          </div>
        );
      }
      return null;
    };
  
    if (error) {
      return (
        <CardLayout
          title="First Aid Distribution"
          description="Error loading data"
          content={
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription className="text-sm">
                Failed to load first aid distribution data. Please try again later.
              </AlertDescription>
            </Alert>
          }
          cardClassName="border border-gray-200 shadow-sm rounded-xl"
        />
      );
    }
  
    return (
      <CardLayout
        title={
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              First Aid Distribution
            </CardTitle>
          </div>
        }
        description={`First aid items distributed in ${format(
          currentDate,
          "MMMM yyyy"
        )}`}
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
            ) : !data?.success || allFirstAidItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
                <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  {!data?.success ? "Error Loading Data" : "No Data Available"}
                </h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  {!data?.success 
                    ? "Failed to load first aid data" 
                    : "No first aid items distributed this period"}
                </p>
              </div>
            ) : (
              <>
                <div className="text-sm text-gray-500 text-center mb-2">
                  Showing top {Math.min(topN, allFirstAidItems.length)} items
                  {otherItemsCount > 0 && (
                    <span> and {otherItemsCount} others combined</span>
                  )}
                </div>
                <div className="h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={displayData}
                      margin={{ top: 20}}
                    >
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12 }}
                        interval={0}
                      />
                      <YAxis
                      
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      <Bar
                        name="Count"
                        dataKey="count"
                        barSize={40}
                      >
                        {displayData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </div>
        }
        cardClassName="w-full mt-4"
        headerClassName="border-b border-gray-200 pb-6"
      />
    );
  }
  