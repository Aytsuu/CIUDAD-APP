import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./report-analytics-queries"
import React from "react";

// Memoized card component that rerenders when props change
const ReportCard = React.memo(({ 
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
        {!isLoading && value ? value : "0"}
      </CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm" />
  </Card>
));

ReportCard.displayName = "ReportCard";

export const useReportSectionCards = () => {
  const { data: reportCardAnalytics, isLoading } = useGetCardAnalytics();
  
  return {
    incidentReports: <ReportCard title="Incident Reports" value={reportCardAnalytics?.incidentReports} isLoading={isLoading} />,
    acknowledgementReports: <ReportCard title="Acknowledgement Reports" value={reportCardAnalytics?.acknowledgementReports} isLoading={isLoading} />,
    weeklyARs: <ReportCard title="Weekly ARs" value={reportCardAnalytics?.weeklyARs} isLoading={isLoading} />,
    // seguradoReports: <ReportCard title="Total Securado Reports" value={reportCardAnalytics?.seguradoReports} isLoading={isLoading} />,
  };
};