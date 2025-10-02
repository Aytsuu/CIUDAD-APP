
import { useQuery} from "@tanstack/react-query";
import { api2 } from "@/api/api";


export const useReportsCount = () => {
    return useQuery({
      queryKey: ["reportscount"],
      queryFn: async () => {
        const response = await api2.get("reports/counts/");
        return response.data;
      }
    });
  };