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
import { usePopulationBySitio } from "@/pages/healthServices/Reports/healthprofiling-report/queries/fetchQueries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, MapPin, Loader2, Home, Users } from "lucide-react";
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

interface PopulationBySitioChartProps {
  initialYear?: string;
}

export function PopulationBySitioChart({
  initialYear = "all",
}: PopulationBySitioChartProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const { data, isLoading, error } = usePopulationBySitio(selectedYear);

  // Generate year options for the last 10 years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  // Color palette for bars
  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#14b8a6", // teal
    "#f97316", // orange
    "#6366f1", // indigo
    "#84cc16", // lime
  ];

  if (error) {
    return (
      <CardLayout
        title="Population by Sitio"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              Failed to load population by sitio data. Please try again later.
            </AlertDescription>
          </Alert>
        }
        cardClassName="border border-gray-200 shadow-sm rounded-xl"
      />
    );
  }

  // Transform data for chart
  interface SitioData {
    name: string;
    population: number;
    male: number;
    female: number;
    households: number;
    families: number;
    avgHouseholdSize: number;
  }

  const sitioData: SitioData[] = data?.data?.sitios?.map((sitio: any) => ({
    name: sitio.sitioName,
    population: sitio.population,
    male: sitio.male,
    female: sitio.female,
    households: sitio.households,
    families: sitio.families,
    avgHouseholdSize: sitio.avgHouseholdSize,
  })) || [];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border-2 border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600">
              <span className="font-medium">Population:</span> {data.population.toLocaleString()}
            </p>
            <p className="text-cyan-600">
              <span className="font-medium">Male:</span> {data.male.toLocaleString()}
            </p>
            <p className="text-pink-600">
              <span className="font-medium">Female:</span> {data.female.toLocaleString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Households:</span> {data.households.toLocaleString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Families:</span> {data.families.toLocaleString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Avg Household Size:</span> {data.avgHouseholdSize}
            </p>
          </div>
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
            <MapPin className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              Population by Sitio
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
          Population distribution across different sitios
          {selectedYear !== "all" && ` for ${selectedYear}`}
        </div>
      }
      content={
        <div className="space-y-6 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : !data?.data || sitioData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
              <MapPin className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Data Available
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No population data available for sitios in the selected period.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-blue-600" />
                    <p className="text-sm text-blue-700 font-medium">Total Population</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-900">
                    {data?.data?.summary?.totalPopulation?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">Total Households</p>
                  </div>
                  <p className="text-2xl font-bold text-green-900">
                    {data?.data?.summary?.totalHouseholds?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-4 w-4 text-purple-600" />
                    <p className="text-sm text-purple-700 font-medium">Total Families</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    {data?.data?.summary?.totalFamilies?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-amber-600" />
                    <p className="text-sm text-amber-700 font-medium">Total Sitios</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-900">
                    {data?.data?.summary?.totalSitios || 0}
                  </p>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={sitioData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                  >
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={{ stroke: "#d1d5db" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={{ stroke: "#d1d5db" }}
                      label={{
                        value: "Population",
                        angle: -90,
                        position: "insideLeft",
                        className: "text-sm font-semibold text-gray-500",
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar
                      dataKey="population"
                      name="Population"
                      animationDuration={600}
                      radius={[6, 6, 0, 0]}
                    >
                      {sitioData.map((_entry, index: number) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Detailed Table */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left p-3 font-semibold text-gray-700">Sitio</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Population</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Male</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Female</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Households</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Families</th>
                      <th className="text-right p-3 font-semibold text-gray-700">Avg HH Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sitioData.map((sitio: SitioData, index: number) => (
                      <tr
                        key={index}
                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 font-medium text-gray-900">{sitio.name}</td>
                        <td className="p-3 text-right text-gray-700">{sitio.population.toLocaleString()}</td>
                        <td className="p-3 text-right text-cyan-600">{sitio.male.toLocaleString()}</td>
                        <td className="p-3 text-right text-pink-600">{sitio.female.toLocaleString()}</td>
                        <td className="p-3 text-right text-gray-700">{sitio.households.toLocaleString()}</td>
                        <td className="p-3 text-right text-gray-700">{sitio.families.toLocaleString()}</td>
                        <td className="p-3 text-right text-gray-700">{sitio.avgHouseholdSize}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
