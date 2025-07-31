import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card/card"
import { useGetDonCardAnalytics } from "./donation-analytics-queries";

const sections = [
  {
    title: "Total Cash Donation",
    description: ""
  }
]

export const DonationSectionCards = () => {
  const { data, isLoading } = useGetDonCardAnalytics();
  
  return (
    <>
      {sections.map((sec) => (
        <Card key={sec.title}>
          <CardHeader>
            <CardDescription>{sec.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              ₱{!isLoading ? data?.total_monetary_donations : "..."}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            </CardFooter>
        </Card>
      ))}
    </>
  )
}