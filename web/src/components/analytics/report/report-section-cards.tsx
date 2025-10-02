import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useGetCardAnalytics } from "./report-analytics-queries"
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";

// Memoized card component that rerenders when props change
const ReportCard = React.memo(({ 
  title, 
  value, 
  isLoading,
  onClick
}: { 
  title: string; 
  value?: number | string; 
  isLoading: boolean;
  onClick?: () => void;
}) => (
  <Card 
    className="relative cursor-pointer transition-all duration-300 hover:shadow-md group overflow-hidden"
    onClick={onClick}
  >
    <CardHeader>
      <CardDescription className="truncate">{title}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {!isLoading && value ? value : "0"}
      </CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm" />
    
    {/* Animated Arrow */}
    <div className="absolute top-4 right-4 opacity-0 -translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 text-primary" />
      </div>
    </div>
  </Card>
));

ReportCard.displayName = "ReportCard";

export const useReportSectionCards = () => {
  const navigate = useNavigate();
  const { data: reportCardAnalytics, isLoading } = useGetCardAnalytics();
  
  return {
    incidentReports: (
      <ReportCard 
        title="Incident Reports" 
        value={reportCardAnalytics?.incidentReports} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/report/incident")
        }}
      />
    ),
    acknowledgementReports: (
      <ReportCard 
        title="Acknowledgement Reports" 
        value={reportCardAnalytics?.acknowledgementReports} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/report/acknowledgement")
        }}
      />
    ),
    weeklyARs: (
      <ReportCard 
        title="Weekly ARs" 
        value={reportCardAnalytics?.weeklyARs} 
        isLoading={isLoading}
        onClick={() => {
          navigate("/report/weekly-accomplishment")
        }}
      />
    ),
    // seguradoReports: (
    //   <ReportCard 
    //     title="Total Securado Reports" 
    //     value={reportCardAnalytics?.seguradoReports} 
    //     isLoading={isLoading}
    //     onClick={() => handleCardClick('Securado Reports')}
    //   />
    // ),
  };
};