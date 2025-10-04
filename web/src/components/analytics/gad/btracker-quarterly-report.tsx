// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Skeleton } from "@/components/ui/skeleton";
// import { TrendingDown } from "lucide-react";
// import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
// import { Progress } from "@/components/ui/progress";
// import { Label } from "@/components/ui/label";
// import { useQuarterlyBudget, useGetGADYearBudgets } from "./btracker-analytics-queries";
// import { cn } from "@/lib/utils"

// export function GADQuarterlyBudgetChart() {
//   const currentYear = new Date().getFullYear().toString();
//   const { data: quarterlyData, isLoading: quarterlyLoading, error: quarterlyError } = useQuarterlyBudget(currentYear);
//   const { data: yearlyData, isLoading: yearlyLoading, error: yearlyError } = useGetGADYearBudgets();

//   // Find current year's data
//   const yearlySummary = yearlyData?.find(y => y.gbudy_year === currentYear) || {
//     gbudy_budget: 0,
//     gbudy_expenses: 0
//   };

//   const isLoading = quarterlyLoading || yearlyLoading;
//   const isError = quarterlyError || yearlyError;

//   // Calculate progress percentage
//   const progressPercentage = yearlySummary.gbudy_budget > 0 
//     ? (yearlySummary.gbudy_expenses / yearlySummary.gbudy_budget) * 100 
//     : 0;

//   if (isLoading) {
//     return (
//       <Card className="w-full">
//         <CardContent className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             {[...Array(4)].map((_, i) => (
//               <Skeleton key={i} className="h-24 rounded-lg" />
//             ))}
//           </div>
//           <Skeleton className="h-6 w-full" />
//           <Skeleton className="h-[300px] w-full" />
//         </CardContent>
//       </Card>
//     );
//   }

//   if (isError) {
//     return (
//       <Card className="w-full">
//         <CardContent className="flex items-center justify-center py-8 text-destructive">
//           Failed to load budget data
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2 p-1 mb-2">
//           {currentYear} Budget Overview
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-6">
//         {/* Yearly Summary Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className="border rounded-lg p-4">
//             <Label className="text-muted-foreground">Total Budget</Label>
//             <div className="text-2xl font-bold">₱{yearlySummary.gbudy_budget.toLocaleString()}</div>
//           </div>
//           <div className="border rounded-lg p-4">
//             <Label className="text-muted-foreground">Total Expenses</Label>
//             <div className="text-2xl font-bold text-red-600">₱{yearlySummary.gbudy_expenses.toLocaleString()}</div>
//           </div>
//           <div className="border rounded-lg p-4">
//             <Label className="text-muted-foreground">Remaining Balance</Label>
//             <div className={`text-2xl font-bold ${
//               (yearlySummary.gbudy_budget - yearlySummary.gbudy_expenses) >= 0 ? 
//               'text-green-600' : 'text-red-600'
//             }`}>
//               ₱{(yearlySummary.gbudy_budget - yearlySummary.gbudy_expenses).toLocaleString()}
//             </div>
//           </div>
//         </div>

//         {/* Budget Progress */}
//         <div className="space-y-2">
//           <div className="flex justify-between">
//             <Label>Budget Utilization</Label>
//             <span className="text-sm font-medium">
//               {progressPercentage.toFixed(2)}%
//             </span>
//           </div>
//           <Progress 
//             value={progressPercentage} 
//            className={cn(
//                 "h-2",
//                 progressPercentage > 90 ? 'bg-red-500' : 'bg-blue-500'
//             )}
//           />
//         </div>

//         {/* Quarterly Breakdown */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="h-[300px]">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={quarterlyData}>
//                 <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                                 <Tooltip 
//                   formatter={(value, name) => [`₱${value.toLocaleString()}`, name]}
//                   labelFormatter={(label) => `${label} Quarter`}
//                 />
//                 <Legend />
//                 <Bar dataKey="expense" fill="#f87171" name="Expense" />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>
//           <div className="space-y-4">
//             {quarterlyData?.map((quarter) => (
//               <Card key={quarter.name}>
//                 <CardContent className="p-4">
//                   <div className="flex justify-between items-center">
//                     <h3 className="font-medium">{quarter.name} Quarter</h3>
//                     {/* <span className={`text-sm font-medium ${
//                       quarter.net >= 0 ? 'text-green-500' : 'text-red-500'
//                     }`}>
//                       {quarter.net >= 0 ? '+' : ''}₱{Math.abs(quarter.net).toLocaleString()}
//                     </span> */}
//                   </div>
//                   <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
//                     <div className="flex items-center text-red-500">
//                       <TrendingDown className="h-4 w-4 mr-1" />
//                       <span>₱{quarter.expense.toLocaleString()}</span>
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }