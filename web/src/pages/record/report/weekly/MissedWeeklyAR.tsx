import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Calendar, Clock, Plus } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button/button"
import { Link } from "react-router"
import { hasWeekPassed, monthNameToNumber } from "@/helpers/dateHelper"

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
  selectedYear: number
}

export default function MissedWeeklyAR({ organizedData, selectedYear }: MissedWeeklyARProps) {
  // Filter months that have missed weeks that have passed
  const monthsWithMissedWeeks = organizedData
    .map((monthData) => ({
      ...monthData,
      missedWeeksPassedList: monthData.missingWeeks.filter((weekNo) =>
        hasWeekPassed(monthData.month, weekNo, selectedYear),
      ),
    }))
    .filter((monthData) => monthData.missedWeeksPassedList.length > 0)

  const totalMissedWeeks = monthsWithMissedWeeks.reduce(
    (total, monthData) => total + monthData.missedWeeksPassedList.length,
    0,
  )

  console.log(organizedData)

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
            <p className="text-sm text-muted-foreground">
              {selectedYear > new Date().getFullYear()
                ? `No missed reports for ${selectedYear} yet.`
                : "No missed reports! You're up to date."}
            </p>
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
                  <span className="font-medium text-sm">
                    {month} {selectedYear}
                  </span>
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
                      <Link to={"missing-report/create"}
                        state={{
                          params: {
                            year: selectedYear,
                            month: month,
                            week: weekNo,
                          }
                        }}
                      >
                        <Button variant={"link"} className="text-black/40 text-[13px] hover:text-black/80">
                          <Plus />
                          Create
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
