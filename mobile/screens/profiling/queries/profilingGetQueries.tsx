import { api } from "@/api/api";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";

export const useGetCardAnalytics = () => {
  return useQuery({
    queryKey: ["profilingCardAnalytics"],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/card/analytics/data/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
};

export const useResidentsTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["residentsTableData", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/resident/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
            age: "all",
            voter: "all",
            disable: "all",
          },
        });

        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    placeholderData: (previous) => previous,
    retry: false,
  });
};

export const useGetPersonalInfo = (residentId: string, personalId: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["personalInfo", residentId],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/resident/personal/${residentId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!residentId,
  });

  React.useEffect(() => {
    if (!residentId) return;
    const channel = supabase
      .channel(`personal-update-${residentId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "personal",
          filter: `per_id=eq.${personalId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["personalInfo", residentId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [residentId, queryClient]);

  return query;
};

export const useFamiliesTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["familiesTableData", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/family/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
          },
        });

        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    placeholderData: (previous) => previous,
    retry: false,
  });
};

export const useGetFamilyMembers = (familyId: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["familyMembers", familyId],
    queryFn: async () => {
      if (!familyId) return [];
      try {
        const res = await api.get(`profiling/family/${familyId}/members/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!familyId,
  });

  React.useEffect(() => {
    if (!familyId) return;
    const channel = supabase
      .channel(`family-update-${familyId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "family_composition",
          filter: `fam_id=eq.${familyId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["familyMembers", familyId],
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [familyId, queryClient]);

  return query;
};

export const useFamilyData = (familyId: string) => {
  return useQuery({
    queryKey: ["familyData", familyId],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/family/${familyId}/data/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
};

export const useFamFilteredByHouse = (householdId: string) => {
  return useQuery({
    queryKey: ["famFilteredByHouse", householdId],
    queryFn: async () => {
      try {
        const res = await api.get(
          `profiling/family/list/filter/${householdId}/`
        );
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
};

export const useHouseholdTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["householdTable", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/household/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
          },
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    placeholderData: (previous) => previous,
    retry: false,
  });
};

export const useHouseholdData = (hh_id: string) => {
  return useQuery({
    queryKey: ["householdData", hh_id],
    queryFn: async () => {
      try {
        const res = await api.get(`profiling/household/${hh_id}/data/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
};

export const useBusinessTable = (
  page: number,
  pageSize: number,
  searchQuery: string
) => {
  return useQuery({
    queryKey: ["businessesTableData", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api.get("profiling/business/active/list/table/", {
          params: {
            page,
            page_size: pageSize,
            search: searchQuery,
          },
        });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
  });
};
