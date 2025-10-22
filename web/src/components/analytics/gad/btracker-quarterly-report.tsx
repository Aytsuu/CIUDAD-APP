import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Target } from "lucide-react";
import { useQuarterlyBudget, useGetGADYearBudgets } from "./btracker-analytics-queries";
import { useLoading } from "@/context/LoadingContext";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

export function GADQuarterlyBudgetChart() {
  const { showLoading, hideLoading } = useLoading();
  const currentYear = new Date().getFullYear().toString();
  
  const { data: quarterlyData = [], isLoading: quarterlyLoading, error: quarterlyError } = useQuarterlyBudget(currentYear);
  const { data: yearlyData = [], isLoading: yearlyLoading, error: yearlyError } = useGetGADYearBudgets();

  const isLoading = quarterlyLoading || yearlyLoading;
  const error = quarterlyError || yearlyError;

  // Find current year's data
  const yearlySummary = yearlyData?.find((y: any) => y.gbudy_year === currentYear) || {
    gbudy_budget: 0,
    gbudy_expenses: 0
  };

  // Calculate analytics
  const totalBudget = yearlySummary.gbudy_budget || 0;
  const totalExpenses = yearlySummary.gbudy_expenses || 0;
  const remainingBudget = totalBudget - totalExpenses;
  const utilizationRate = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;

  // Calculate trend from quarterly data
  const firstHalfExpenses = quarterlyData?.slice(0, 2)?.reduce((sum: number, quarter: any) => sum + quarter.expense, 0) || 0;
  const secondHalfExpenses = quarterlyData?.slice(2)?.reduce((sum: number, quarter: any) => sum + quarter.expense, 0) || 0;
  
  const firstHalfAvg = firstHalfExpenses / 2;
  const secondHalfAvg = secondHalfExpenses / 2;
  
  const trendPercentage = firstHalfAvg > 0 
    ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
    : 0;
  
  const isIncreasing = trendPercentage > 0;

  // Find highest spending quarter
  const highestSpendingQuarter = quarterlyData?.reduce((max: any, current: any) => 
    (current.expense > (max?.expense || 0)) ? current : max, 
    quarterlyData[0]
  );

  const chartConfig = {
    expense: {
      label: "Quarterly Expenses",
      color: "hsl(220, 90%, 56%)",
    },
  };

  React.useEffect(() => {
    if(isLoading) showLoading();
    else hideLoading();
  }, [isLoading, showLoading, hideLoading]);

  if (error) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex items-center justify-center py-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load budget data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="flex items-center justify-center py-16">
          <Spinner size="md" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      {/* Header */}
      <CardHeader className="border-b border-gray-100 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">GAD Budget Overview</CardTitle>
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
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Total Budget</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ₱{totalBudget.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Total Expenses</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600">
              ₱{totalExpenses.toLocaleString()}
            </span>
            {trendPercentage !== 0 && (
              <div className={`flex items-center gap-1 ${isIncreasing ? 'text-red-600' : 'text-green-600'}`}>
                {isIncreasing ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-semibold">
                  {isIncreasing ? '+' : ''}{trendPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Remaining Bal.</div>
          <div className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ₱{Math.abs(remainingBudget).toLocaleString()}
          </div>
        </div>

        {/* Utilization Rate */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Utilization Rate</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {utilizationRate.toFixed(1)}%
            </span>
            <Target className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        {quarterlyData?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <DollarSign className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Budget Data Available</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              There are no budget entries to display for {currentYear}.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quarterly Breakdown Chart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Expense Breakdown</h3>
              <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={quarterlyData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 20,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
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
                      cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      content={
                        <ChartTooltipContent
                          className="w-[200px] border shadow-lg bg-white"
                          formatter={(value) => [
                            <span className="font-semibold">₱{Number(value).toLocaleString()}</span>, 
                            "Expenses"
                          ]}
                        />
                      }
                    />
                    <Bar
                      dataKey="expense"
                      fill="url(#colorExpense)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={50}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Quarter Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quarterly Summary</h3>
                <div className="space-y-3">
                  {quarterlyData?.map((quarter: any) => (
                    <div key={quarter.name} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                      <div>
                        <div className="font-medium text-gray-900">{quarter.name} Quarter</div>
                        <div className="text-sm text-gray-500">
                          {totalBudget > 0 ? `${((quarter.expense / totalBudget) * 100).toFixed(1)}% of total budget` : 'No budget allocated'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-red-600">
                          ₱{quarter.expense.toLocaleString()}
                        </div>
                        {quarter.name === highestSpendingQuarter?.name && (
                          <div className="text-xs text-orange-600 font-medium">Highest</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Budget Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Status</h3>
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">Budget Utilization</span>
                    <span className="text-sm font-semibold text-gray-900">{utilizationRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        utilizationRate > 90 ? 'bg-red-500' : 
                        utilizationRate > 75 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {remainingBudget >= 0 
                      ? `₱${remainingBudget.toLocaleString()} remaining` 
                      : `₱${Math.abs(remainingBudget).toLocaleString()} over budget`
                    }
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