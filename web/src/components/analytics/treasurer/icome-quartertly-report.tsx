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






import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useIncomeData } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerIncomeExpenseFetchQueries";
import { getQuarterlyIncomeByItem } from "@/pages/record/treasurer/treasurer-income-expense-tracker/queries/treasurerQuarterlyIncExp";
import { cn } from "@/lib/utils";


export function IncomeQuarterlyChart() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading, error } = useIncomeData(currentYear);
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
          Failed to load income data
        </CardContent>
      </Card>
    );
  }

  // Extract the results array from the paginated response
  const incomeData = data.results || [];
  const fullQuarterData = getQuarterlyIncomeByItem(incomeData);
  const chartData = fullQuarterData
    .map(item => ({
      name: item.name,
      amount: item[activeQuarter] ?? 0,
    }))
    .filter(item => item.amount > 0);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 p-1 mb-2 text-[20px]">
          {currentYear} Quarterly Income
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="inline-flex items-center bg-muted rounded-md p-1">
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
                "px-2 py-1 text-sm font-medium rounded-md transition-colors",
                activeQuarter === key
                  ? "bg-white text-black text-foreground shadow-sm"
                  : "text-muted-foreground bg-transparent hover:bg-white/10"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-[300px]">
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `₱${Number(value).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`,
                    "Income",
                  ]}
                />
                <Bar
                  dataKey="amount"
                  name={`Income (${activeQuarter})`}
                  fill="#2563EB"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}