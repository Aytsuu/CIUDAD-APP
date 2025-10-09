import { useQuery } from "@tanstack/react-query";
import { getConsultationHistory, getMedicalRecord, getPreviousBMI,getMedConPHHistory,getFamHistory } from "../restful-api/get";

export const useConsultationHistory = (patientId?: string, page?: number, pageSize?: number, searchQuery?: string) => {
  return useQuery<any>({
    queryKey: ["consultationHistory", patientId, page, pageSize, searchQuery],
    queryFn: () => getConsultationHistory(patientId, page, pageSize, searchQuery),
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


export const useMedConPHHistory=(pat_id:string)=>{
  return useQuery({
    queryKey: ["MedConPHHistory", pat_id],
    queryFn: () => getMedConPHHistory(pat_id),
    staleTime: 1000 * 60 * 5,
    enabled: !!pat_id,
    retry: 3
  });
}

export const useFamHistory = (pat_id: string, searchQuery?: string) => {
  return useQuery({
    queryKey: ["familyHistory", pat_id, searchQuery],
    queryFn: () => getFamHistory(pat_id, searchQuery),
    staleTime: 1000 * 60 * 5,
    enabled: !!pat_id,
    retry: 3
  });
};