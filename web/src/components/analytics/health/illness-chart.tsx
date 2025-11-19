// components/MedicalHistoryMonthlyChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, LineChart as LineChartIcon, Info, TrendingUp, Users, Activity, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
import { useState } from "react";
import { CardTitle } from "@/components/ui/card";
import CardLayout from "@/components/ui/card/card-layout";
import { useMedicalHistoryChart } from "./queries/chart";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";
import { Link } from "react-router";

interface MedicalHistoryChartProps {
  initialMonth: string;
}

export function MedicalHistoryMonthlyChart({ initialMonth }: MedicalHistoryChartProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [showModal, setShowModal] = useState(false);
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

  // Take top 10 and group the rest for chart
  const topN = 10;
  const topIllnesses = allIllnesses.slice(0, topN);
  const othersCount = allIllnesses.slice(topN).reduce((sum, item) => sum + item.count, 0);

  const chartData = [...topIllnesses];
  if (othersCount > 0) {
    chartData.push({ name: "Other Illnesses", count: othersCount });
  }

  const totalIllnesses = allIllnesses.length;
  const otherIllnessesCount = totalIllnesses - topN;

  // const getLinkState = (medicineName?: string, itemCount?: number) => ({
  //   medicineName: medicineName || "",
  //   itemCount: itemCount || data?.total_records,
  //   monthlyrcplist_id: data?.monthly_report_id,
  //   month: currentMonth,
  //   monthName: format(currentDate, "MMMM yyyy"),
  // });

  // Calculate additional statistics
  const getIllnessStats = (illness: { name: string; count: number }, rank: number) => {
    const percentage = ((illness.count / data.total_records) * 100).toFixed(1);
    const isHighFrequency = illness.count > data.total_records * 0.05; // More than 5% of total
    const trend = rank <= 3 ? "High Priority" : rank <= 10 ? "Monitor" : "Low Priority";

    return {
      ...illness,
      rank,
      percentage: parseFloat(percentage),
      isHighFrequency,
      trend,
      severity: illness.count > 50 ? "High" : illness.count > 20 ? "Medium" : "Low",
    };
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-300 z-50" style={{ pointerEvents: "none" }}>
          <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
          <p className="text-sm text-gray-600">
            Cases: <span className="font-medium text-gray-900">{payload[0].value}</span>
          </p>
          <p className="text-sm text-gray-600">
            Percentage: <span className="font-medium text-gray-900">{((payload[0].value / (data?.total_records ?? 1)) * 100 || 0).toFixed(1)}%</span>
          </p>
          {payload[0].payload.name === "Other Illnesses" && otherIllnessesCount > 0 && <p className="text-sm mt-1 text-blue-600">(Combines {otherIllnessesCount} other illnesses)</p>}
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <CardLayout
        title="Morbidity Trends"
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
    <>
      <CardLayout
        title={
          <div className="flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">Morbidity Trends</CardTitle>
          </div>
        }
        description={`Morbidity cases recorded in ${format(currentDate, "MMMM yyyy")}`}
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
                <div className="px-4 py-1.5 bg-blue-50 text-blue-800 rounded-md text-sm font-medium min-w-[120px] text-center">{format(currentDate, "MMMM yyyy")}</div>
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
                {/* Summary stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 mb-4">
                  <EnhancedCardLayout
                    title="Total Morbidities"
                    description="Unique illnesses recorded"
                    value={totalIllnesses}
                    icon={<Users className="h-6 w-6 text-blue-700" />}
                    cardClassName="bg-blue-50 border-blue-100"
                    headerClassName="pb-2"
                  />
                  <EnhancedCardLayout
                    title="Total Cases"
                    description="Total morbidity records"
                    value={data.total_records}
                    icon={<TrendingUp className="h-6 w-6 text-green-700" />}
                    cardClassName="bg-green-50 border-green-100"
                    headerClassName="pb-2"
                  />
                  <EnhancedCardLayout
                    title="Highest Count"
                    description={allIllnesses.length > 0 ? allIllnesses[0].name : ""}
                    value={allIllnesses.length > 0 ? allIllnesses[0].count : 0}
                    valueDescription={allIllnesses.length > 0 ? "Most frequent illness" : ""}
                    icon={<Activity className="h-6 w-6 text-purple-700" />}
                    cardClassName="bg-purple-50 border-purple-100"
                    headerClassName="pb-2"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500 text-center ">
                    Showing top {Math.min(topN, allIllnesses.length)} morbidities
                    {otherIllnessesCount > 0 && <span> and {otherIllnessesCount} others combined</span>}
                  </div>
                  <div className="flex justify-end items-center gap-3">
                    {totalIllnesses > topN && (
                      <Button size="sm" onClick={() => setShowModal(true)} className="flex items-center gap-2 transition-colors hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800">
                        Show More Details ({otherIllnessesCount} more)
                      </Button>
                    )}
                  </div>
                </div>
                <div className="h-[450px] border border-gray-200 rounded-lg bg-white">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        interval={0}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={{ stroke: "#e2e8f0" }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#ef4444", stroke: "#ffffff", strokeWidth: 2 }}
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

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-4 flex flex-col min-h-[80vh] max-h-[95vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Comprehensive Morbidity Analysis</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete breakdown for {format(currentDate, "MMMM yyyy")} - {totalIllnesses} illnesses, {data?.total_records} total cases
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} className="h-8 w-8 p-0 hover:bg-white/80">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Statistics Grid */}
            <div className="p-6 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                  <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{totalIllnesses}</div>
                  <div className="text-xs text-gray-600 font-medium">Morbidities</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{allIllnesses.filter((_, i) => i < 5).reduce((sum, item) => sum + item.count, 0)}</div>
                  <div className="text-xs text-gray-600 font-medium">Top 5 Cases</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                  <Activity className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{data ? (data.total_records / totalIllnesses).toFixed(1) : "0"}</div>
                  <div className="text-xs text-gray-600 font-medium">Avg Cases/Morbidity</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                  <AlertCircle className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{data ? allIllnesses.filter((illness) => illness.count > data.total_records * 0.05).length : "0"}</div>
                  <div className="text-xs text-gray-600 font-medium">High Priority</div>
                </div>
              </div>
            </div>

            {/* Table Container - This is the scrollable area */}
            <div className="flex-1 overflow-hidden bg-white">
              <div className="h-full overflow-y-auto pb-4" style={{ maxHeight: "calc(95vh - 300px)" }}>
                {/* <div className="flex justify-end p-2">
                  <Link to="/reports/monthly-morbidity-summary/records" state={getLinkState()}>
                    <Button variant="outline" className="flex items-center gap-2 text-sm font-medium italic text-blue-800">
                      View Complete Details With Age Group Filter
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div> */}

                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Rank</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Morbidity Name</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Cases</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Percentage</th>
                      {/* <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Priority</th> */}
                      {/* <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Impact Level</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allIllnesses.map((illness, index) => {
                      const stats = getIllnessStats(illness, index + 1);
                      const isTopTen = index < topN;

                      return (
                        <tr key={illness.name} className={`${isTopTen ? "bg-blue-50/30" : ""} hover:bg-gray-50 transition-colors`}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">#{stats.rank}</span>
                              {isTopTen && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-1">Top 10</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                            <div className="max-w-xs">
                              <div className="truncate font-semibold" title={illness.name}>
                                {illness.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className="text-lg font-bold text-gray-900">{illness.count}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-900 font-semibold min-w-[45px]">{stats.percentage}%</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-300 ${isTopTen ? "bg-gradient-to-r from-blue-400 to-blue-600" : "bg-gray-400"}`}
                                  style={{ width: `${Math.min(stats.percentage * 2, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          {/* <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                stats.trend === "High Priority"
                                  ? "bg-red-100 text-red-800 ring-1 ring-red-200"
                                  : stats.trend === "Monitor"
                                  ? "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200"
                                  : "bg-green-100 text-green-800 ring-1 ring-green-200"
                              }`}
                            > */}
                          {/* {stats.trend} */}
                          {/* </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${stats.severity === "High" ? "bg-red-500" : stats.severity === "Medium" ? "bg-yellow-500" : "bg-green-500"}`} />
                              <span className="text-gray-700 font-medium">{stats.severity}</span>
                            </div>
                          </td> */}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* Add spacing at the bottom so last row is visible */}
                <div className="h-6"></div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Displaying all {totalIllnesses} morbidities with comprehensive analysis</div>
                <Button onClick={() => setShowModal(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
                  Close Details
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
