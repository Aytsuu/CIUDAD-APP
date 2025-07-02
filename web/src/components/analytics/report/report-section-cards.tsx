import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card/card"
import { useGetCardAnalytics } from "./report-analytics-queries"

const sections = [
  {
    title: "Total Incident Reports",
    description: ""
  },
  {
    title: "Total Acknowledgement Reports",
    description: ""
  },
  {
    title: "Total Weekly ARs",
    description: ""
  },
  {
    title: "Total Securado Reports",
    description: ""
  },
]

export const ReportSectionCards = () => {
  const { data: reportCardAnalytics, isLoading } = useGetCardAnalytics();
  console.log(reportCardAnalytics)
  return (
    <>
      {
        sections.map((sec: any, idx: number) => (
          <Card>
            <CardHeader>
              <CardDescription>{sec.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {!isLoading ? reportCardAnalytics[idx] : "..."}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
            </CardFooter>
          </Card>
        ))
      }
    </>
  )
}