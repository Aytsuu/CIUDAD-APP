import { useQuery } from "@tanstack/react-query";
import { getConsultationHistory, getMedicalRecord, getPreviousBMI,getMedConPHHistory } from "../restful-api/get";

export const useConsultationHistory = (patientId: string, page: number, pageSize: number) => {
  return useQuery<any>({
    queryKey: ["consultationHistory", patientId, page, pageSize],
    queryFn: () => getConsultationHistory(patientId, page, pageSize),
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