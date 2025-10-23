import { api2 } from "@/api/api";
import { supabase } from "@/lib/supabase";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import React from "react";

// ============================================================================
// GET QUERIES
// ============================================================================

// Household Queries
export const useGetHouseholds = () => {
  return useQuery({
    queryKey: ['healthHouseholds'],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/household/list/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  });
};

export const useHouseholdTable = (page: number, pageSize: number, searchQuery: string) => {
  return useQuery({
    queryKey: ['householdTable', page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/household/list/table/", {
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


export const useGetHouseholdData = (householdId: string) => {
  return useQuery({
    queryKey: ['healthHouseholdData', householdId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/household/${householdId}/data/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!householdId
  });
};

// Resident Queries
export const useGetResidents = (params?: any) => {
  return useQuery({
    queryKey: ['healthResidents', params],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/resident/", { params });
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  });
};

export const useGetResidentPersonalInfo = (rpId: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['healthResidentPersonal', rpId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/resident/personal/${rpId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!rpId
  });

  React.useEffect(() => {
    if (!rpId) return;
    const channel = supabase
      .channel(`health-resident-personal-${rpId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "personal",
          filter: `per_id=eq.${rpId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['healthResidentPersonal', rpId] });
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [rpId, queryClient]);

  return query;
};

export const useGetResidentsExcludingFamily = (famId: string) => {
  return useQuery({
    queryKey: ['healthResidentsExcludingFamily', famId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/resident/exclude/fam/${famId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!famId
  });
};

// Family Queries
export const useGetFamilyMembers = (famId: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['healthFamilyMembers', famId],
    queryFn: async () => {
      if (!famId) return [];
      try {
        const res = await api2.get(`health-profiling/family/${famId}/members/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!famId
  });

  React.useEffect(() => {
    if (!famId) return;
    const channel = supabase
      .channel(`health-family-members-${famId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "family_composition",
          filter: `fam_id=eq.${famId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['healthFamilyMembers', famId] });
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [famId, queryClient]);

  return query;
};

export const useGetFamilyData = (famId: string) => {
  return useQuery({
    queryKey: ['healthFamilyData', famId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/family/${famId}/data/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!famId
  });
};

export const useGetFamilyList = (page?: number, pageSize?: number, searchQuery?: string) => {
  return useQuery({
    queryKey: ['healthFamilyList', page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/family/list/table/", {
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
    staleTime: 5000
  });
};

// Environmental Queries
export const useGetWaterSupplyOptions = () => {
  return useQuery({
    queryKey: ['healthWaterSupplyOptions'],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/water-supply/options/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity
  });
};

export const useGetEnvironmentalData = (hhId: string) => {
  return useQuery({
    queryKey: ['healthEnvironmentalData', hhId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/environmental-data/${hhId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!hhId
  });
};

// NCD Queries
export const useGetNCDByFamily = (famId: string) => {
  return useQuery({
    queryKey: ['healthNCDByFamily', famId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/ncd/family/${famId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!famId
  });
};

// TB Surveillance Queries
export const useGetTBByFamily = (famId: string) => {
  return useQuery({
    queryKey: ['healthTBByFamily', famId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/tb-surveillance/family/${famId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!famId
  });
};

// Survey Identification Queries
export const useGetSurveyByFamily = (famId: string) => {
  return useQuery({
    queryKey: ['healthSurveyByFamily', famId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/survey-identification/family/${famId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000,
    enabled: !!famId
  });
};

// Comprehensive Family Health Profiling Queries
export const useGetFamilyHealthProfiling = (famId: string) => {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ['healthFamilyHealthProfiling', famId],
    queryFn: async () => {
      try {
        const res = await api2.get(`health-profiling/family-health-profiling/${famId}/`);
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: Infinity,
    enabled: !!famId
  });

  React.useEffect(() => {
    if (!famId) return;
    const channel = supabase
      .channel(`health-family-profiling-${famId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "family",
          filter: `fam_id=eq.${famId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['healthFamilyHealthProfiling', famId] });
        }
      ).subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [famId, queryClient]);

  return query;
};

export const useGetFamilyHealthProfilingSummary = () => {
  return useQuery({
    queryKey: ['healthFamilyHealthProfilingSummary'],
    queryFn: async () => {
      try {
        const res = await api2.get("health-profiling/family-health-profiling/summary/all/");
        return res.data;
      } catch (err) {
        throw err;
      }
    },
    staleTime: 5000
  });
};

// ============================================================================
// MUTATIONS
// ============================================================================

// Family Mutations
export const useCreateFamily = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/family/create/", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthFamilyList'] });
    }
  });
};

// Family Composition Mutations
export const useCreateFamilyCompositionBulk = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/family/composition/bulk/create/", data);
      return res.data;
    },
    onSuccess: (_, variables: any) => {
      if (variables.fam_id) {
        queryClient.invalidateQueries({ queryKey: ['healthFamilyMembers', variables.fam_id] });
      }
    }
  });
};

// Respondent Mutations
export const useCreateRespondent = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/respondents/create/", data);
      return res.data;
    }
  });
};

// Health Details Mutations
export const useCreateHealthRelatedDetails = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/per_additional_details/create/", data);
      return res.data;
    }
  });
};

// Mother Health Info Mutations
export const useCreateMotherHealthInfo = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/mother-health-info/", data);
      return res.data;
    }
  });
};

// Dependent Under Five Mutations
export const useCreateDependentUnderFive = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/dependent-under-five/create/", data);
      return res.data;
    }
  });
};

// Environmental Mutations
export const useSubmitEnvironmentalForm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/environmental-form/submit/", data);
      return res.data;
    },
    onSuccess: (_, variables: any) => {
      if (variables.hh_id) {
        queryClient.invalidateQueries({ queryKey: ['healthEnvironmentalData', variables.hh_id] });
      }
    }
  });
};

// NCD Mutations
export const useCreateNCD = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/ncd/create/", data);
      return res.data;
    },
    onSuccess: (_, variables: any) => {
      if (variables.fam_id) {
        queryClient.invalidateQueries({ queryKey: ['healthNCDByFamily', variables.fam_id] });
      }
    }
  });
};

// TB Surveillance Mutations
export const useCreateTBSurveillance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/tb-surveillance/create/", data);
      return res.data;
    },
    onSuccess: (_, variables: any) => {
      if (variables.fam_id) {
        queryClient.invalidateQueries({ queryKey: ['healthTBByFamily', variables.fam_id] });
      }
    }
  });
};

// Survey Identification Mutations
export const useSubmitSurveyIdentification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await api2.post("health-profiling/survey-identification/form/submit/", data);
      return res.data;
    },
    onSuccess: (_, variables: any) => {
      if (variables.fam_id) {
        queryClient.invalidateQueries({ queryKey: ['healthSurveyByFamily', variables.fam_id] });
      }
    }
  });
};
