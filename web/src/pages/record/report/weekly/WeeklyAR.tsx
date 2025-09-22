import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select/select"
import { Calendar, FileText, AlertCircle, MoveRight, CalendarDays, Loader2, Plus } from "lucide-react"
import { useGetWeeklyAR } from "../queries/reportFetch"
import { getAllWeeksInMonth, getMonthName, getMonths, getRangeOfDaysInWeek, getWeekNumber, hasWeekPassed } from "@/helpers/dateHelper"
import { Link, useNavigate } from "react-router"
import RecentWeeklyAR from "./RecentWeeklyAR"
import { MainLayoutComponent } from "@/components/ui/layout/main-layout-component"
import { Button } from "@/components/ui/button/button"

export default function WeeklyAR() {
  const navigate = useNavigate()
  const { data: weeklyAR, isLoading, error } = useGetWeeklyAR()

  // Year selection state
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)

  const getYearOptions = () => {
    if (!weeklyAR || weeklyAR.length === 0) {
      // If no data, only show current year
      return [currentYear]
    }

    // Find the earliest year in the data
    const earliestDate = weeklyAR.reduce((earliest: any, war: any) => {
      const warDate = new Date(war.created_for)
      return warDate < earliest ? warDate : earliest
    }, new Date(weeklyAR[0].created_for))

    const earliestYear = earliestDate.getFullYear()

    // Generate array from earliest year to current year
    const yearRange = currentYear - earliestYear + 1
    return Array.from({ length: yearRange }, (_, i) => earliestYear + i).reverse()
  }

  const yearOptions = getYearOptions()
  const months = getMonths

  // Filter data by selected year
  const filteredWeeklyAR =
    weeklyAR?.filter((war: any) => {
      const warYear = new Date(war.created_for).getFullYear()
      return warYear === selectedYear
    }) || []

  // Group data by month and week for better organization
  const organizedData = months
    .map((month) => {
      const monthData = filteredWeeklyAR?.filter((war: any) => month === getMonthName(war.created_for)) || []

      // Group by week within the month
      const weekGroups = monthData.reduce((acc: any, war: any) => {
        const weekNo = getWeekNumber(war.created_for)
        if (!acc[weekNo]) {
          acc[weekNo] = []
        }
        acc[weekNo].push(war)
        return acc
      }, {})

      // Get all possible weeks for this month
      const allWeeksInMonth = getAllWeeksInMonth(month, selectedYear)
      const existingWeeks = Object.keys(weekGroups).map(Number)
      const missingWeeks = allWeeksInMonth.filter((week) => !existingWeeks.includes(week))

      // Calculate missed weeks (only those that have passed)
      const missedWeeksPassed = missingWeeks.filter((weekNo) => hasWeekPassed(month, weekNo, selectedYear))

      return {
        month,
        weeks: Object.entries(weekGroups)
          .map(([weekNo, ars]) => ({
            weekNo: Number.parseInt(weekNo),
            data: ars as any[],
          }))
          .sort((a, b) => a.weekNo - b.weekNo),
        missingWeeks: missingWeeks.sort((a, b) => a - b),
        missedWeeksPassed: missedWeeksPassed.length,
        allWeeksInMonth: allWeeksInMonth,
        hasData: monthData.length > 0,
      }
    })
    .filter((monthData) => monthData.hasData || monthData.missingWeeks.length > 0)

  {process.env.NODE_ENV === 'development' && console.log(organizedData)}

  // Get recent reports (last 7 days or most recent 10 items) for selected year
  const recentReports = filteredWeeklyAR
    ? [...filteredWeeklyAR]
        .sort((a, b) => new Date(b.war_created_at).getTime() - new Date(a.war_created_at).getTime())
        .slice(0, 8)
    : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">
              <Loader2 className="w-full text-center animate-spin mb-2"/>
              Please wait while we load your report records...
            </div>
          </div>
        </div>
      </div>
    )
  }


  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground">Failed to load weekly AR report data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <MainLayoutComponent
      title="Weekly Accomplishment Report"
      description="Manage and view weekly accomplishment reports"
    >
      <div className="flex flex-col sm:flex-row items-start justify-end sm:items-center gap-4 mb-6">
        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedYear.toString()}
              onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Badge variant="secondary">
            {organizedData.length} {organizedData.length === 1 ? "Month" : "Months"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Accordion Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-0">
              {organizedData.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                  <p className="text-muted-foreground">No weekly accomplishment reports found for {selectedYear}.</p>
                </div>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {organizedData.map(({ month, weeks, missedWeeksPassed, missingWeeks, allWeeksInMonth }) => (
                    <AccordionItem key={month} value={month} className="border-b last:border-b-0">
                      <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 hover:no-underline ">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4" />
                          <span className="font-medium">
                            {month} {selectedYear}
                          </span>
                          <Badge variant="outline" className="ml-2">
                            {weeks.length} / {allWeeksInMonth.length} Weeks
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-4">
                        <Accordion type="single" collapsible className="w-full">
                          {allWeeksInMonth.map((week) => {

                            if(weeks.map(({weekNo}) => weekNo).includes(week)) {
                              const filter = weeks.filter(({weekNo}) => weekNo == week)[0];
                              const { weekNo, data } = filter;
                              return (
                                <AccordionItem
                                  key={`week-${week}`}
                                  value={`week-${week}`}
                                  className="border-b last:border-b-0"
                                >
                                  <AccordionTrigger className="py-3 hover:bg-muted/30 hover:no-underline">
                                    <div className="flex items-center justify-between w-full mr-4">
                                      <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4" />
                                        <span className="font-medium">Week {weekNo}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {data.map((war, index) => (
                                          <Badge
                                            key={index}
                                            variant={"outline"}
                                            className={`text-white border-none ${
                                              war.war_files.length > 0 ? "bg-green-500" : "bg-orange-500"
                                            }`}
                                          >
                                            {war.war_files.length > 0 ? "Signed" : "Unsigned"}
                                          </Badge>
                                        ))}
                                        <Badge variant="secondary">
                                          {data.reduce((total, war) => total + war.war_composition.length, 0)} Reports
                                        </Badge>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="pt-2 pb-3">
                                    <div className="space-y-2">
                                      {data.map((war, arIndex) => (
                                        <>
                                          <div key={`${month}-week-${weekNo}-ar-${arIndex}`} className="space-y-1">
                                            {war.war_composition.map((comp: any, compIndex: number) => (
                                              <div
                                                key={`${month}-week-${weekNo}-ar-${arIndex}-comp-${compIndex}`}
                                                className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                                  <span className="font-mono text-sm">Report No. {comp.ar.id}</span>
                                                  {comp.ar.ar_title && (
                                                    <span className="text-sm text-muted-foreground">
                                                      - {comp.ar.ar_title}
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          {arIndex + 1 == data.length && (
                                            <div className="w-full flex justify-end">
                                              <label
                                                className="flex gap-2 cursor-pointer"
                                                onClick={() => {
                                                  navigate("/report/acknowledgement/document", {
                                                    state: {
                                                      params: {
                                                        type: "WAR",
                                                        data: {
                                                        ...war,
                                                        reportPeriod: getRangeOfDaysInWeek(weekNo, month, selectedYear)
                                                        },
                                                      },
                                                    },
                                                  })
                                                }}
                                              >
                                                <span>View</span>
                                                <MoveRight />
                                              </label>
                                            </div>
                                          )}
                                        </>
                                      ))}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )
                            }

                            if((missingWeeks.includes(week) && missedWeeksPassed >= week) || week == getWeekNumber(new Date().toDateString())) {
                              return (
                                <div className="flex items-center justify-between w-full mr-4">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-black/40" />
                                    <span className="font-medium text-black/40">Week {week}</span>
                                  </div>
                                  <Link to={"missing-report/create"}
                                    state={{
                                      params: {
                                        year: selectedYear,
                                        month: month,
                                        week: week,
                                      }
                                    }}
                                  >
                                    <Button variant={"link"} className="text-black/40 text-[13px] hover:text-black/80">
                                      <Plus />
                                      Create
                                    </Button>
                                  </Link>
                                </div>
                              )
                            }            
                          })}
                          {/* {weeks.map(({ weekNo, data }) => (
                            <AccordionItem
                              key={`week-${weekNo}`}
                              value={`week-${weekNo}`}
                              className="border-b last:border-b-0"
                            >
                              <AccordionTrigger className="py-3 hover:bg-muted/30 hover:no-underline">
                                <div className="flex items-center justify-between w-full mr-4">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-medium">Week {weekNo}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {data.map((war, index) => (
                                      <Badge
                                        key={index}
                                        variant={"outline"}
                                        className={`text-white border-none ${
                                          war.war_files.length > 0 ? "bg-green-500" : "bg-orange-500"
                                        }`}
                                      >
                                        {war.war_files.length > 0 ? "Signed" : "Unsigned"}
                                      </Badge>
                                    ))}
                                    <Badge variant="secondary">
                                      {data.reduce((total, war) => total + war.war_composition.length, 0)} Reports
                                    </Badge>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pt-2 pb-3">
                                <div className="space-y-2">
                                  {data.map((war, arIndex) => (
                                    <>
                                      <div key={`${month}-week-${weekNo}-ar-${arIndex}`} className="space-y-1">
                                        {war.war_composition.map((comp: any, compIndex: number) => (
                                          <div
                                            key={`${month}-week-${weekNo}-ar-${arIndex}-comp-${compIndex}`}
                                            className="flex items-center justify-between p-3 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
                                          >
                                            <div className="flex items-center gap-2">
                                              <div className="w-2 h-2 bg-primary rounded-full" />
                                              <span className="font-mono text-sm">Report No. {comp.ar.id}</span>
                                              {comp.ar.ar_title && (
                                                <span className="text-sm text-muted-foreground">
                                                  - {comp.ar.ar_title}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      {arIndex + 1 == data.length && (
                                        <div className="w-full flex justify-end">
                                          <label
                                            className="flex gap-2 cursor-pointer"
                                            onClick={() => {
                                              navigate("/report/acknowledgement/document", {
                                                state: {
                                                  params: {
                                                    type: "WAR",
                                                    data: {
                                                    ...war,
                                                    reportPeriod: getRangeOfDaysInWeek(weekNo, month, selectedYear)
                                                    },
                                                  },
                                                },
                                              })
                                            }}
                                          >
                                            <span>View</span>
                                            <MoveRight />
                                          </label>
                                        </div>
                                      )}
                                    </>
                                  ))}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          ))} */}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recent Reports */}
          <RecentWeeklyAR recentReports={recentReports} />

          {/* Missed Weekly Reports */}
          {/* <MissedWeeklyAR organizedData={organizedData} selectedYear={selectedYear} /> */}
        </div>
      </div>
    </MainLayoutComponent>
  )
}
