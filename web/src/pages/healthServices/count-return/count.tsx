import { useQuery} from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { useAuth } from "@/context/AuthContext";


export const useReportsCount = () => {
    const { user } = useAuth();
    const staffId = user?.staff?.staff_id;

    return useQuery({
      queryKey: ["reportscount", staffId],
      queryFn: async () => {
        const response = await api2.get(`reports/counts/?doctor_id=${staffId}`);
        return response.data;
      },
      enabled: !!staffId, // Only run the query if staffId is available
    });
};