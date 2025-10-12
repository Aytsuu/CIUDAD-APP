import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  updateNCD,
  updateTBSurveillance,
  updateSurveyIdentificationWithHistory,
  updateWaterSupplyWithHistory,
  updateSanitaryFacilityWithHistory,
  updateSolidWasteWithHistory,
  getNCDHistory,
  getTBHistory,
  getSurveyHistory,
  getWaterSupplyHistory,
  getSanitaryFacilityHistory,
  getSolidWasteHistory,
  getEnvironmentalHealthHistory,
} from "../restful-api/profilingHistoryAPI";
import { toast } from "sonner";
import { CircleX } from "lucide-react";

// ==================== UPDATE MUTATIONS ====================

export const useUpdateNCD = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      ncd_id,
      data,
    }: {
      ncd_id: string;
      data: {
        ncd_riskclass_age?: string;
        ncd_comorbidities?: string;
        ncd_lifestyle_risk?: string;
        ncd_maintenance_status?: string;
        staff_id?: string;
      };
    }) => updateNCD(ncd_id, data),
    onSuccess: (_, variables) => {
      // Toast removed - handled by save handler
      queryClient.invalidateQueries({ queryKey: ["family-health-profiling"] });
      queryClient.invalidateQueries({ queryKey: ["ncd-history", variables.ncd_id] });
    },
    onError: (error: any) => {
      toast("Failed to update NCD record", {
        description: error?.response?.data?.message || "An error occurred",
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};

export const useUpdateTBSurveillance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      tb_id,
      data,
    }: {
      tb_id: string;
      data: {
        tb_meds_source?: string;
        tb_days_taking_meds?: number;
        tb_status?: string;
        staff_id?: string;
      };
    }) => updateTBSurveillance(tb_id, data),
    onSuccess: (_, variables) => {
      // Toast removed - handled by save handler
      queryClient.invalidateQueries({ queryKey: ["family-health-profiling"] });
      queryClient.invalidateQueries({ queryKey: ["tb-history", variables.tb_id] });
    },
    onError: (error: any) => {
      toast("Failed to update TB Surveillance record", {
        description: error?.response?.data?.message || "An error occurred",
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};

export const useUpdateSurveyIdentification = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      si_id,
      data,
    }: {
      si_id: string;
      data: {
        si_filled_by?: string;
        si_informant?: string;
        si_checked_by?: string;
        si_date?: string;
        si_signature?: string;
        staff_id?: string;
      };
    }) => updateSurveyIdentificationWithHistory(si_id, data),
    onSuccess: (_, variables) => {
      // Toast removed - handled by save handler
      queryClient.invalidateQueries({ queryKey: ["family-health-profiling"] });
      queryClient.invalidateQueries({ queryKey: ["survey-history", variables.si_id] });
    },
    onError: (error: any) => {
      toast("Failed to update Survey Identification", {
        description: error?.response?.data?.message || "An error occurred",
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};

export const useUpdateWaterSupply = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      water_sup_id,
      data,
    }: {
      water_sup_id: string;
      data: {
        water_sup_type?: string;
        water_conn_type?: string;
        water_sup_desc?: string;
        staff_id?: string;
      };
    }) => updateWaterSupplyWithHistory(water_sup_id, data),
    onSuccess: (_, variables) => {
      // Toast removed - handled by save handler
      queryClient.invalidateQueries({ queryKey: ["family-health-profiling"] });
      queryClient.invalidateQueries({ queryKey: ["water-supply-history", variables.water_sup_id] });
    },
    onError: (error: any) => {
      toast("Failed to update Water Supply", {
        description: error?.response?.data?.message || "An error occurred",
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};

export const useUpdateSanitaryFacility = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      sf_id,
      data,
    }: {
      sf_id: string;
      data: {
        sf_type?: string;
        sf_desc?: string;
        sf_toilet_type?: string;
        staff_id?: string;
      };
    }) => updateSanitaryFacilityWithHistory(sf_id, data),
    onSuccess: (_, variables) => {
      // Toast removed - handled by save handler
      queryClient.invalidateQueries({ queryKey: ["family-health-profiling"] });
      queryClient.invalidateQueries({ queryKey: ["sanitary-facility-history", variables.sf_id] });
    },
    onError: (error: any) => {
      toast("Failed to update Sanitary Facility", {
        description: error?.response?.data?.message || "An error occurred",
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};

export const useUpdateSolidWaste = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      swm_id,
      data,
    }: {
      swm_id: string;
      data: {
        swn_desposal_type?: string;
        swm_desc?: string;
        staff_id?: string;
      };
    }) => updateSolidWasteWithHistory(swm_id, data),
    onSuccess: (_, variables) => {
      // Toast removed - handled by save handler
      queryClient.invalidateQueries({ queryKey: ["family-health-profiling"] });
      queryClient.invalidateQueries({ queryKey: ["solid-waste-history", variables.swm_id] });
    },
    onError: (error: any) => {
      toast("Failed to update Solid Waste Management", {
        description: error?.response?.data?.message || "An error occurred",
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};

// ==================== HISTORY QUERIES ====================

export const useNCDHistory = (ncd_id: string | null) => {
  return useQuery({
    queryKey: ["ncd-history", ncd_id],
    queryFn: () => getNCDHistory(ncd_id!),
    enabled: !!ncd_id,
    select: (data) => data?.data || [],
  });
};

export const useTBHistory = (tb_id: string | null) => {
  return useQuery({
    queryKey: ["tb-history", tb_id],
    queryFn: () => getTBHistory(tb_id!),
    enabled: !!tb_id,
    select: (data) => data?.data || [],
  });
};

export const useSurveyHistory = (si_id: string | null) => {
  return useQuery({
    queryKey: ["survey-history", si_id],
    queryFn: () => getSurveyHistory(si_id!),
    enabled: !!si_id,
    select: (data) => data?.data || [],
  });
};

export const useWaterSupplyHistory = (water_sup_id: string | null) => {
  return useQuery({
    queryKey: ["water-supply-history", water_sup_id],
    queryFn: () => getWaterSupplyHistory(water_sup_id!),
    enabled: !!water_sup_id,
    select: (data) => data?.data || [],
  });
};

export const useSanitaryFacilityHistory = (sf_id: string | null) => {
  return useQuery({
    queryKey: ["sanitary-facility-history", sf_id],
    queryFn: () => getSanitaryFacilityHistory(sf_id!),
    enabled: !!sf_id,
    select: (data) => data?.data || [],
  });
};

export const useSolidWasteHistory = (swm_id: string | null) => {
  return useQuery({
    queryKey: ["solid-waste-history", swm_id],
    queryFn: () => getSolidWasteHistory(swm_id!),
    enabled: !!swm_id,
    select: (data) => data?.data || [],
  });
};

export const useEnvironmentalHealthHistory = (hh_id: string | null) => {
  return useQuery({
    queryKey: ["environmental-health-history", hh_id],
    queryFn: () => getEnvironmentalHealthHistory(hh_id!),
    enabled: !!hh_id,
    select: (data) => data?.data || {},
  });
};
