// import { useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from "recharts";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useIncomeData } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
// import { getQuarterlyIncomeByItem } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerQuarterlyIncExp";
// import { cn } from "@/lib/utils";

// export function IncomeQuarterlyChart() {
//   const currentYear = new Date().getFullYear();
//   const { data, isLoading, error } = useIncomeData(currentYear);
//   const [activeQuarter, setActiveQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q1");

//   if (isLoading) {
//     return (
//       <Card className="w-full">
//         <CardContent className="space-y-6">
//           <Skeleton className="h-10 w-1/3" />
//           <div className="h-[300px]">
//             <Skeleton className="h-full w-full" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error || !data) {
//     return (
//       <Card className="w-full">
//         <CardContent className="flex items-center justify-center py-8 text-destructive">
//           Failed to load income data
//         </CardContent>
//       </Card>
//     );
//   }

//   const fullQuarterData = getQuarterlyIncomeByItem(data);
//   const chartData = fullQuarterData
//     .map(item => ({
//       name: item.name,
//       amount: item[activeQuarter] ?? 0,
//     }))
//     .filter(item => item.amount > 0);

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 p-1 mb-2 text-[20px]">
//           {currentYear} Quarterly Income
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         <div className="inline-flex items-center bg-muted rounded-md p-1">
//           {[
//             { key: "Q1", label: "Jan–Mar" },
//             { key: "Q2", label: "Apr–Jun" },
//             { key: "Q3", label: "Jul–Sep" },
//             { key: "Q4", label: "Oct–Dec" },
//           ].map(({ key, label }) => (
//             <button
//               key={key}
//               onClick={() => setActiveQuarter(key as "Q1" | "Q2" | "Q3" | "Q4")}
//               className={cn(
//                 "px-2 py-1 text-sm font-medium rounded-md transition-colors",
//                 activeQuarter === key
//                   ? "bg-white text-black text-foreground shadow-sm"
//                   : "text-muted-foreground bg-transparent hover:bg-white/10"
//               )}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         <div className="h-[300px]">
//           {chartData.length > 0 && (
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip
//                   formatter={(value) => [
//                     `₱${Number(value).toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}`,
//                     "Income",
//                   ]}
//                 />
//                 <Bar
//                   dataKey="amount"
//                   name={`Income (${activeQuarter})`}
//                   fill="#2563EB"
//                   radius={[4, 4, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }








// import { useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from "recharts";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { useIncomeData } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
// import { getQuarterlyIncomeByItem } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerQuarterlyIncExp";
// import { cn } from "@/lib/utils";


// export function IncomeQuarterlyChart() {
//   const currentYear = new Date().getFullYear();
//   const { data, isLoading, error } = useIncomeData(currentYear);
//   const [activeQuarter, setActiveQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q1");

//   if (isLoading) {
//     return (
//       <Card className="w-full">
//         <CardContent className="space-y-6">
//           <Skeleton className="h-10 w-1/3" />
//           <div className="h-[300px]">
//             <Skeleton className="h-full w-full" />
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error || !data) {
//     return (
//       <Card className="w-full">
//         <CardContent className="flex items-center justify-center py-8 text-destructive">
//           Failed to load income data
//         </CardContent>
//       </Card>
//     );
//   }

//   // Extract the results array from the paginated response
//   const incomeData = data.results || [];
//   const fullQuarterData = getQuarterlyIncomeByItem(incomeData);
//   const chartData = fullQuarterData
//     .map(item => ({
//       name: item.name,
//       amount: item[activeQuarter] ?? 0,
//     }))
//     .filter(item => item.amount > 0);

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 p-1 mb-2 text-[20px]">
//           {currentYear} Quarterly Income
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         <div className="inline-flex items-center bg-muted rounded-md p-1">
//           {[
//             { key: "Q1", label: "Jan–Mar" },
//             { key: "Q2", label: "Apr–Jun" },
//             { key: "Q3", label: "Jul–Sep" },
//             { key: "Q4", label: "Oct–Dec" },
//           ].map(({ key, label }) => (
//             <button
//               key={key}
//               onClick={() => setActiveQuarter(key as "Q1" | "Q2" | "Q3" | "Q4")}
//               className={cn(
//                 "px-2 py-1 text-sm font-medium rounded-md transition-colors",
//                 activeQuarter === key
//                   ? "bg-white text-black text-foreground shadow-sm"
//                   : "text-muted-foreground bg-transparent hover:bg-white/10"
//               )}
//             >
//               {label}
//             </button>
//           ))}
//         </div>

//         <div className="h-[300px]">
//           {chartData.length > 0 && (
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip
//                   formatter={(value) => [
//                     `₱${Number(value).toLocaleString(undefined, {
//                       minimumFractionDigits: 2,
//                       maximumFractionDigits: 2,
//                     })}`,
//                     "Income",
//                   ]}
//                 />
//                 <Bar
//                   dataKey="amount"
//                   name={`Income (${activeQuarter})`}
//                   fill="#2563EB"
//                   radius={[4, 4, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }






import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Target } from "lucide-react";
import { useIncomeData } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
import { getQuarterlyIncomeByItem } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerQuarterlyIncExp";
import { cn } from "@/lib/utils";

const QUARTER_LABELS = {
  Q1: "Jan-Mar",
  Q2: "Apr-Jun",
  Q3: "Jul-Sep",
  Q4: "Oct-Dec"
};

export function IncomeQuarterlyChart() {
  const currentYear = new Date().getFullYear();
  // Fetch all data by passing a large page size and specifying the year
  const { data, isLoading, error } = useIncomeData(1, 10000, currentYear, undefined, undefined, false);
  const [activeQuarter, setActiveQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q1");

  if (isLoading) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex items-center justify-center py-16">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex items-center justify-center py-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load income data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Extract the results array from the paginated response
  const incomeData = data.results || [];
  console.log("Income Data:", incomeData);
  console.log("Sample item:", incomeData[0]);
  
  const fullQuarterData = getQuarterlyIncomeByItem(incomeData);
  console.log("Full Quarter Data:", fullQuarterData);

  // Calculate totals for each quarter
  const quarterTotals = {
    Q1: fullQuarterData.reduce((sum, item) => sum + (item.Q1 ?? 0), 0),
    Q2: fullQuarterData.reduce((sum, item) => sum + (item.Q2 ?? 0), 0),
    Q3: fullQuarterData.reduce((sum, item) => sum + (item.Q3 ?? 0), 0),
    Q4: fullQuarterData.reduce((sum, item) => sum + (item.Q4 ?? 0), 0),
  };
  console.log("Quarter Totals:", quarterTotals);

  const totalIncome = Object.values(quarterTotals).reduce((sum, val) => sum + val, 0);
  
  // Calculate average quarterly income
  const avgQuarterlyIncome = totalIncome / 4;
  
  // Calculate growth rate (comparing current quarter to previous quarter)
  const quarters = ["Q1", "Q2", "Q3", "Q4"] as const;
  const currentQuarterIndex = quarters.indexOf(activeQuarter);
  const previousQuarterIndex = currentQuarterIndex > 0 ? currentQuarterIndex - 1 : 3;
  const currentQuarterTotal = quarterTotals[activeQuarter];
  const previousQuarterTotal = quarterTotals[quarters[previousQuarterIndex]];
  const growthRate = previousQuarterTotal > 0 
    ? ((currentQuarterTotal - previousQuarterTotal) / previousQuarterTotal) * 100 
    : 0;

  // Chart data for active quarter
  const chartData = fullQuarterData
    .map(item => ({
      name: item.name,
      amount: item[activeQuarter] ?? 0,
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);
  
  console.log("Chart Data for", activeQuarter, ":", chartData);

  // Find highest income source in active quarter
  const highestIncomeSource = chartData.length > 0 ? chartData[0] : null;

  const chartConfig = {
    amount: {
      label: "Income",
      color: "hsl(142, 76%, 36%)",
    },
  };

  return (
    <Card className="w-full border-none shadow-none">
      {/* Header */}
      <CardHeader className="border-b border-gray-100 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Income Overview
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {currentYear} Income Tracking and Quarterly Analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x bg-gray-50/50 border-b border-gray-100">
        {/* Total Income */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Total Income
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-green-600">
              ₱{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Current Quarter Income */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            {activeQuarter} Income
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₱{currentQuarterTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Average Quarterly */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Avg. Quarterly
          </div>
          <div className="text-2xl font-bold text-gray-900">
            ₱{avgQuarterlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Growth Rate */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Growth Rate
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
            </span>
            {growthRate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Quarter Selection Tabs - Always visible */}
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center bg-muted rounded-md p-1">
              {(["Q1", "Q2", "Q3", "Q4"] as const).map((quarter) => (
                <button
                  key={quarter}
                  onClick={() => setActiveQuarter(quarter)}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-all",
                    activeQuarter === quarter
                      ? "bg-white text-black shadow"
                      : "text-muted-foreground bg-transparent hover:bg-white/10"
                  )}
                >
                  {QUARTER_LABELS[quarter]}
                </button>
              ))}
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <DollarSign className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Income Data Available
              </h3>
              <p className="text-sm text-gray-600 max-w-sm">
                There are no income entries to display for {QUARTER_LABELS[activeQuarter]} {currentYear}.
              </p>
            </div>
          ) : (
            <>
              {/* Chart */}
              <div>
                <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 0,
                        bottom: 20,
                      }}
                    >
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="hsl(220, 90%, 56%)" stopOpacity={0.6}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        className="stroke-muted/30" 
                        stroke="#e5e7eb"
                      />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        minTickGap={32}
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        className="text-xs"
                        tick={{ fill: '#6b7280' }}
                        tickFormatter={(value) => {
                          if (value >= 1000000) {
                            return `₱${(value / 1000000).toFixed(1)}M`;
                          } else if (value >= 1000) {
                            return `₱${(value / 1000).toFixed(0)}K`;
                          }
                          return `₱${value}`;
                        }}
                      />
                      <ChartTooltip
                        cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }}
                        content={
                          <ChartTooltipContent
                            className="w-[220px] border shadow-lg bg-white"
                            formatter={(value, _name, _props) => {
                              // const itemName = props?.payload?.name;
                              const totalIncome = Number(value);
                              const percentOfTotal = currentQuarterTotal > 0 
                                ? ((totalIncome / currentQuarterTotal) * 100).toFixed(1)
                                : '0.0';
                                
                              return (
                                <div className="space-y-1">
                                  {/* <div className="font-semibold text-gray-900">{itemName}</div> */}
                                  <div className="font-medium text-green-600">
                                    Income: ₱{totalIncome.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {percentOfTotal}% of quarter total
                                  </div>
                                </div>
                              );
                            }}
                          />
                        }
                      />
                      <Bar
                        dataKey="amount"
                        fill="url(#colorIncome)"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={50}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income Sources Summary */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {QUARTER_LABELS[activeQuarter]} Summary
                  </h3>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {chartData.map((item) => {
                      const percentOfTotal = currentQuarterTotal > 0 
                        ? ((item.amount / currentQuarterTotal) * 100).toFixed(1)
                        : '0.0';
                      
                      return (
                        <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 truncate">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {percentOfTotal}% of quarter total
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-semibold text-green-600">
                              ₱{item.amount.toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </div>
                            {item.name === highestIncomeSource?.name && (
                              <div className="text-xs text-blue-600 font-medium">Highest</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Income Status */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Status</h3>
                  <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Sources Count</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {chartData.length} sources
                      </span>
                    </div>
                    
                    {/* Top Source */}
                    {highestIncomeSource && (
                      <div className="pt-2 border-t">
                        <div className="text-sm font-medium text-gray-600 mb-2">Top Income Source</div>
                        <div className="font-medium text-gray-900">{highestIncomeSource.name}</div>
                        <div className="text-sm text-green-600">
                          ₱{highestIncomeSource.amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quarterly Breakdown */}
                    <div className="pt-4 border-t space-y-2">
                      <div className="text-sm font-medium text-gray-600 mb-2">Quarterly Breakdown</div>
                      {(["Q1", "Q2", "Q3", "Q4"] as const).map((quarter) => (
                        <div key={quarter} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{QUARTER_LABELS[quarter]}</span>
                          <span className={cn(
                            "font-medium",
                            activeQuarter === quarter ? "text-green-600" : "text-gray-900"
                          )}>
                            ₱{quarterTotals[quarter].toLocaleString(undefined, { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}