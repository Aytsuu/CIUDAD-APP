import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, BarChart3 } from "lucide-react";
import { useGetStaffAttendanceRanking, useGetCouncilEvents } from "./ce-event-analytics-queries";

export default function StaffAttendanceRankingChart() {
  const { data: rankingData = [], isLoading, error } = useGetStaffAttendanceRanking();
  const currentYear = new Date().getFullYear();
  const { data: councilEvents = [] } = useGetCouncilEvents();
  const totalMeetings = councilEvents.filter(
    (event) => event.ce_type === "meeting" && event.ce_is_archive === false && new Date(event.ce_date).getFullYear() === currentYear
  ).length;
  const averageMeetings = rankingData.length > 0 ? Math.round(totalMeetings / rankingData.length) : 0;

  const chartConfig = {
    attendance_count: {
      label: "Meetings Attended",
      color: "hsl(var(--primary))",
    },
  };

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center text-destructive">
            Failed to load attendance data. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-xl">Staff Meeting Attendance Ranking</CardTitle>
          </div>
          <CardDescription className="text-sm text-muted-foreground">
            Top staff by number of council meetings attended in {currentYear}
          </CardDescription>
        </div>

        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-1 border-t px-6 py-4 sm:border-r sm:border-t-0">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Meetings</span>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-foreground sm:text-3xl">
                    {totalMeetings.toLocaleString()}
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-1 border-t px-6 py-4 sm:border-t-0">
            <div className="flex flex-col space-y-1">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Average per Staff</span>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <span className="text-2xl font-bold text-foreground sm:text-3xl">
                  {averageMeetings.toLocaleString()}
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
        ) : rankingData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Data Available</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              There are no meeting attendance records for {currentYear}.
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[350px] w-full">
            <BarChart
              layout="vertical"
              data={rankingData}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-muted/30" />
              <YAxis
                dataKey="atn_name"
                type="category"
                width={120}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) => 
                  value.length > 20 ? `${value.substring(0, 17)}...` : value
                }
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={1}
                className="text-xs"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[180px] border shadow-lg"
                    labelFormatter={(value: string) => value}
                    formatter={(props: any) => [
                      `Designation: ${props.payload?.atn_designation || 'N/A'}`
                    ]}
                  />
                }
              />
              <Bar
                dataKey="attendance_count"
                fill="var(--color-attendance_count)"
                radius={[0, 4, 4, 0]}
                className="hover:opacity-80 transition-opacity"
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}