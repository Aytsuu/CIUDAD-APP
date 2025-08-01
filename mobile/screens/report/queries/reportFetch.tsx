import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

export const useGetReportType = () => {
  return useQuery({
    queryKey: ['irReportType'],
    queryFn: async () => {
      try { 
        const res = await api.get('report/rt/list/Incident/');
        return res.data;
      } catch (err) {
        console.log(err);
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useGetIncidentReport = (page: number, pageSize: number, searchQuery: string, isArchive: boolean) => {
  return useQuery({
    queryKey: ['activeIRs', page, pageSize, searchQuery, isArchive],
    queryFn: async () => {
      try {
        const res = await api.get('report/ir/list/table/', {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
            is_archive: isArchive
          }
        });
        return res.data;
       } catch (err) {
        throw err;
       }
    },
    staleTime: 5000
  })
}
export const useGetAcknowledgementReport = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ['arReports', page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get('report/ar/list/table/', {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery
          }
        });
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
