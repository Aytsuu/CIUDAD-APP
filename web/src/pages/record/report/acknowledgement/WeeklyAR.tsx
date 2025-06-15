import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, AlertCircle, Clock, TrendingUp, MoveRight } from "lucide-react"
import { useGetWeeklyAR } from "../queries/reportFetch"
import { getMonthName, getMonths, getWeekNumber } from "@/helpers/dateFormatter"
import { useNavigate } from "react-router"

export default function WeeklyAR() {
  const navigate = useNavigate();
  const { data: weeklyAR, isLoading, error } = useGetWeeklyAR();
  const months = getMonths;

  console.log(weeklyAR)

  // Group data by month and week for better organization
  const organizedData = months
    .map((month) => {
      const monthData =
        weeklyAR?.filter(
          (war: any) => month === getMonthName(war.date)
        ) || [];

      // Group by week within the month
      const weekGroups = monthData.reduce((acc: any, war: any) => {
        const weekNo = getWeekNumber(war.date);
        if (!acc[weekNo]) {
          acc[weekNo] = [];
        }
        acc[weekNo].push(war);
        return acc;
      }, {});

      return {
        month,
        weeks: Object.entries(weekGroups)
          .map(([weekNo, ars]) => ({
            weekNo: Number.parseInt(weekNo),
            data: ars as any[],
          }))
          .sort((a, b) => a.weekNo - b.weekNo),
        hasData: monthData.length > 0,
      };
    })
    .filter((monthData) => monthData.hasData);

  // Get recent reports (last 7 days or most recent 10 items)
  const recentReports = weeklyAR
    ? [...weeklyAR]
        .sort(
          (a, b) =>
            new Date(b.war_created_at).getTime() -
            new Date(a.war_created_at).getTime()
        )
        .slice(0, 8)
    : [];

  if (isLoading) {
    return;
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Error Loading Data
          </h3>
          <p className="text-muted-foreground">
            Failed to load weekly AR report data.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-darkBlue2">
              Weekly Accomplishment Report
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Manage and view weekly accomplishment reports
            </p>
          </div>
          <Badge variant="secondary" className="ml-auto">
            {organizedData.length}{" "}
            {organizedData.length === 1 ? "Month" : "Months"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Accordion Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                <Accordion type="multiple" className="w-full">
                  {organizedData.map(({ month, weeks }) => (
                    <AccordionItem
                      key={month}
                      value={month}
                      className="border-b last:border-b-0"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">{month}</span>
                          <Badge variant="outline" className="ml-2">
                            {weeks.length}{" "}
                            {weeks.length === 1 ? "Week" : "Weeks"}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <Accordion type="multiple" className="w-full">
                          {weeks.map(({ weekNo, data }) => (
                            <AccordionItem
                              key={`week-${weekNo}`}
                              value={`week-${weekNo}`}
                              className="border-b last:border-b-0"
                            >
                              <AccordionTrigger className="py-3 hover:bg-muted/30">
                                <div className="flex items-center justify-between w-full mr-4">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-medium">
                                      Week {weekNo}
                                    </span>
                                  </div>
                                  <Badge variant="secondary">
                                    {data.reduce(
                                      (total, war) =>
                                        total + war.war_composition.length,
                                      0
                                    )}{" "}
                                    Reports
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2 pb-3">
                                <div className="space-y-2">
                                  {data.map((war, arIndex) => (
                                    <div
                                      key={`${month}-week-${weekNo}-ar-${arIndex}`}
                                      className="space-y-1"
                                    >
                                      {war.war_composition.map(
                                        (comp: any, compIndex: number) => (
                                          <div
                                            key={`${month}-week-${weekNo}-ar-${arIndex}-comp-${compIndex}`}
                                            className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-primary rounded-full" />
                                              <span className="font-mono text-sm">
                                                {comp.ar.ar_id}
                                              </span>
                                              {comp.ar.ar_title && (
                                                <span className="text-sm text-muted-foreground">
                                                  - {comp.ar.ar_title}
                                                </span>
                                              )}
                                            </div>
                                            {comp.ar.ar_status && (
                                              <Badge
                                                variant={
                                                  comp.ar.ar_status === "Signed"
                                                    ? "default"
                                                    : "secondary"
                                                }
                                                className="text-xs"
                                              >
                                                {comp.ar.ar_status}
                                              </Badge>
                                            )}
                                          </div>
                                        )
                                      )}
                                      <div className="w-full flex justify-end">
                                        <label className="flex gap-2 cursor-pointer"
                                          onClick={() => {
                                            navigate('/report/acknowledgement/document', {
                                              state: {
                                                params: {
                                                  type: "WAR",
                                                  data: war
                                                }
                                              }
                                            });
                                          }}
                                        >
                                          <span>View</span>
                                          <MoveRight />
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Recent Reports Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentReports.length > 0 ? (
                  recentReports.map((report, index) => (
                    <div
                      key={`recent-${report.war_id}-${index}`}
                      className="p-3 bg-muted/20 rounded-lg border hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-primary" />
                          <span className="text-sm font-medium">
                            Week {getWeekNumber(report.date)}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {report.war_composition.length}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {getMonthName(report.date)} •{" "}
                        {new Date(report.date).toLocaleDateString()}
                      </div>
                      <div className="space-y-1">
                        {report.war_composition
                          .slice(0, 2)
                          .map((comp: any, compIndex: number) => (
                            <div
                              key={`recent-comp-${compIndex}`}
                              className="text-xs"
                            >
                              <span className="font-mono text-primary">
                                {comp.ar.ar_id}
                              </span>
                              {comp.ar.ar_status && (
                                <Badge
                                  variant={
                                    comp.ar.ar_status === "Signed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className="text-xs ml-2 h-4"
                                >
                                  {comp.ar.ar_status}
                                </Badge>
                              )}
                            </div>
                          ))}
                        {report.war_composition.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{report.war_composition.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No recent reports
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
