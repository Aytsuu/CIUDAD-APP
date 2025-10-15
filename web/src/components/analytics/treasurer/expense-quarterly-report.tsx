//LATEST BUT NOT IN PARTICULARS
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { TrendingDown } from "lucide-react";
// import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
// import { useIncomeExpense } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerQuarterlyIncExp";
// import { cn } from "@/lib/utils";


// export function IncomeExpenseQuarterlyChart() {
//   const currentYear = new Date().getFullYear();
//   const { data, isLoading, error } = useIncomeExpense(currentYear);

//   if (isLoading) {
//     return (
//       <Card className="w-full">
//         <CardContent className="space-y-6">
//           <Skeleton className="h-10 w-1/3" />
//           <div className="h-[300px]">
//             <Skeleton className="h-full w-full" />
//           </div>
//           <div className="space-y-4">
//             {[...Array(4)].map((_, i) => (
//               <Skeleton key={i} className="h-20 w-full" />
//             ))}
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   if (error) {
//     return (
//       <Card className="w-full">
//         <CardContent className="flex items-center justify-center py-8 text-destructive">
//           Failed to load expense data
//         </CardContent>
//       </Card>
//     );
//   }

//   // Transform quarterly data for the chart
//   const chartData = data?.quarterlyExpenses.map(quarter => ({
//     name: `Q${quarter.quarter}`,
//     total: quarter.total,
//     count: quarter.items.length
//   })) || [];

//   // Calculate yearly total
//   const yearlyTotal = data?.quarterlyExpenses.reduce((sum, quarter) => sum + quarter.total, 0) || 0;

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 p-1 mb-2">
//           {currentYear} Quarterly Expenses
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Yearly Summary */}
//         <div className="border rounded-lg p-4 max-w-xs">
//           <div className="text-muted-foreground text-sm">Total Annual Expenses</div>
//           <div className="text-2xl font-bold text-red-600">
//             ₱{yearlyTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//           </div>
//         </div>

//         {/* Chart Section */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Bar Chart */}
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
//                 <XAxis 
//                   dataKey="name" 
//                   label={{ value: 'Quarter', position: 'insideBottomRight', offset: -5 }} 
//                 />
//                 <YAxis 
//                   label={{ value: 'Amount (₱)', angle: -90, position: 'insideLeft' }} 
//                 />
//                 <Tooltip 
//                   formatter={(value) => [`₱${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]}
//                   labelFormatter={(label) => `${label}`}
//                 />
//                 <Legend />
//                 <Bar 
//                   dataKey="total" 
//                   name="Total Expenses"
//                   fill="#ef4444" 
//                   radius={[4, 4, 0, 0]}
//                 />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           {/* Quarter Details */}
//           <div className="space-y-4">
//             {data?.quarterlyExpenses.map((quarter) => (
//               <Card key={quarter.quarter} className="hover:bg-gray-50 transition-colors">
//                 <CardContent className="p-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="font-medium">Q{quarter.quarter}</h3>
//                     <span className="text-sm font-medium text-red-600">
//                       ₱{quarter.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
//                     </span>
//                   </div>
//                   <div className="mt-2 flex items-center text-muted-foreground text-sm">
//                     <TrendingDown className="h-4 w-4 mr-1 text-red-500" />
//                     <span>{quarter.items.length} expense records</span>
//                   </div>
//                   {quarter.items.length > 0 && (
//                     <div className="mt-2 text-xs text-muted-foreground">
//                       <div className="truncate">
//                         Latest: {new Date(quarter.items[quarter.items.length - 1].iet_datetime).toLocaleDateString()}
//                       </div>
//                     </div>
//                   )}
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
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
import { useIncomeExpense } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerQuarterlyIncExp";
import { IncomeExpense } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
import { useBudgetItems } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
import { cn } from "@/lib/utils";

interface BudgetItemQuarterData {
  name: string;
  Q1?: number;
  Q2?: number;
  Q3?: number;
  Q4?: number;
}

const getQuarterlyByBudgetItem = (expenses: IncomeExpense[]): BudgetItemQuarterData[] => {
  const grouped: Record<string, BudgetItemQuarterData> = {};
  
  expenses.forEach(item => {
    if (item.iet_entryType !== 'Expense') return;

    const date = new Date(item.iet_datetime);
    if (isNaN(date.getTime())) return;

    const quarter = `Q${Math.floor((date.getMonth() + 3) / 3)}` as 'Q1' | 'Q2' | 'Q3' | 'Q4';
    let amount = 0;
    const actual = Number(item.iet_actual_amount);
    const proposed = Number(item.iet_amount);

    if (!isNaN(actual) && actual > 0) {
      amount = actual;
    } else if (!isNaN(proposed) && proposed > 0) {
      amount = proposed;
    }

    const key = item.exp_budget_item;

    if (!grouped[key]) {
      grouped[key] = { name: key };
    }

    grouped[key][quarter] = (grouped[key][quarter] || 0) + Number(amount);
  });

  return Object.values(grouped);
};

const QUARTER_LABELS = {
  Q1: "Jan-Mar",
  Q2: "Apr-Jun",
  Q3: "Jul-Sep",
  Q4: "Oct-Dec"
};

export function IncomeExpenseQuarterlyChart() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading, error } = useIncomeExpense(currentYear);
  const { data: budgetItems = [] } = useBudgetItems(currentYear);
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
            <AlertDescription>Failed to load expense data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const budgetMap = new Map(
    (budgetItems ?? []).map((item) => [item.name, item.proposedBudget])
  );

  const fullQuarterData = getQuarterlyByBudgetItem(data.allData);
  
  // Calculate totals for each quarter
  const quarterTotals = {
    Q1: fullQuarterData.reduce((sum, item) => sum + (item.Q1 ?? 0), 0),
    Q2: fullQuarterData.reduce((sum, item) => sum + (item.Q2 ?? 0), 0),
    Q3: fullQuarterData.reduce((sum, item) => sum + (item.Q3 ?? 0), 0),
    Q4: fullQuarterData.reduce((sum, item) => sum + (item.Q4 ?? 0), 0),
  };

  const totalExpenses = Object.values(quarterTotals).reduce((sum, val) => sum + val, 0);
  const totalBudget = Array.from(budgetMap.values()).reduce((sum, val) => sum + val, 0);
  const remainingBudget = totalBudget - totalExpenses;
  const utilizationRate = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Chart data for active quarter
  const chartData = fullQuarterData
    .map(item => ({
      name: item.name,
      amount: item[activeQuarter] ?? 0,
    }))
    .filter(item => item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Find highest spending budget item in active quarter
  const highestSpendingItem = chartData.length > 0 ? chartData[0] : null;

  const chartConfig = {
    amount: {
      label: "Expenses",
      color: "hsl(0, 84%, 60%)",
    },
  };

  return (
    <Card className="w-full border-none shadow-none">
      {/* Header */}
      <CardHeader className="border-b border-gray-100 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">
              Expense Overview
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              {currentYear} Budget Tracking and Quarterly Analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x bg-gray-50/50 border-b border-gray-100">
        {/* Total Budget */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Total Budget
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₱{totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Total Expenses
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">
              ₱{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Remaining Bal.
          </div>
          <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₱{Math.abs(remainingBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Utilization Rate */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Utilization Rate
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {utilizationRate.toFixed(1)}%
            </span>
            <Target className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <DollarSign className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Expense Data Available
            </h3>
            <p className="text-sm text-gray-600 max-w-sm">
              There are no expense entries to display for {QUARTER_LABELS[activeQuarter]} {currentYear}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quarter Selection */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Expenses by Budget Item
              </h3>
              <div className="inline-flex items-center bg-muted rounded-md p-1">
                {(["Q1", "Q2", "Q3", "Q4"] as const).map((quarter) => (
                  <button
                    key={quarter}
                    onClick={() => setActiveQuarter(quarter)}
                    className={cn(
                      "px-3 py-1 text-sm font-medium rounded-md transition-all",
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
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.6}/>
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
                      cursor={{ fill: 'rgba(239, 68, 68, 0.1)' }}
                      content={
                        <ChartTooltipContent
                          className="w-[220px] border shadow-lg bg-white"
                          formatter={(value, name, props) => {
                            const itemName = props?.payload?.name;
                            const totalSpent = Number(value);
                            const budgetAmount = budgetMap.get(itemName) ?? 0;
                            const remaining = budgetAmount - totalSpent;
                            
                            return (
                              <div className="space-y-1">
                                <div className="font-semibold text-gray-900">{itemName}</div>
                                <div className="font-medium text-red-600">
                                  Spent: ₱{totalSpent.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </div>
                                <div className={`font-medium ${remaining >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                                  Remaining: ₱{Math.abs(remaining).toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}
                                </div>
                              </div>
                            );
                          }}
                        />
                      }
                    />
                    <Bar
                      dataKey="amount"
                      fill="url(#colorExpense)"
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
              {/* Budget Items Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {QUARTER_LABELS[activeQuarter]} Summary
                </h3>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {chartData.map((item) => {
                    const budgetAmount = budgetMap.get(item.name) ?? 0;
                    const utilizationPct = budgetAmount > 0 
                      ? ((item.amount / budgetAmount) * 100).toFixed(1)
                      : '0.0';
                    
                    return (
                      <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{item.name}</div>
                          <div className="text-sm text-gray-500">
                            {utilizationPct}% of budget
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-semibold text-red-600">
                            ₱{item.amount.toLocaleString(undefined, { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </div>
                          {item.name === highestSpendingItem?.name && (
                            <div className="text-xs text-orange-600 font-medium">Highest</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Budget Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Status</h3>
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Budget Utilization</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {utilizationRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        utilizationRate > 90 ? 'bg-red-500' : 
                        utilizationRate > 75 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {remainingBudget >= 0 
                      ? `₱${remainingBudget.toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} remaining` 
                      : `₱${Math.abs(remainingBudget).toLocaleString(undefined, { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} over budget`
                    }
                  </div>

                  {/* Quarterly Breakdown */}
                  <div className="pt-4 border-t space-y-2">
                    <div className="text-sm font-medium text-gray-600 mb-2">Quarterly Breakdown</div>
                    {(["Q1", "Q2", "Q3", "Q4"] as const).map((quarter) => (
                      <div key={quarter} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{QUARTER_LABELS[quarter]}</span>
                        <span className={cn(
                          "font-medium",
                          activeQuarter === quarter ? "text-red-600" : "text-gray-900"
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}






