import { api } from "@/api/api";
import { useQuery } from "@tanstack/react-query";


export const useGetCardAnalytics = () => {
  return useQuery({
    queryKey: ['profilingCardAnalytics'],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/card/analytics/data/");
        return res.data
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  })
}

export const useResidentsTable = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ['residentsTableData', page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/resident/list/table/", {
          params: { 
            page, 
            page_size: pageSize,
            search: searchQuery
          }
        });
        
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  })
}

export const useFamiliesTable = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["familiesTableData", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/family/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery
          }
        })
    
        return res.data
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
}

export const useHouseholdTable = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ['householdTable', page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/household/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery
          }
        });
        return res.data
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  })
}

export const useBusinessTable = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ["businessesTableData", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/business/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery
          }
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  })
}