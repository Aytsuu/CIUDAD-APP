import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./admin-analytics-queries"
import React from "react";

// Memoized card component that rerenders when props change
const AdminCard = React.memo(({ 
  title, 
  value, 
  isLoading 
}: { 
  title: string; 
  value?: number | string; 
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {!isLoading && value ? value : "..."}
      </CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm" />
  </Card>
));

AdminCard.displayName = "AdminCard";

export const useAdminSectionCards = () => {
  const { data: adminCardAnalytics, isLoading } = useGetCardAnalytics();
  
  return {
    staffs: <AdminCard title="Total Staffs" value={adminCardAnalytics?.staffs} isLoading={isLoading} />,
  };
};