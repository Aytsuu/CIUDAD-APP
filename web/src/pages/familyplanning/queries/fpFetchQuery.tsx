import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";


export const useRiskStiData = (patientId: string | number | undefined) => {
    return useQuery({
        queryKey: ["risk-sti", patientId],
        queryFn: async () => {
            const {data} = await api2.get(`family-planning/risk_sti/${patientId}`);
            return data;
        },
        enabled: !!patientId,
        staleTime: 5000
    });
}

export const useObstetricalHistoryData = (patientId: string | undefined) => {
  return useQuery({
    queryKey: ['obstetricalHistory', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      const response = await api2.get(`familyplanning/obstetrical-history/${patientId}/`);
      return response.data;
    },
    enabled: !!patientId,
  });
  
};

interface Commodity {
  com_id: string;
  com_name: string;
  user_type: string;
}
const fetchCommodityList = async (): Promise<Commodity[]> => {
  const response = await api2.get<Commodity[]>('inventory/commoditylist/');
  return response.data;
};

export const useCommodityList = () => {
  return useQuery<Commodity[], Error>({
    queryKey: ['commodityList'],
    queryFn: fetchCommodityList,
    staleTime: 5000,
    });
};
















