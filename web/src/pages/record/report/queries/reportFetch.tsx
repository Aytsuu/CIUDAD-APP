import { useQuery } from "@tanstack/react-query";
import { api, mapApi } from "@/api/api";

export const useGetIncidentReport = (page: number, pageSize: number, searchQuery: string, isArchive: boolean, get_tracker?: boolean) => {
  return useQuery({
    queryKey: ['activeIRs', page, pageSize, searchQuery, isArchive],
    queryFn: async () => {
      try {
        const res = await api.get('report/ir/list/table/', {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
            is_archive: isArchive,
            get_tracker
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

export const useConvertCoordinatesToAddress = (lat: number, lng: number) => {
  return useQuery({
    queryKey: ["convertCoordinates", lat, lng],
    queryFn: async () => {
      try {
        const res = await mapApi.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "ciudad-app/1.0",
            },
          }
        );
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    retry: false
  });
};

export const useGetIRInfo = (ir_id: string) => {
  return useQuery({
    queryKey: ['IRInfo', ir_id],
    queryFn: async () => {
      try {
        const res = await api.get(`report/ir/${ir_id}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!ir_id,
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
      } catch (err) {;
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useGetARInfo = (arId: string) => {
  return useQuery({
    queryKey: ['ARInfo', arId],
    queryFn: async () => {
      try {
        const res = await api.get(`report/ar/${arId}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!arId
  })
}

export const useGetWeeklyAR = () => {
  return useQuery({
    queryKey: ['weeklyAR'],
    queryFn: async () => {
      try {
        const res = await api.get('report/war/comp/list/');
        return res.data;
      } catch (err) {;
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useGetWARInfo = (warId: string) => {
  return useQuery({
    queryKey: ['WARInfo', warId],
    queryFn: async () => {
      try {
        const res = await api.get(`report/war/${warId}/info/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!warId
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