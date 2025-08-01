import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/api";

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

export const useGetARByDate = (
  year: number, 
  month: number, 
  start_day: number, 
  end_day: number
) => {
  return useQuery({
    queryKey: ['ARByDate', year, month, start_day, end_day],
    queryFn: async () => {
      try {
        const res = await api.get('report/ar/list/by-date/', {
          params: {
            year,
            month,
            start_day,
            end_day
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