// components/MedicineDistributionChart.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Pill, ArrowRight, TrendingUp, Users, BarChart3, Info, X } from "lucide-react";
import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button/button";
import { CardTitle } from "@/components/ui/card";
import CardLayout from "@/components/ui/card/card-layout";
import { useMedicineChart } from "@/pages/healthServices/reports/medicine-report/queries/fetchQueries";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b", "#06b6d4"];

interface MedicineDistributionChartProps {
  initialMonth: string;
}

export function MedicineDistributionChart({ initialMonth }: MedicineDistributionChartProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, error } = useMedicineChart(currentMonth);

  const currentDate = parseISO(`${currentMonth}-01`);
  const today = new Date();
  const currentMonthDate = parseISO(`${format(today, "yyyy-MM")}-01`);

  const nextMonthDisabled = isSameMonth(currentDate, currentMonthDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    setCurrentMonth(format(newDate, "yyyy-MM"));
  };

  // Transform data for chart
  const allMedicines = data?.medicine_counts
    ? Object.entries(data.medicine_counts as Record<string, number>)
        .filter(([name]) => name !== "null" && name.trim() !== "")
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  const totalDoses = allMedicines.reduce((sum, item) => sum + item.count, 0);
  const totalMedicines = allMedicines.length;

  // Take top 10 for chart
  const topN = 10;
  const topMedicines = allMedicines.slice(0, topN);
  const otherMedicinesCount = totalMedicines - topN;

  // Prepare chart data
  const chartData = topMedicines.map((medicine, index) => ({
    ...medicine,
    percentage: (medicine.count / totalDoses) * 100,
    rank: index + 1,
    color: COLORS[index % COLORS.length],
  }));

  // Common link state
  const getLinkState = (medicineName?: string, itemCount?: number) => ({
    medicineName: medicineName || "",
    itemCount: itemCount || totalDoses,
    monthlyrcplist_id: data?.monthly_report_id,
    month: currentMonth,
    monthName: format(currentDate, "MMMM yyyy"),
  });

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-300 z-50 min-w-[200px]">
          <p className="font-semibold text-gray-900 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Records:</span>
              <span className="font-medium text-gray-900">{data.count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Percentage:</span>
              <span className="font-medium text-gray-900">{data.percentage.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rank:</span>
              <span className="font-medium text-gray-900">#{data.rank}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (error) {
    return (
      <CardLayout
        title="Medicine Distribution"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>Failed to load medicine distribution data. Please try again later.</AlertDescription>
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
            <BarChart3 className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">Medicine Request</CardTitle>
          </div>
        }
        description={`Medicine requested for ${format(currentDate, "MMMM yyyy")}`}
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
                  <span>Previous</span>
                </Button>
                <div className="px-4 py-1.5 bg-blue-50 text-blue-800 rounded-md text-sm font-medium min-w-[120px] text-center">{format(currentDate, "MMM yyyy")}</div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth("next")}
                  disabled={nextMonthDisabled}
                  className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  aria-label="Next month"
                >
                  <span>Next</span>
                </Button>
              </div>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <EnhancedCardLayout
                title="Total Medicines"
                description="Types of medicines requested"
                value={totalMedicines}
                icon={<Users className="h-6 w-6 text-blue-500" />}
                cardClassName="bg-blue-50 border-blue-200"
                headerClassName="pb-2"
              />
              <EnhancedCardLayout
                title="Total Records"
                description="Total medicine requested records"
                value={totalDoses}
                icon={<TrendingUp className="h-6 w-6 text-green-500" />}
                cardClassName="bg-green-50 border-green-200"
                headerClassName="pb-2"
              />
              <EnhancedCardLayout
                title="Most Requested"
                description={allMedicines.length > 0 ? allMedicines[0].name : ""}
                value={allMedicines.length > 0 ? allMedicines[0].count : 0}
                valueDescription={allMedicines.length > 0 ? "Most requested medicine" : ""}
                icon={<Pill className="h-6 w-6 text-purple-500" />}
                cardClassName="bg-purple-50 border-purple-200"
                headerClassName="pb-2"
              />
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing top {Math.min(topN, allMedicines.length)} medicines
                {otherMedicinesCount > 0 && <span> and {otherMedicinesCount} others</span>}
              </div>
              <div className="flex gap-3">
                {otherMedicinesCount > 0 && (
                  <Button size="sm" onClick={() => setShowModal(true)} className="flex items-center gap-2 transition-colors hover:bg-blue-100 hover:border-blue-300 hover:text-blue-800">
                    Show More Details ({otherMedicinesCount} more)
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[400px]">
                <div className="animate-pulse space-y-4 w-full">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : !data || allMedicines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
                <div className="rounded-full bg-gray-100 p-4 mb-4">
                  <Pill className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
                <p className="text-sm text-gray-500 max-w-sm">No medicine requested data available for {format(currentDate, "MMMM yyyy")}.</p>
              </div>
            ) : (
              <>
                {/* Vertical Bar Chart */}
                <div className="h-[450px] border border-gray-200 rounded-lg bg-white">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 80 }}>
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
                      <Bar dataKey="count" name="Records" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
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

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-4 flex flex-col min-h-[80vh] max-h-[95vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl flex-shrink-0">
              <div className="flex items-center gap-3">
                <Pill className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Complete Medicine Analysis</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete breakdown for {format(currentDate, "MMMM yyyy")} - {totalMedicines} medicines, {totalDoses} total records
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
                  <div className="text-2xl font-bold text-gray-900">{totalMedicines}</div>
                  <div className="text-xs text-gray-600 font-medium">Medicine Types</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{allMedicines.filter((_, i) => i < 5).reduce((sum, item) => sum + item.count, 0)}</div>
                  <div className="text-xs text-gray-600 font-medium">Top 5 Records</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                  <Pill className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{totalMedicines > 0 ? (totalDoses / totalMedicines).toFixed(1) : "0"}</div>
                  <div className="text-xs text-gray-600 font-medium">Avg Records/Medicine</div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-100 text-center shadow-sm">
                  <Info className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-900">{allMedicines.filter((medicine) => medicine.count > totalDoses * 0.05).length}</div>
                  <div className="text-xs text-gray-600 font-medium">High Usage</div>
                </div>
              </div>
            </div>

            {/* Table Container */}
            <div className="flex-1 overflow-hidden bg-white">
              <div className="h-full overflow-y-auto pb-4" style={{ maxHeight: "calc(95vh - 300px)" }}>
                <div className="flex justify-end p-2">
                  <Link to="/reports/monthly-medicine/records" state={getLinkState()}>
                    <Button variant="outline" className="flex items-center gap-2 text-sm font-medium italic text-blue-800">
                      View Complete Report With List of Residents
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Rank</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Medicine Name</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Records</th>
                      <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allMedicines.map((medicine, index) => {
                      const percentage = (medicine.count / totalDoses) * 100;
                      const isTopTen = index < topN;

                      return (
                        <tr key={medicine.name} className={`${isTopTen ? "bg-blue-50/30" : ""} hover:bg-gray-50 transition-colors`}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">#{index + 1}</span>
                              {isTopTen && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Top 10</span>}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 font-medium">
                            <div className="max-w-xs">
                              <div className="truncate font-semibold" title={medicine.name}>
                                {medicine.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className="text-lg font-bold text-gray-900">{medicine.count}</span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-900 font-semibold min-w-[45px]">{percentage.toFixed(1)}%</span>
                              <div className="w-20 bg-gray-200 rounded-full h-2.5">
                                <div
                                  className={`h-2.5 rounded-full transition-all duration-300 ${isTopTen ? "bg-gradient-to-r from-blue-400 to-blue-600" : "bg-gray-400"}`}
                                  style={{ width: `${Math.min(percentage * 2, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="h-6"></div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Displaying all {totalMedicines} medicines with comprehensive analysis</div>
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
