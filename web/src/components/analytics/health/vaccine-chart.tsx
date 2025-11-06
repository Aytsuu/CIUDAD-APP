// components/VaccineResidentChart.tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, TrendingUp, Users, Syringe } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { CardTitle } from "@/components/ui/card";
import CardLayout from "@/components/ui/card/card-layout";
import { useVaccineResidentChart } from "./queries/chart";
import { EnhancedCardLayout } from "@/components/ui/health-total-cards";

interface VaccineResidentChartProps {
  initialYear: string;
}

// Two-Column Tooltip Component
const TwoColumnTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
  if (active && payload && payload.length) {
    const monthData = payload[0]?.payload;

    if (!monthData) return null;

    const allVaccines = monthData.vaccines || [];

    // Split into two equal columns
    const midPoint = Math.ceil(allVaccines.length / 2);
    const leftColumn = allVaccines.slice(0, midPoint);
    const rightColumn = allVaccines.slice(midPoint);

    return (
      <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-300 z-50 min-w-[500px] max-w-[600px]">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-gray-900 text-lg">
            {label} {payload[0]?.payload?.year}
          </p>
          <div className="text-right">
            <div className="text-sm font-medium text-blue-700">Total: {monthData.total_residents}</div>
            <div className="text-xs text-gray-500">{allVaccines.length} vaccines</div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-6 max-h-96 overflow-y-auto">
          {/* Left Column */}
          <div className="space-y-2">
            {leftColumn.map((vaccine: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-700 truncate flex-1" title={vaccine.name}>
                  {vaccine.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-sm font-semibold text-gray-900">{vaccine.residents}</span>
                  <span className="text-xs text-gray-500 w-8 text-right">({vaccine.percentage?.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-2">
            {rightColumn.map((vaccine: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
                <span className="text-sm font-medium text-gray-700 truncate flex-1" title={vaccine.name}>
                  {vaccine.name}
                </span>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-sm font-semibold text-gray-900">{vaccine.residents}</span>
                  <span className="text-xs text-gray-500 w-8 text-right">({vaccine.percentage?.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function VaccineResidentChart({ initialYear }: VaccineResidentChartProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const { data, isLoading, error } = useVaccineResidentChart(currentYear);

  const currentYearNum = parseInt(currentYear);
  //   const currentDate = new Date(currentYearNum, 0, 1);

  const navigateYear = (direction: "prev" | "next") => {
    const newYear = direction === "prev" ? currentYearNum - 1 : currentYearNum + 1;
    setCurrentYear(newYear.toString());
  };

  // Transform data for charts
  const chartData = data?.chart_data || [];
  //   const vaccineSummary = data?.vaccine_summary || [];
  const statistics = data?.statistics;

  // Calculate statistics
  const totalResidents = statistics?.total_residents || 0;
  const totalVaccines = statistics?.total_vaccines || 0;
  //   const uniqueResidents = statistics?.unique_residents || 0;

  const peakMonth = statistics?.peak_month || { month: "None", total_residents: 0 };
  //   const averagePerVaccine = totalVaccines > 0 ? Math.round(totalResidents / totalVaccines) : 0;

  if (error) {
    return (
      <CardLayout
        title="Vaccination Trends"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">Failed to load vaccination data. Please try again later.</AlertDescription>
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
          <TrendingUp className="h-5 w-5 text-gray-500" />
          <CardTitle className="text-xl font-semibold text-gray-900">Vaccination Trends</CardTitle>
        </div>
      }
      description={`Monthly vaccination patterns for ${currentYear} - Hover over months to see detailed breakdown`}
      content={
        <div className="space-y-6 p-4">
          {/* Header with controls */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Hover over any month to see all vaccines in two columns</div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear("prev")}
                className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Previous year"
              >
                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>Previous</span>
              </Button>
              <div className="px-4 py-1.5 bg-blue-50 text-blue-800 rounded-md text-sm font-medium min-w-[80px] text-center">{currentYear}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear("next")}
                className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Next year"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <EnhancedCardLayout
              title="Total Vaccinations"
              description="Total residents vaccinated"
              value={totalResidents}
              icon={<Users className="h-6 w-6 text-blue-500" />}
              cardClassName="bg-blue-50 border-blue-200"
              headerClassName="pb-2"
            />
            <EnhancedCardLayout
              title="Vaccine Types"
              description="Types of vaccines administered"
              value={totalVaccines}
              icon={<Syringe className="h-6 w-6 text-green-500" />}
              cardClassName="bg-green-50 border-green-200"
              headerClassName="pb-2"
            />
            <EnhancedCardLayout
              title="Peak Month"
              description={peakMonth.month}
              value={peakMonth.total_residents}
              valueDescription={`Most vaccinations in ${peakMonth.month}`}
              icon={<TrendingUp className="h-6 w-6 text-purple-500" />}
              cardClassName="bg-purple-50 border-purple-200"
              headerClassName="pb-2"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : !data || chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
              <TrendingUp className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
              <p className="text-sm text-gray-500 max-w-sm">No vaccination data available for {currentYear}.</p>
            </div>
          ) : (
            <>
              {/* Main Chart */}
              <div className="h-[500px] border border-gray-200 rounded-lg bg-white p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData.map((item: any) => ({
                      ...item,
                      year: currentYear,
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} label={{ value: "Residents Vaccinated", angle: -90, position: "insideLeft" }} />
                    <Tooltip content={<TwoColumnTooltip />} />
                    <Area type="monotone" dataKey="total_residents" name="Total Residents Vaccinated" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Vaccine Summary Table
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Vaccine Summary</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    All vaccines administered in {currentYear}, sorted by total residents
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vaccine</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Residents</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {vaccineSummary.map((vaccine: any, index: number) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {vaccine.name}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {vaccine.total_residents}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {totalResidents > 0 
                              ? ((vaccine.total_residents / totalResidents) * 100).toFixed(1) 
                              : 0
                            }%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div> */}
            </>
          )}
        </div>
      }
      cardClassName="w-full mt-4"
      headerClassName="border-b border-gray-200 pb-6"
    />
  );
}
