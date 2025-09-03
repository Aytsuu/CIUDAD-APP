import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./admin-analytics-queries"


const sections = [
  {
    title: "Total Staffs",
    description: ""
  }
]

export const AdminSectionCards = () => {
  const { data: adminCardAnalytics, isLoading } = useGetCardAnalytics();
  return (
    <>
      {
        sections.map((sec: any, idx: number) => (
          <Card>
            <CardHeader>
              <CardDescription>{sec.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {!isLoading && adminCardAnalytics && adminCardAnalytics.length ? adminCardAnalytics[idx] : "..."}
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