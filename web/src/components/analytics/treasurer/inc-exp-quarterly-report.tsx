//LATEST BUT NOT IN PARTICULARS
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/card";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useIncomeExpense } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerQuarterlyIncExp";
import { IncomeExpense } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
import { useBudgetItems } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
import { cn } from "@/lib/utils";

// Group expenses by exp_budget_item and quarter
interface BudgetItemQuarterData {
  name: string; // exp_budget_item
  Q1?: number;
  Q2?: number;
  Q3?: number;
  Q4?: number;
}

const getQuarterlyByBudgetItem = (expenses: IncomeExpense[]): BudgetItemQuarterData[] => {
  const grouped: Record<string, BudgetItemQuarterData> = {};
  
  console.log("GRAPH: ", expenses)
  expenses.forEach(item => {
    if (item.iet_entryType !== 'Expense') return;

    const date = new Date(item.iet_datetime);
    if (isNaN(date.getTime())) return;

    const quarter = `Q${Math.floor((date.getMonth() + 3) / 3)}` as 'Q1' | 'Q2' | 'Q3' | 'Q4';
    // const amount = item.iet_actual_amount ?? item.iet_amount ?? 0;
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

export function IncomeExpenseQuarterlyChart() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading, error } = useIncomeExpense(currentYear);
  const { data: budgetItems = [] } = useBudgetItems(currentYear);
  const [activeQuarter, setActiveQuarter] = useState<"Q1" | "Q2" | "Q3" | "Q4">("Q1");

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <div className="h-[300px]">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8 text-destructive">
          Failed to load expense data
        </CardContent>
      </Card>
    );
  }

    const budgetMap = new Map(
        (budgetItems ?? []).map((item) => [item.name, item.proposedBudget])
    );

  const fullQuarterData = getQuarterlyByBudgetItem(data.allData);
  const chartData = fullQuarterData
    .map(item => ({
      name: item.name,
      amount: item[activeQuarter] ?? 0,
    }))
    .filter(item => item.amount > 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 p-1 mb-2">
          {currentYear} Quarterly Expenses
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quarter Selection Tabs */}
        <div className="flex gap-2">
            {[
                { key: "Q1", label: "Jan–Mar" },
                { key: "Q2", label: "Apr–Jun" },
                { key: "Q3", label: "Jul–Sep" },
                { key: "Q4", label: "Oct–Dec" },
            ].map(({ key, label }) => (
            <button
                key={key}
                onClick={() => setActiveQuarter(key as "Q1" | "Q2" | "Q3" | "Q4")}
                className={cn(
                "px-4 py-1 rounded font-medium text-sm border transition-colors",
                activeQuarter === key
                    ? "bg-red-500 text-white border-red-500"
                    : "bg-white text-muted-foreground border-muted"
                )}
            >
                {label}
            </button>
            ))}
        </div>

        {/* Bar Chart */}
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                    content={({ active, payload }) => {
                        if (active && payload?.length) {
                        const item = payload[0];
                        const itemName = item?.payload?.name;
                        const totalSpent = Number(item?.value);
                        const remainingBudget = budgetMap.get(itemName);

                            return (
                                <div className="rounded-md border bg-white p-2 shadow-md text-sm">
                                    <div className="font-semibold mb-1">{itemName}</div>
                                    <div className="font-medium text-red-600">
                                        Spent: ₱{totalSpent.toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                    <div className="font-medium text-green-600">
                                        Remaining Budget: ₱{(remainingBudget ?? 0).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Bar
                  dataKey="amount"
                  name={`Expenses (${activeQuarter})`}
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data available for {activeQuarter}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
