
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
} from "../api/get-api" // Updated import
import { getAllPatients, getPatientById, createPatient } from "../api/get-api"

import { submitAnimalBiteReferral } from "./postrequest"

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
    queryFn: getAnimalBitePatientDetails,
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
    staleTime: 1000 * 60 * 1, // Cache for 1 minute, adjust as needed
  })
}

// NEW: Hook for unique patient summary (for overall view)
export const useAnimalBitePatientSummary = () => {
  return useQuery({
    queryKey: ["animalbite-patient-summary"],
    queryFn: getAnimalBitePatientSummary,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
  })
}

// Hook for individual patient's bite history
export const useAnimalBitePatientHistory = (patId: string) => {
  return useQuery({
    queryKey: ["animalbite-patient-history", patId],
    queryFn: () => getPatientRecordsByPatId(patId),
    enabled: !!patId, // Only run query if patId is available
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
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
    queryFn: getAnimalbiteReferrals, // This now calls getAnimalBitePatientDetails
    staleTime: 1000 * 60 * 5,
  })
}

export const useUniqueAnimalbitePatientsData = () => {
  return useQuery({
    queryKey: ["uniqueAnimalbitePatients"],
    queryFn: getUniqueAnimalbitePatients, // This now fetches from patient-summary endpoint
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

export const usePatientRecordsByPatId = (patId: string) => {
  return useQuery({
    queryKey: ["animalbitePatientHistory", patId],
    queryFn: () => getPatientRecordsByPatId(patId),
    enabled: !!patId,
    staleTime: 1000 * 60 * 5, // 5 minutes
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

// NEW: Mutation hook for submitting animal bite referrals
export const useSubmitAnimalBiteReferralMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitAnimalBiteReferral,
    onSuccess: () => {
      // Invalidate the query key that 'overall.tsx' uses to refetch data
      queryClient.invalidateQueries({ queryKey: ["animalbite-patient-summary"] })
      queryClient.invalidateQueries({ queryKey: ["animalbitePatientHistory"] }) // Also invalidate individual patient history queries
      toast.success("Animal bite referral submitted successfully!")
    },
    onError: (error: any) => {
      toast.error(`Failed to submit referral: ${error.message || "Unknown error"}`)
    },
  })
}

export const useSubmitAnimalBiteReferral = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: submitAnimalBiteReferral,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animalbite-patient-summary"] }) // Invalidate unique patient summary
      queryClient.invalidateQueries({ queryKey: ["animalbite-patient-counts"] }) // Invalidate aggregated counts
      queryClient.invalidateQueries({ queryKey: ["animalbite-referrals"] }) // Invalidate all referrals
      queryClient.invalidateQueries({ queryKey: ["animalbite-details"] }) // Invalidate all details
      // If you were on an individual patient's page, you might want to invalidate their history too
      queryClient.invalidateQueries({ queryKey: ["animalbite-patient-history"] }) // Invalidate all individual patient history queries
      toast.success("Animal bite referral submitted successfully!")
    },
    onError: (error: any) => {
      toast.error(`Failed to submit referral: ${error.message || "Unknown error"}`)
    },
  })
}

export const useRefreshAllData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      // These functions are now updated to fetch appropriate data as per get-api.tsx
      const patientSummary = await getAnimalBitePatientSummary() // Fetches unique patients
      const patientData = await getAnimalBitePatientDetails() // Fetches combined details
      const referralData = await getAnimalbiteReferrals() // Also fetches combined details
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
      queryClient.setQueryData(["animalbite-patient-summary"], data.patientSummary)
      queryClient.setQueryData(["animalbite-patients"], data.patientData)
      queryClient.setQueryData(["animalbite-referrals"], data.referralData)
      queryClient.setQueryData(["animalbite-details"], data.biteDetailsData)
      queryClient.setQueryData(["all-patients"], data.allPatientsData)
      toast.success("Data refreshed successfully!")
    },
    onError: (error) => {
      toast.error(`Failed to refresh data: ${error.message}`)
    },
  })
}