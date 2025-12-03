import { useQuery } from "@tanstack/react-query";
import api from "@/api/api";

export interface ComplaintCardAnalytics {
  pending: number;
  cancelled: number;
  accepted: number;
  rejected: number;
  raised: number;
}

export const useGetCardAnalytics = () => {
  return useQuery<ComplaintCardAnalytics, Error>({
    queryKey: ["complaint-card-analytics"],
    queryFn: async () => {
      try {
        const response = await api.get<ComplaintCardAnalytics>("/complaint/analytics/cards/");
        console.log("Complaint analytics response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching complaint analytics:", error);
        return {
          pending: 0,
          cancelled: 0,
          accepted: 0, 
          rejected: 0,
          raised: 0
        };
      }
    },
    refetchInterval: 30000,
    staleTime: 60000,
  });
};

export interface ComplaintChartData {
  date: string;
  complaint: number;
}

export const useGetComplaintChartAnalytics = () => {
  return useQuery<ComplaintChartData[], Error>({
    queryKey: ["complaint-chart-analytics"],
    queryFn: async () => {
      try {
        const response = await api.get<ComplaintChartData[]>("/complaint/analytics/charts/");
        console.log("Chart analytics response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching complaint chart analytics:", error);
        return [];
      }
    },
    refetchInterval: 30000,
    staleTime: 60000,
  });
};