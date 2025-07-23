import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card/card"
import { useGetCardAnalytics } from "./profiling-analytics-queries"

const sections = [
  {
    title: "Total Residents",
    description: ""
  },
  {
    title: "Total Families",
    description: ""
  },
  {
    title: "Total Households",
    description: ""
  },
  {
    title: "Total Businesses",
    description: ""
  },
]

export const ProfilingSectionCards = () => {
  const { data: profilingCardAnalytics, isLoading } = useGetCardAnalytics();
  return (
    <>
      {
        sections.map((sec: any, idx: number) => (
          <Card>
            <CardHeader>
              <CardDescription>{sec.title}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {!isLoading && profilingCardAnalytics && profilingCardAnalytics.length > 0 ? profilingCardAnalytics[idx] : "..."}
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