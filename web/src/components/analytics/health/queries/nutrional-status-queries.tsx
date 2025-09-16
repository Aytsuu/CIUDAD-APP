import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";


export const useGetOPTNutrionalChart = (month: string) => {
    return useQuery({
      queryKey: ['OPTNutrionalChart', month],
      queryFn: async () => {
        try {
          const response = await api2.get(`/reports/nutritional-status/monthly-detail/${month}/`);
          console.log("OPT monthly report data:", response.data);
          return response.data;
        } catch (error) {
          console.error("Error fetching OPT monthly report:", error)
        }
    },
    staleTime: 5000

})
}