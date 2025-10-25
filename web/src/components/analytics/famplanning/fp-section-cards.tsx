// Create this file: components/analytics/familyplanning/fp-section-cards.tsx

import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import CardLayout from "@/components/ui/card/card-layout";
import { Users, UserCheck, UserPlus, Calendar } from "lucide-react";

interface FPAnalyticsSummary {
  total_patients: number;
  new_acceptors: number;
  current_users: number;
  this_month_registrations: number;
  growth_rate: number;
}

const fetchFPAnalyticsSummary = async (): Promise<FPAnalyticsSummary> => {
  const response = await api2.get('/familyplanning/analytics/summary/');
  return response.data;
};

export const useFamilyPlanningSectionCards = () => {
  const { data, isLoading } = useQuery<FPAnalyticsSummary>({
    queryKey: ['fpAnalyticsSummary'],
    queryFn: fetchFPAnalyticsSummary,
    staleTime: 60000, // 1 minute
  });

  const totalPatients = (
    <CardLayout
      title="Total FP Patients"
      description="All patients enrolled in family planning"
      content={
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {isLoading ? '...' : data?.total_patients || 0}
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
  );

  const newAcceptors = (
    <CardLayout
      title="New Acceptors"
      description="Patients starting family planning"
      content={
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {isLoading ? '...' : data?.new_acceptors || 0}
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
  );

  const currentUsers = (
    <CardLayout
      title="Current Users"
      description="Patients with ongoing services"
      content={
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {isLoading ? '...' : data?.current_users || 0}
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
  );

  const monthlyRegistrations = (
    <CardLayout
      title="This Month"
      description="New registrations this month"
      content={
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              {isLoading ? '...' : data?.this_month_registrations || 0}
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
  );

  return {
    totalPatients,
    newAcceptors,
    currentUsers,
    monthlyRegistrations,
  };
};