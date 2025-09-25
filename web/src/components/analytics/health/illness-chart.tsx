// components/MedicalHistoryMonthlyChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, LineChart as LineChartIcon } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
import { useState } from "react";
import { CardTitle } from "@/components/ui/card";
import CardLayout from "@/components/ui/card/card-layout";
import { useMedicalHistoryChart } from "./queries/chart";

interface MedicalHistoryChartProps {
  initialMonth: string;
}

export function MedicalHistoryMonthlyChart({ initialMonth }: MedicalHistoryChartProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const { data, isLoading, error } = useMedicalHistoryChart(currentMonth);

  const currentDate = parseISO(`${currentMonth}-01`);
  const today = new Date();
  const currentMonthDate = parseISO(`${format(today, "yyyy-MM")}-01`);

  const nextMonthDisabled = isSameMonth(currentDate, currentMonthDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    setCurrentMonth(format(newDate, "yyyy-MM"));
  };

  // Transform and sort data
  const allIllnesses = data?.illness_counts
    ? Object.entries(data.illness_counts)
        .filter(([name]) => name !== "null" && name.trim() !== "")
        .map(([name, count]) => ({ name, count: count as number }))
        .sort((a, b) => b.count - a.count) // Sort by count descending
    : [];

  // Take top 10 and group the rest
  const topN = 10;
  const displayData = allIllnesses.slice(0, topN);
  const othersCount = allIllnesses.slice(topN).reduce((sum, item) => sum + item.count, 0);

  if (othersCount > 0) {
    displayData.push({ name: "Other Illnesses", count: othersCount });
  }

  const totalIllnesses = allIllnesses.length;
  const otherIllnessesCount = totalIllnesses - topN;

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-md rounded-md border border-gray-200">
          <p className="font-semibold">{payload[0].payload.name}</p>
          <p className="text-sm">
            Cases: <span className="font-medium">{payload[0].value}</span>
          </p>
          <p className="text-sm">
            Percentage: <span className="font-medium">{((payload[0].value / (data?.total_records ?? 1)) * 100 || 0).toFixed(1)}%</span>
          </p>
          {payload[0].payload.name === "Other Illnesses" && otherIllnessesCount > 0 && (
            <p className="text-sm mt-1">(Combines {otherIllnessesCount} other illnesses)</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <CardLayout
        title="Medical History Trends"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">Failed to load medical history data. Please try again later.</AlertDescription>
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
          <LineChartIcon className="h-5 w-5 text-gray-500" />
          <CardTitle className="text-xl font-semibold text-gray-900">Medical History Trends</CardTitle>
        </div>
      }
      description={`Illness cases recorded in ${format(currentDate, "MMMM yyyy")}`}
      content={
        <div className="space-y-6 p-4">
          {/* Header with controls */}
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
          ) : !data || allIllnesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[300px]">
              <LineChartIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
              <p className="text-sm text-gray-500 max-w-sm">No medical history data available for the selected period.</p>
            </div>
          ) : (
            <>
              <div className="text-sm text-gray-500 text-center mb-2">
                Showing top {Math.min(topN, allIllnesses.length)} illnesses
                {otherIllnessesCount > 0 && <span> and {otherIllnessesCount} others combined</span>}
                <span className="ml-2">• Total Records: {data.total_records}</span>
              </div>

              <div className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }} 
                      interval={0} 
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, fill: "#ef4444" }} 
                    />
                  </LineChart>
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