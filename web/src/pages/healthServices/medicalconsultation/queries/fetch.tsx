import { useQuery } from "@tanstack/react-query";
import { getConsultationHistory, getconfirmedAppointments, getpendingAppointments, getMedicalRecord, getPreviousBMI, getMedConPHHistory, getFamHistory } from "../restful-api/get";

export const useConsultationHistory = ( patientId?: string, page?: number, 
  pageSize?: number, 
  searchQuery?: string,
  currentConsultationId?: number
) => {
  return useQuery<any>({
    queryKey: ["consultationHistory", patientId, page, pageSize, searchQuery, currentConsultationId],
    queryFn: () => getConsultationHistory(patientId, page, pageSize, searchQuery, currentConsultationId),
    enabled: !!patientId
  });
};
export const useMedicalRecord = (params?: { page?: number; page_size?: number; search?: string; patient_type?: string }) => {
  return useQuery({
    queryKey: ["MedicalRecord", params],
    queryFn: () => getMedicalRecord(params),
    staleTime: 1000 * 60 * 5,
    retry: 3
  });
};

export const usePreviousBMI = (id: string) => {
  return useQuery({
    queryKey: ["previousBMI", id],
    queryFn: () => getPreviousBMI(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
    retry: 3
  });
};

export const useMedConPHHistory = (pat_id: string) => {
  return useQuery({
    queryKey: ["MedConPHHistory", pat_id],
    queryFn: () => getMedConPHHistory(pat_id),
    staleTime: 1000 * 60 * 5,
    enabled: !!pat_id,
    retry: 3
  });
};

export const useFamHistory = (pat_id: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ["familyHistory", pat_id, searchQuery],
    queryFn: () => getFamHistory(pat_id, searchQuery),
    staleTime: 1000 * 60 * 5,
    enabled: !!pat_id,
    retry: 3
  });
};

export const usePendingAppointments = (page: number = 1, pageSize: number = 10, search: string = "", dateFilter: string = "all") => {
  return useQuery<any>({
    queryKey: ["pendingmedicalapp", page, pageSize, search, dateFilter],
    queryFn: () => getpendingAppointments(page, pageSize, search, dateFilter)
  });
};

export const useConfimedAppointments = (page: number = 1, pageSize: number = 10, search: string = "", dateFilter: string = "all") => {
  return useQuery<any>({
    queryKey: ["confirmedmedicalapp", page, pageSize, search, dateFilter],
    queryFn: () => getconfirmedAppointments(page, pageSize, search, dateFilter)
  });
};
