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
import { useHealthProfilingSummary } from "@/pages/healthServices/Reports/healthprofiling-report/queries/fetchQueries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Activity, Loader2 } from "lucide-react";
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

interface NutritionalStatusSummaryChartProps {
  initialYear?: string;
}

export function NutritionalStatusSummaryChart({
  initialYear = "all",
}: NutritionalStatusSummaryChartProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
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
        title="Nutritional Status Summary"
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

  // Transform nutritional status data
  const nutritionalData = data?.data?.nutritionalStatus
    ? [
        {
          status: "Normal",
          Male: data.data.nutritionalStatus.normal.male,
          Female: data.data.nutritionalStatus.normal.female,
          total:
            data.data.nutritionalStatus.normal.male +
            data.data.nutritionalStatus.normal.female,
        },
        {
          status: "Underweight",
          Male: data.data.nutritionalStatus.underweight.male,
          Female: data.data.nutritionalStatus.underweight.female,
          total:
            data.data.nutritionalStatus.underweight.male +
            data.data.nutritionalStatus.underweight.female,
        },
        {
          status: "Severely Underweight",
          Male: data.data.nutritionalStatus.severelyUnderweight.male,
          Female: data.data.nutritionalStatus.severelyUnderweight.female,
          total:
            data.data.nutritionalStatus.severelyUnderweight.male +
            data.data.nutritionalStatus.severelyUnderweight.female,
        },
        {
          status: "Overweight",
          Male: data.data.nutritionalStatus.overweight.male,
          Female: data.data.nutritionalStatus.overweight.female,
          total:
            data.data.nutritionalStatus.overweight.male +
            data.data.nutritionalStatus.overweight.female,
        },
      ]
    : [];

  const totalChildren = nutritionalData.reduce((sum, d) => sum + d.total, 0);

  const statusColors = {
    Male: "#06b6d4",
    Female: "#ec4899",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);
      return (
        <div className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
          <p className="text-sm font-semibold text-gray-700 mt-2 pt-2 border-t">
            Total: {total.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <CardLayout
      title={
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              Nutritional Status Distribution
            </CardTitle>
          </div>
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
      }
      description={
        <div className="text-sm text-gray-600">
          Children's nutritional status by gender
          {selectedYear !== "all" && ` for ${selectedYear}`}
        </div>
      }
      content={
        <div className="space-y-6 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : !data?.data || totalChildren === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
              <Activity className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Data Available
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No nutritional status data available for the selected period.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-green-700 font-medium">Normal</p>
                  <p className="text-2xl font-bold text-green-900">
                    {nutritionalData[0]?.total?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <p className="text-sm text-amber-700 font-medium">
                    Underweight
                  </p>
                  <p className="text-2xl font-bold text-amber-900">
                    {nutritionalData[1]?.total?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm text-red-700 font-medium">
                    Severely Underweight
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    {nutritionalData[2]?.total?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    Overweight
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {nutritionalData[3]?.total?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Health Conditions */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-700 font-medium">
                    Diabetic Cases
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    {data?.data?.diabetic?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-rose-50 p-4 rounded-lg border border-rose-200">
                  <p className="text-sm text-rose-700 font-medium">
                    Hypertension Cases
                  </p>
                  <p className="text-2xl font-bold text-rose-900">
                    {data?.data?.hypertension?.toLocaleString() || 0}
                  </p>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={nutritionalData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <XAxis
                      dataKey="status"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      label={{
                        value: "Number of Children",
                        angle: -90,
                        position: "insideLeft",
                        className: "text-sm font-semibold text-gray-500",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                      formatter={(value) => `${value} Children`}
                    />
                    <Bar
                      dataKey="Male"
                      fill={statusColors.Male}
                      name="Male"
                      animationDuration={600}
                      barSize={40}
                    />
                    <Bar
                      dataKey="Female"
                      fill={statusColors.Female}
                      name="Female"
                      animationDuration={600}
                      barSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-1 gap-3">
                {nutritionalData.map((item, index) => {
                  const percentage =
                    totalChildren > 0
                      ? ((item.total / totalChildren) * 100).toFixed(1)
                      : 0;
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <span className="font-medium text-gray-700">
                        {item.status}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-cyan-600">
                          M: {item.Male}
                        </span>
                        <span className="text-sm text-pink-600">
                          F: {item.Female}
                        </span>
                        <span className="text-sm text-gray-600">
                          {percentage}%
                        </span>
                        <span className="font-bold text-gray-900">
                          {item.total.toLocaleString()}
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
