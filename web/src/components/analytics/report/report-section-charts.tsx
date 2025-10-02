import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, BarChart3, AlertCircle } from "lucide-react";
import { useGetChartAnalytics } from "./report-analytics-queries";
import { useLoading } from "@/context/LoadingContext";
import React from "react";
import { Spinner } from "@/components/ui/spinner";

export default function ReportSectionCharts() {
  const { showLoading, hideLoading } = useLoading();
  const { data: reportChartAnalytics = [], isLoading, error } = useGetChartAnalytics();

  const totalReports = reportChartAnalytics.reduce((acc: number, data: any) => acc + (data.report || 0), 0);
  const averageReports = reportChartAnalytics.length > 0 ? Math.round(totalReports / reportChartAnalytics.length) : 0;
  
  // Calculate trend
  const midPoint = Math.floor(reportChartAnalytics.length / 2);
  const firstHalf = reportChartAnalytics.slice(0, midPoint);
  const secondHalf = reportChartAnalytics.slice(midPoint);
  
  const firstHalfTotal = firstHalf.reduce((acc: number, data: any) => acc + (data.report || 0), 0);
  const secondHalfTotal = secondHalf.reduce((acc: number, data: any) => acc + (data.report || 0), 0);
  
  const firstHalfAvg = firstHalf.length > 0 ? firstHalfTotal / firstHalf.length : 0;
  const secondHalfAvg = secondHalf.length > 0 ? secondHalfTotal / secondHalf.length : 0;
  
  const trendPercentage = firstHalfAvg > 0 
    ? Math.round(((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100)
    : 0;
  
  const isIncreasing = trendPercentage > 0;
  const peakDay = reportChartAnalytics.reduce((max: any, current: any) => 
    (current.report > (max?.report || 0)) ? current : max, 
    reportChartAnalytics[0]
  );

  const chartConfig = {
    report: {
      label: "Incident Reports",
      color: "hsl(220, 90%, 56%)",
    },
  };

  React.useEffect(() => {
    if(isLoading) showLoading();
    else hideLoading();
  }, [isLoading]);

  if (error) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="flex items-center justify-center py-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load chart data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="w-full h-full border-none shadow-none">
        <Spinner size="md" />
      </Card>
    );
  }

  return (
    <Card className="w-full border-none shadow-none">
      {/* Header */}
      <CardHeader className="border-b border-gray-100 bg-white p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Incident Reports Overview</CardTitle>
            <CardDescription className="text-sm text-gray-600 mt-1">
              Tracking incident reports over the last 3 months
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x bg-gray-50/50 border-b border-gray-100">
        {/* Total Reports */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Total Reports</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {totalReports.toLocaleString()}
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

        {/* Daily Average */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Daily Average</div>
          <div className="text-2xl font-bold text-gray-900">
            {averageReports.toLocaleString()}
          </div>
        </div>

        {/* Peak Day */}
        <div className="px-6 py-4">
          <div className="text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Peak Day</div>
          {peakDay ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">
                {peakDay.report}
              </span>
              <span className="text-xs text-gray-500">
                {new Date(peakDay.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          ) : (
            <span className="text-2xl font-bold text-gray-900">0</span>
          )}
        </div>
      </div>

      <CardContent className="p-6">
        {reportChartAnalytics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-gray-100 p-6 mb-4">
              <BarChart3 className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-sm text-gray-600 max-w-sm">
              There are no incident reports to display for the selected time period.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportChartAnalytics}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 20,
                  }}
                >
                  <defs>
                    <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
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
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    minTickGap={32}
                    className="text-xs"
                    tick={{ fill: '#6b7280' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={12}
                    className="text-xs"
                    tick={{ fill: '#6b7280' }}
                    allowDecimals={false}
                    tickFormatter={(value) => Math.round(value).toString()}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                    content={
                      <ChartTooltipContent
                        className="w-[200px] border shadow-lg bg-white"
                        labelFormatter={(value) => {
                          return new Date(value).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          });
                        }}
                        formatter={(value) => [
                          <span className="font-semibold">{value} reports</span>, 
                          "Incidents"
                        ]}
                      />
                    }
                  />
                  <Bar
                    dataKey="report"
                    fill="url(#colorReport)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={50}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}