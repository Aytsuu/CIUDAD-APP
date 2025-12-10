import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./complaint-analytics-queries"
import React from "react"

// Memoized card component for total complaints
const TotalComplaintCard = React.memo(({ 
  title, 
  value, 
  isLoading 
}: { 
  title: string; 
  value?: number | string; 
  isLoading: boolean;
}) => (
  <Card className="relative overflow-hidden">
    <CardHeader>
      <CardDescription className="truncate">{title}</CardDescription>
      <CardTitle className="text-3xl font-semibold tabular-nums @[250px]/card:text-4xl">
        {!isLoading && value !== undefined ? value : "..."}
      </CardTitle>
    </CardHeader>
  </Card>
))

TotalComplaintCard.displayName = "TotalComplaintCard"

export const useComplaintSectionCards = () => {
  const { data: complaintCardAnalytics, isLoading } = useGetCardAnalytics()

  // Calculate total complaints by summing all statuses
  const totalComplaints = complaintCardAnalytics ? 
    (complaintCardAnalytics.pending || 0) +
    (complaintCardAnalytics.cancelled || 0) +
    (complaintCardAnalytics.accepted || 0) +
    (complaintCardAnalytics.rejected || 0) +
    (complaintCardAnalytics.raised || 0) : 0

  return {
    total: (
      <TotalComplaintCard 
        title="Total Complaints" 
        value={totalComplaints} 
        isLoading={isLoading}
      />
    )
  }
}