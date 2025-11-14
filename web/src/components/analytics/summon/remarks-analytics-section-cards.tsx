import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useGetRemarksAnalytics } from "./remarks-analytics-queries";
import { useEffect } from "react";

// Memoized card component with hover effects and navigation
const RemarkCard = React.memo(({ 
  title, 
  value, 
  isLoading,
  description,
  onClick
}: { 
  title: string; 
  value?: number | string; 
  isLoading: boolean;
  description?: string;
  onClick?: () => void;
}) => (
  <Card 
    className="relative cursor-pointer transition-all duration-300 hover:shadow-md group overflow-hidden"
    onClick={onClick}
  >
    <CardHeader>
      <CardDescription className="truncate">{title}</CardDescription>
      <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
        {!isLoading && value !== undefined ? value : "..."}
      </CardTitle>
    </CardHeader>
    <CardFooter className="flex-col items-start gap-1.5 text-sm">
      {description && (
        <div className="text-sm text-gray-600">
          {description}
        </div>
      )}
    </CardFooter>
    
    {/* Animated Arrow */}
    <div className="absolute top-4 right-4 opacity-0 -translate-x-2 -translate-y-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
        <ArrowUpRight className="w-4 h-4 text-primary" />
      </div>
    </div>
  </Card>
));

RemarkCard.displayName = "RemarkCard";

// Hook version for single card
export const useNoRemarksSectionCard = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch: refetchRemarks, isFetching } = useGetRemarksAnalytics();

  useEffect(() => {
    refetchRemarks();
  }, [refetchRemarks]);

  const card = (
    <RemarkCard 
      title="No Remarks"
      value={data?.no_remarks_count ?? 0}
      isLoading={isLoading || isFetching}
      description=""
      onClick={() => {
        navigate("/summon-remarks") // Update with your actual route
      }}
    />
  );

  return {
    noRemark:card,
  };
};