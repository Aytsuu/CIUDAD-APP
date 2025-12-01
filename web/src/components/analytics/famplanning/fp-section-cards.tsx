// components/analytics/familyplanning/fp-section-cards.tsx

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import CardLayout from "@/components/ui/card/card-layout";
import { Users, UserCheck, UserPlus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, subMonths, addMonths, parseISO, isSameMonth } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

interface FPAnalyticsSummary {
  total_patients: number;
  new_acceptors: number;
  current_users: number;
  this_month_registrations: number;
  growth_rate: number;
}

interface FamilyPlanningSectionCardsProps {
  initialMonth: string;
}

const fetchFPAnalyticsSummary = async (month: string): Promise<FPAnalyticsSummary> => {
  const response = await api2.get(`/familyplanning/analytics/summary/?month=${month}`);
  return response.data;
};

export function FamilyPlanningSectionCards({ initialMonth }: FamilyPlanningSectionCardsProps) {
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const { data, isLoading, error } = useQuery<FPAnalyticsSummary>({
    queryKey: ['fpAnalyticsSummary', currentMonth],
    queryFn: () => fetchFPAnalyticsSummary(currentMonth),
    staleTime: 60000, // 1 minute
  });

  const currentDate = parseISO(`${currentMonth}-01`);
  const today = new Date();
  const currentMonthDate = parseISO(`${format(today, "yyyy-MM")}-01`);
  const nextMonthDisabled = isSameMonth(currentDate, currentMonthDate);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate =
      direction === "prev"
        ? subMonths(currentDate, 1)
        : addMonths(currentDate, 1);
    setCurrentMonth(format(newDate, "yyyy-MM"));
  };

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="text-sm">
          Failed to load family planning section data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Summary for {format(currentDate, "MMMM yyyy")}
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("prev")}
            className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Previous</span>
          </Button>
          <div className="px-4 py-1.5 bg-blue-50 text-blue-800 rounded-md text-sm font-medium min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth("next")}
            disabled={nextMonthDisabled}
            className="group flex items-center gap-1.5 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
            aria-label="Next month"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <CardLayout
          title="Total FP Patients"
          description="All patients enrolled in family planning"
          content={
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {data?.total_patients || 0}
                </span>
                <span className="text-xs text-muted-foreground">Active patients</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          }
          cardClassName="border shadow-sm rounded-lg hover:shadow-md transition-shadow"
          headerClassName="pb-2"
          contentClassName="pt-0"
        />

        <CardLayout
          title="New Acceptors"
          description="Patients starting family planning"
          content={
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {data?.new_acceptors || 0}
                </span>
                <span className="text-xs text-muted-foreground">New enrollments</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-green-100 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-green-600" />
              </div>
            </div>
          }
          cardClassName="border shadow-sm rounded-lg hover:shadow-md transition-shadow"
          headerClassName="pb-2"
          contentClassName="pt-0"
        />

        <CardLayout
          title="Current Users"
          description="Patients with ongoing services"
          content={
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {data?.current_users || 0}
                </span>
                <span className="text-xs text-muted-foreground">Active users</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          }
          cardClassName="border shadow-sm rounded-lg hover:shadow-md transition-shadow"
          headerClassName="pb-2"
          contentClassName="pt-0"
        />

        <CardLayout
          title="This Month"
          description="New registrations this month"
          content={
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold">
                  {data?.this_month_registrations || 0}
                </span>
                <span className="text-xs text-muted-foreground">
                  {data?.growth_rate ? `${data.growth_rate > 0 ? '+' : ''}${data.growth_rate}% vs last month` : 'No comparison'}
                </span>
              </div>
              <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          }
          cardClassName="border shadow-sm rounded-lg hover:shadow-md transition-shadow"
          headerClassName="pb-2"
          contentClassName="pt-0"
        />
      </div>
    </div>
  );
}