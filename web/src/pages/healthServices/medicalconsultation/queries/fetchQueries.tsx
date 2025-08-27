import { useQuery } from "@tanstack/react-query";
import { getMedconRecordById, getMedicalRecord, getPreviousBMI } from "../restful-api/get";

export const usePatientMedicalRecords = (id: string ) => {
  return useQuery({
    queryKey: ["patientMedicalDetails", id],
    queryFn: () => getMedconRecordById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
    retry: 3
  });
};

export const useMedicalRecord = () => {
  return useQuery({
    queryKey: ["MedicalRecord"],
    queryFn: getMedicalRecord,
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
