import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getAnimalbiteDetails,
  getAnimalBitePatientDetails,
  getAnimalbiteReferrals,
  getUniqueAnimalbitePatients,
  getPatientRecordsByPatId,
  getPatientRecordsByReferralId,
  getAnimalBitePatientCounts,
  getAnimalBitePatientSummary,
} from "../api/get-api"
import { getAllPatients, getPatientById, createPatient } from "../api/get-api"
import { useToastContext } from "@/components/ui/toast"

export const useAllPatients = () => {
  return useQuery({
    queryKey: ["all-patients"],
    queryFn: getAllPatients,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const usePatient = (patientId: string) => {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useAnimalBitePatientDetails = () => {
  return useQuery({
    queryKey: ["animalbite-patients"],
    queryFn: () => getAnimalBitePatientDetails(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export const useCreatePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientData: any) => createPatient(patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-patients"] })
    },
  })
}

export const useAnimalBitePatientCounts = () => {
  return useQuery({
    queryKey: ["animalbite-patient-counts"],
    queryFn: getAnimalBitePatientCounts,
    staleTime: 1000 * 60 * 1,
  })
}

export const useAnimalBitePatientSummary = (params?: {
  search?: string;
  filter?: string;
  page?: number;
  limit?: number;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: ["animalbite-patient-summary", params],
    queryFn: () => getAnimalBitePatientSummary(params),
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true, // This helps with smooth pagination
  });
};
// Hook for individual patient's bite history
export const useAnimalBitePatientHistory = (patId: string) => {
  return useQuery({
    queryKey: ["animalbite-patient-history", patId],
    queryFn: () => getPatientRecordsByPatId(patId),
    enabled: !!patId,
    staleTime: 1000 * 60 * 1,
  })
}

export const useAnimalbiteDetails = () => {
  return useQuery({
    queryKey: ["animalbite-details"],
    queryFn: getAnimalbiteDetails,
    staleTime: 1000 * 60 * 5,
  })
}

export const useAnimalbiteReferrals = () => {
  return useQuery({
    queryKey: ["animalbite-referrals"],
    queryFn: getAnimalbiteReferrals,
    staleTime: 1000 * 60 * 5,
  })
}

export const useUniqueAnimalbitePatients = (params?: {
  search?: string;
  filter?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["unique-animalbite-patients", params],
    queryFn: () => getUniqueAnimalbitePatients(params),
    staleTime: 1000 * 60 * 5,
  })
}

export const usePatientRecordsByPatId = (patId: string) => {
  return useQuery({
    queryKey: ["animalbitePatientHistory", patId],
    queryFn: () => getPatientRecordsByPatId(patId),
    enabled: !!patId,
    staleTime: 1000 * 60 * 5,
  })
}

export const usePatientRecordsByReferralId = (referralId: string) => {
  return useQuery({
    queryKey: ["patientRecordsByReferralId", referralId],
    queryFn: () => getPatientRecordsByReferralId(referralId),
    enabled: !!referralId,
    staleTime: 1000 * 60 * 30,
  })
}

export const useRefreshAllData = () => {
  const queryClient = useQueryClient()
  const { toast } = useToastContext();
  return useMutation({
    mutationFn: async () => {
      const patientSummary = await getUniqueAnimalbitePatients({ 
        page: 1, 
        limit: 20 
      })
      const patientData = await getAnimalBitePatientDetails()
      const referralData = await getAnimalbiteReferrals()
      const biteDetailsData = await getAnimalbiteDetails()
      const allPatientsData = await getAllPatients()

      return {
        patientSummary,
        patientData,
        referralData,
        biteDetailsData,
        allPatientsData,
      }
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["animalbite-patient-summary"] })
      queryClient.invalidateQueries({ queryKey: ["animalbite-patients"] })
      queryClient.invalidateQueries({ queryKey: ["animalbite-referrals"] })
      queryClient.invalidateQueries({ queryKey: ["animalbite-details"] })
      queryClient.invalidateQueries({ queryKey: ["all-patients"] })
      toast.success("Data refreshed successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to refresh data: ${error.message}`)
    },
  })
}