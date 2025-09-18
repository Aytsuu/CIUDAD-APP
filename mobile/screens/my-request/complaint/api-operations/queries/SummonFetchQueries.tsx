import { useQuery } from "@tanstack/react-query";
import { getSummonDates, getSummonTimeSlots, getCaseTracking } from "../restful-api/SummonGetApi.";

export type SummonDates = {
    sd_id: number;
    sd_date: string;
}

export const useGetSummonDates = () => {
    return useQuery<SummonDates[]>({
        queryKey: ['summonDates'],
        queryFn: getSummonDates,
        staleTime: 5000
    })
}


export type SummonTimeSlots = {
    st_id?: number;
    st_start_time: string;
    st_end_time: string;
    sd_id?: number;
    st_is_booked?: boolean;
}

export const useGetSummonTimeSlots = (sd_id: number) => {
    return useQuery<SummonTimeSlots[]>({
        queryKey: ['summonTimeSlots', sd_id],
        queryFn: () => getSummonTimeSlots(sd_id),
        staleTime: 5000
    })
}

export type CaseStep = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "accepted" | "rejected";
  details?: string;
};

export type ServiceChargeDecision = {
  scd_decision_date?: string;
  scd_reason?: string;
};

export type ServiceChargePayment = {
  spay_id?: number;
  spay_status?: string;
  spay_due_date?: string;
  spay_date_paid?: string;
  amount?: number;
  purpose?: string;
};

export type SummonSchedule = {
  ss_id?: number;
  ss_mediation_level?: string;
  ss_is_rescheduled?: boolean;
  ss_reason?: string;
  date?: string;
  time?: string;
};

export type CaseTrackingData = {
  sr_id: string;
  sr_code?: string;
  sr_type?: string;
  sr_req_date: string;
  sr_req_status: string;
  sr_case_status: string;
  sr_date_marked?: string;
  decision?: ServiceChargeDecision;
  payment?: ServiceChargePayment;
  schedule?: SummonSchedule;
  current_step: CaseStep[];
  progress_percentage: number;
};

// Hook to fetch case tracking data
export const useGetCaseTracking = (comp_id: string) => {
  return useQuery<CaseTrackingData>({
    queryKey: ['caseTracking', comp_id],
    queryFn: () => getCaseTracking(comp_id),
    staleTime: 5000,
    enabled: !!comp_id, // Only run query if comp_id is provided
  });
}