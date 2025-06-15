import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useGetActiveIR = () => {
  return useQuery({
    queryKey: ['activeIRs'],
    queryFn: async () => {
      try {
        const res = await api.get('report/ir/active/list/table/');
        return res.data;
       } catch (err) {
        throw err;
       }
    },
    staleTime: 5000
  })
}

export const useGetArchiveIR = () => {
  return useQuery({
    queryKey: ['archiveIRs'],
    queryFn: async () => {
      try {
        const res = await api.get('report/ir/archive/list/table/');
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

export const useGetWeeklyAR = () => {
  return useQuery({
    queryKey: ['weeklyAR'],
    queryFn: async () => {
      try {
        const res = await api.get('report/war/comp/list/');
        return res.data;
      } catch (err) {
        console.error(err);
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useGetSpecificTemplate = (type: string) => {
  return useQuery({
    queryKey: ['reportTemplate', type],
    queryFn: async () => {
      try {
        const res = await api.get(`report/template/${type}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    }
  })
}