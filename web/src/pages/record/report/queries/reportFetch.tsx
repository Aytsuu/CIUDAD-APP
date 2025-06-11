import { useQuery } from "@tanstack/react-query";
import api from "@/pages/api/api";

export const useGetIncidentReport = () => {
  return useQuery({
    queryKey: ['incidentReports'],
    queryFn: async () => {
      try {
        const res = await api.get('report/ir/list/table/');
        return res.data;
       } catch (err) {
        throw err;
       }
    },
    staleTime: 5000
  })
}

export const useGetAcknowledgementReport = () => {
  return useQuery({
    queryKey: ['arReports'],
    queryFn: async () => {
      try {
        const res = await api.get('report/ar/list/table/');
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    staleTime: 5000
  })
}