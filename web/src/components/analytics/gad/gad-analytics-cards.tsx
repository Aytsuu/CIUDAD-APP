import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, FileText, FileCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetMandatedPlansCount, useGetPlansWithProposalsCount, useGetPlansWithResolutionsCount } from "@/pages/record/gad/annual_development_plan/queries/annualDevPlanFetchQueries";

export const useGADAnalyticsCards = () => {
  // Get analytics data
  const { data: mandatedData, isLoading: isLoadingMandated } = useGetMandatedPlansCount();
  const { data: proposalsData, isLoading: isLoadingProposals } = useGetPlansWithProposalsCount();
  const { data: resolutionsData, isLoading: isLoadingResolutions } = useGetPlansWithResolutionsCount();

  const mandatedCount = mandatedData?.count || 0;
  const proposalsCount = proposalsData?.count || 0;
  const resolutionsCount = resolutionsData?.count || 0;

  const cards = [
    {
      title: "Mandated",
      value: mandatedCount,
      description: "Mandated development plans",
      isLoading: isLoadingMandated,
      bgColor: "bg-purple-50"
    },
    {
      title: "With Project Proposal",
      value: proposalsCount,
      description: "Plans with project proposals",
      isLoading: isLoadingProposals,
      bgColor: "bg-blue-50"
    },
    {
      title: "With Resolution",
      value: resolutionsCount,
      description: "Plans with resolutions",
      isLoading: isLoadingResolutions,
      bgColor: "bg-green-50"
    }
  ];

  const analyticsCards = cards.map((card) => (
    <Card key={card.title} className="border border-gray-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {card.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-primary">
          {card.isLoading ? (
            <Skeleton className="h-8 w-16 bg-slate-200" />
          ) : (
            card.value
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {card.description}
        </p>
      </CardContent>
    </Card>
  ));

  return analyticsCards;
};
