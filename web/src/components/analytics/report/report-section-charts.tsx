import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, BarChart3, AlertCircle } from "lucide-react"
import { useGetChartAnalytics } from "./report-analytics-queries"

export default function ReportSectionCharts() {
  const { data: reportChartAnalytics = [], isLoading, error } = useGetChartAnalytics()

  const totalReports = reportChartAnalytics.reduce((acc: number, data: any) => acc + (data.report || 0), 0)
  const averageReports = reportChartAnalytics.length > 0 ? Math.round(totalReports / reportChartAnalytics.length) : 0

  const chartConfig = {
    report: {
      label: "Incident Reports",
      color: "hsl(var(--primary))",
    },
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load chart data. Please try again later.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">Incident Reports Overview</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Tracking incident reports over the last 3 months
          </CardDescription>
        </div>

        {/* Stats Section */}
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-1 border-t px-6 py-4 sm:border-r sm:border-t-0">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Reports</span>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground sm:text-3xl">
                    {totalReports.toLocaleString()}
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 border-t px-6 py-4 sm:border-t-0">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Daily Average</span>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-2xl font-bold text-foreground sm:text-3xl">
                  {averageReports.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-[300px] w-full" />
          </div>
        ) : reportChartAnalytics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              There are no incident reports to display for the selected time period.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
            <BarChart
              accessibilityLayer
              data={reportChartAnalytics}
              margin={{
                top: 20,
                right: 20,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted/30" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                className="text-xs"
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                className="text-xs"
                tickFormatter={(value) => value.toString()}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px] border shadow-lg"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    formatter={(value) => [`${value} reports`, "Incidents"]}
                  />
                }
              />
              <Bar
                dataKey="report"
                fill="var(--color-report)"
                radius={[4, 4, 0, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
