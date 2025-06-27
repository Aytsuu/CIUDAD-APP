"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Clock } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface MissedWeeklyARProps {
  organizedData: Array<{
    month: string
    weeks: Array<{
      weekNo: number
      data: any[]
    }>
    missingWeeks: number[]
    missedWeeksPassed: number
    hasData: boolean
  }>
}

// Helper function to check if a week has passed
const hasWeekPassed = (month: string, weekNo: number) => {
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()

  // Get the month index (0-11)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]
  const monthIndex = monthNames.indexOf(month)

  if (monthIndex === -1) return false

  // Calculate the end date of the given week
  const firstDayOfMonth = new Date(currentYear, monthIndex, 1)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysToFirstMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek

  // Calculate the end of the specified week
  const weekEndDate = new Date(currentYear, monthIndex, daysToFirstMonday + (weekNo - 1) * 7 + 6)

  return weekEndDate < currentDate
}

export default function MissedWeeklyAR({ organizedData }: MissedWeeklyARProps) {
  // Filter months that have missed weeks that have passed
  const monthsWithMissedWeeks = organizedData
    .map((monthData) => ({
      ...monthData,
      missedWeeksPassedList: monthData.missingWeeks.filter((weekNo) => hasWeekPassed(monthData.month, weekNo)),
    }))
    .filter((monthData) => monthData.missedWeeksPassedList.length > 0)

  const totalMissedWeeks = monthsWithMissedWeeks.reduce(
    (total, monthData) => total + monthData.missedWeeksPassedList.length,
    0,
  )

  if (totalMissedWeeks === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            Missed Weekly Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-green-600 mb-2">
              <Clock className="h-8 w-8 mx-auto" />
            </div>
            <p className="text-sm text-muted-foreground">No missed reports! You're up to date.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Missed Weekly Reports
          <Badge variant="destructive" className="ml-auto">
            {totalMissedWeeks}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Accordion type="single" collapsible className="w-full">
          {monthsWithMissedWeeks.map(({ month, missedWeeksPassedList }) => (
            <AccordionItem key={month} value={month} className="border-b last:border-b-0">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                <div className="flex items-center gap-2 w-full">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{month}</span>
                  <Badge variant="destructive" className="ml-auto mr-2 text-xs">
                    {missedWeeksPassedList.length} missed
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-2">
                  {missedWeeksPassedList.map((weekNo) => (
                    <div
                      key={`${month}-week-${weekNo}`}
                      className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm font-medium">Week {weekNo}</span>
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {totalMissedWeeks > 0 && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total missed weeks:</span>
              <Badge variant="destructive">{totalMissedWeeks}</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
