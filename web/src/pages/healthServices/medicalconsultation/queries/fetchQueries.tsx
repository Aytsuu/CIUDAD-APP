import { useQuery } from '@tanstack/react-query';
import {getMedconRecordById,getMedicalRecord} from '../restful-api/get';
export const usePatientMedicalRecords = (patientId: string | null) => {
  return useQuery({
    queryKey: ['patientMedicalDetails', patientId],
    queryFn: () => patientId ? getMedconRecordById(patientId) : Promise.resolve(null),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!patientId,
  });
};


export const useMedicalRecord = () => {
    return useQuery({
        queryKey: ["MedicalRecord"],
        queryFn: getMedicalRecord,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};