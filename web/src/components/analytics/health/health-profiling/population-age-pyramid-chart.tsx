import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { usePopulationStructureReport } from "@/pages/healthServices/Reports/healthprofiling-report/queries/fetchQueries";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users, Loader2 } from "lucide-react";
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

interface PopulationPyramidChartProps {
  initialYear?: string;
}

export function PopulationAgePyramidChart({
  initialYear = "all",
}: PopulationPyramidChartProps) {
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const { data, isLoading, error } = usePopulationStructureReport(
    selectedYear,
    "all"
  );

  // Generate year options for the last 10 years
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

  if (error) {
    return (
      <CardLayout
        title="Population Age Pyramid"
        description="Error loading data"
        content={
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="text-sm">
              Failed to load population structure data. Please try again later.
            </AlertDescription>
          </Alert>
        }
        cardClassName="border border-gray-200 shadow-sm rounded-xl"
      />
    );
  }

  // Transform data for grouped bar chart
  const pyramidData = data?.data?.ageGroups?.map((group) => ({
    ageGroup: group.ageGroup,
    Male: group.male,
    Female: group.female,
  })) || [];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border-2 border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              className="text-sm"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
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
            <Users className="h-5 w-5 text-gray-500" />
            <CardTitle className="text-xl font-semibold text-gray-900">
              Population Age Pyramid
            </CardTitle>
          </div>
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
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
          Age and gender distribution of the population
          {selectedYear !== "all" && ` for ${selectedYear}`}
        </div>
      }
      content={
        <div className="space-y-6 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : !data?.data || pyramidData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Data Available
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                No population structure data available for the selected period.
              </p>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 font-medium">
                    Total Population
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {data?.data?.totalPopulation?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <p className="text-sm text-cyan-700 font-medium">
                    Male Population
                  </p>
                  <p className="text-2xl font-bold text-cyan-900">
                    {pyramidData
                      .reduce((sum, d) => sum + d.Male, 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                  <p className="text-sm text-pink-700 font-medium">
                    Female Population
                  </p>
                  <p className="text-2xl font-bold text-pink-900">
                    {pyramidData
                      .reduce((sum, d) => sum + d.Female, 0)
                      .toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Population Pyramid Chart */}
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={pyramidData}
                    margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
                  >
                    <XAxis
                      dataKey="ageGroup"
                      tick={{ fontSize: 12, fill: "#6b7280", fontWeight: 600 }}
                      axisLine={{ stroke: "#d1d5db" }}
                      tickLine={{ stroke: "#d1d5db" }}
                      label={{
                        value: "Age Group",
                        position: "insideBottom",
                        offset: -10,
                        className: "text-sm font-semibold text-gray-500",
                      }}
                    />
                    <YAxis
                      type="number"
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
                    <Legend
                      wrapperStyle={{ paddingTop: "20px" }}
                    />
                    <Bar
                      dataKey="Male"
                      fill="#06b6d4"
                      name="Male"
                      animationDuration={600}
                      barSize={30}
                    />
                    <Bar
                      dataKey="Female"
                      fill="#ec4899"
                      name="Female"
                      animationDuration={600}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { usePopulationStructureReport } from "@/pages/healthServices/Reports/healthprofiling-report/queries/fetchQueries";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { AlertCircle, Users, Loader2 } from 'lucide-react';
// import { CardTitle } from "@/components/ui/card";
// import CardLayout from "@/components/ui/card/card-layout";
// import { useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select/select";

// interface PopulationPyramidChartProps {
//   initialYear?: string;
// }

// export function PopulationAgePyramidChart({
//   initialYear = "all",
// }: PopulationPyramidChartProps) {
//   const [selectedYear, setSelectedYear] = useState(initialYear);
//   const { data, isLoading, error } = usePopulationStructureReport(
//     selectedYear,
//     "all"
//   );

//   // Generate year options for the last 10 years
//   const currentYear = new Date().getFullYear();
//   const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i);

//   if (error) {
//     return (
//       <CardLayout
//         title="Population Age Distribution"
//         description="Error loading data"
//         content={
//           <Alert variant="destructive" className="m-4">
//             <AlertCircle className="h-5 w-5" />
//             <AlertDescription className="text-sm">
//               Failed to load population structure data. Please try again later.
//             </AlertDescription>
//           </Alert>
//         }
//         cardClassName="border border-slate-200 shadow-md rounded-xl bg-white"
//       />
//     );
//   }

//   // Transform data for grouped bar chart
//   const pyramidData = data?.data?.ageGroups?.map((group) => ({
//     ageGroup: group.ageGroup,
//     Male: group.male,
//     Female: group.female,
//   })) || [];

//   const CustomTooltip = ({ active, payload, label }: any) => {
//     if (active && payload && payload.length) {
//       return (
//         <div className="bg-slate-900 text-white p-4 rounded-lg shadow-xl border border-slate-700 backdrop-blur-sm">
//           <p className="font-semibold text-slate-100 mb-3 text-sm">{label}</p>
//           {payload.map((entry: any, index: number) => (
//             <p
//               key={index}
//               className="text-sm text-slate-200 flex items-center gap-2"
//             >
//               <span
//                 className="w-2 h-2 rounded-full"
//                 style={{ backgroundColor: entry.color }}
//               ></span>
//               <span className="font-medium">{entry.name}:</span>
//               <span className="text-slate-100 font-semibold">
//                 {entry.value.toLocaleString()}
//               </span>
//             </p>
//           ))}
//         </div>
//       );
//     }
//     return null;
//   };

//   // Calculate totals for summary stats
//   const totalMale = pyramidData.reduce((sum, d) => sum + d.Male, 0);
//   const totalFemale = pyramidData.reduce((sum, d) => sum + d.Female, 0);
//   const totalPopulation = data?.data?.totalPopulation || 0;

//   const malePercentage = totalPopulation > 0 ? ((totalMale / totalPopulation) * 100).toFixed(1) : 0;
//   const femalePercentage = totalPopulation > 0 ? ((totalFemale / totalPopulation) * 100).toFixed(1) : 0;

//   return (
//     <CardLayout
//       title={
//         <div className="flex items-center justify-between gap-4 flex-wrap">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-teal-100 rounded-lg">
//               <Users className="h-5 w-5 text-teal-700" />
//             </div>
//             <div>
//               <CardTitle className="text-2xl font-bold text-slate-900">
//                 Population Age Distribution
//               </CardTitle>
//               <p className="text-sm text-slate-500 font-normal mt-1">
//                 Demographic breakdown by age group and gender
//               </p>
//             </div>
//           </div>
//           <Select value={selectedYear} onValueChange={setSelectedYear}>
//             <SelectTrigger className="w-[160px] border-slate-300 bg-white hover:border-teal-300 focus:border-teal-500 focus:ring-teal-500">
//               <SelectValue placeholder="Select year" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">All Years</SelectItem>
//               {yearOptions.map((year) => (
//                 <SelectItem key={year} value={year.toString()}>
//                   {year}
//                 </SelectItem>
//               ))}
//             </SelectContent>
//           </Select>
//         </div>
//       }
//       description=""
//       content={
//         <div className="space-y-6 p-6">
//           {isLoading ? (
//             <div className="flex items-center justify-center h-[400px]">
//               <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
//             </div>
//           ) : !data?.data || pyramidData.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 text-center h-[400px]">
//               <Users className="h-12 w-12 text-slate-400 mb-4" />
//               <h3 className="text-lg font-semibold text-slate-700 mb-2">
//                 No Data Available
//               </h3>
//               <p className="text-sm text-slate-500 max-w-sm">
//                 No population structure data available for the selected period.
//               </p>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 {/* Total Population Card */}
//                 <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-slate-600">
//                       Total Population
//                     </p>
//                     <div className="p-2 bg-slate-200 rounded-lg">
//                       <Users className="h-4 w-4 text-slate-700" />
//                     </div>
//                   </div>
//                   <p className="text-3xl font-bold text-slate-900">
//                     {totalPopulation.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-slate-500 mt-2">
//                     {selectedYear !== "all" ? `Year ${selectedYear}` : "All years"}
//                   </p>
//                 </div>

//                 {/* Male Population Card */}
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-blue-600">
//                       Male Population
//                     </p>
//                     <div className="w-3 h-3 rounded-full bg-blue-500"></div>
//                   </div>
//                   <p className="text-3xl font-bold text-blue-900">
//                     {totalMale.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-blue-600 font-medium mt-2">
//                     {malePercentage}% of total
//                   </p>
//                 </div>

//                 {/* Female Population Card */}
//                 <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-xl border border-teal-200 shadow-sm hover:shadow-md transition-shadow">
//                   <div className="flex items-center justify-between mb-2">
//                     <p className="text-sm font-semibold text-teal-600">
//                       Female Population
//                     </p>
//                     <div className="w-3 h-3 rounded-full bg-teal-500"></div>
//                   </div>
//                   <p className="text-3xl font-bold text-teal-900">
//                     {totalFemale.toLocaleString()}
//                   </p>
//                   <p className="text-xs text-teal-600 font-medium mt-2">
//                     {femalePercentage}% of total
//                   </p>
//                 </div>
//               </div>

//               <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 p-6 shadow-sm">
//                 <h3 className="text-sm font-semibold text-slate-700 mb-6">
//                   Age Group Distribution
//                 </h3>
//                 <div className="h-[500px]">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart
//                       data={pyramidData}
//                       margin={{ top: 20, right: 30, left: 60, bottom: 60 }}
//                     >
//                       <XAxis
//                         dataKey="ageGroup"
//                         tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
//                         axisLine={{ stroke: "#cbd5e1" }}
//                         tickLine={{ stroke: "#cbd5e1" }}
//                       />
//                       <YAxis
//                         type="number"
//                         tick={{ fontSize: 12, fill: "#64748b" }}
//                         axisLine={{ stroke: "#cbd5e1" }}
//                         tickLine={{ stroke: "#cbd5e1" }}
//                       />
//                       <Tooltip content={<CustomTooltip />} />
//                       <Legend
//                         wrapperStyle={{
//                           paddingTop: "20px",
//                           fontSize: "13px",
//                         }}
//                         iconType="circle"
//                       />
//                       <Bar
//                         dataKey="Male"
//                         fill="#3b82f6"
//                         name="Male"
//                         animationDuration={600}
//                         barSize={32}
//                         radius={[6, 6, 0, 0]}
//                       />
//                       <Bar
//                         dataKey="Female"
//                         fill="#14b8a6"
//                         name="Female"
//                         animationDuration={600}
//                         barSize={32}
//                         radius={[6, 6, 0, 0]}
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       }
//       cardClassName="w-full mt-4 bg-white border-slate-200 shadow-md rounded-xl"
//       headerClassName="border-b border-slate-100 pb-6"
//     />
//   );
// }
