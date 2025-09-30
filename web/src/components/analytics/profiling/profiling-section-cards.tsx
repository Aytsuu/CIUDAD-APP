import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./profiling-analytics-queries"
import React from "react";

// Memoized card component that rerenders when props change
const ProfilingCard = React.memo(({ 
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

ProfilingCard.displayName = "ProfilingCard";

export const useProfilingSectionCards = () => {
  const { data: profilingCardAnalytics, isLoading } = useGetCardAnalytics();
  
  return {
    residents: <ProfilingCard title="Residents" value={profilingCardAnalytics?.residents} isLoading={isLoading} />,
    families: <ProfilingCard title="Families" value={profilingCardAnalytics?.families} isLoading={isLoading} />,
    households: <ProfilingCard title="Households" value={profilingCardAnalytics?.households} isLoading={isLoading} />,
    businesses: <ProfilingCard title="Businesses" value={profilingCardAnalytics?.businesses} isLoading={isLoading} />,
  };
};