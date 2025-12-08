import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAnnualDevPlans } from "@/pages/record/gad/annual_development_plan/restful-api/annualGetAPI";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export const useGADAnalyticsCards = () => {
  const navigate = useNavigate();
  const currentYear = format(new Date(), "yyyy");

  // Get all non-archived annual dev plans for the current year
  const { data: annualPlans, isLoading } = useQuery({
    queryKey: ["annual-dev-plans", currentYear],
    queryFn: () => 
      getAnnualDevPlans(
        undefined, 
        1,        
        1000,     
        false     
      ),
    select: (data) => {
      const plans = data?.results || [];
      return plans.filter((plan: any) => {
        const planYear = new Date(plan.dev_date).getFullYear();
        return planYear === parseInt(currentYear) && !plan.dev_archived;
      });
    },
  });

  const handleCardClick = () => {
    navigate(`/gad-annual-development-plan/view?year=${currentYear}`);
  };

  const card = (
    <Card 
      key="annual-dev-plans" 
      className="border border-gray-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          Annual Development Plans ({currentYear})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-slate-200" />
          ) : (
            annualPlans?.length || 0
          )}
        </div>
      </CardContent>
    </Card>
  );

  return [card];
};