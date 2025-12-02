import { useQuery } from "@tanstack/react-query";
import { api, mapApi } from "@/api/api";

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

export const useGetIncidentReport = (page: number, pageSize: number, searchQuery: string, isArchive: boolean, get_tracker?: boolean, severity?: string) => {
  return useQuery({
    queryKey: ['activeIRs', page, pageSize, searchQuery, isArchive, severity],
    queryFn: async () => {
      try {
        const res = await api.get('report/ir/list/table/', {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
            is_archive: isArchive,
            get_tracker,
            severity
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

export const useGetIRHistory = (page: number, pageSize: number, searchQuery: string, isArchive: boolean, rp_id: string) => {
  return useQuery({
    queryKey: ['myIRs', page, pageSize, searchQuery, rp_id, isArchive],
    queryFn: async () => {
      try {
        const res = await api.get('report/ir/list/table/', {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
            is_archive: isArchive,
            rp_id
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