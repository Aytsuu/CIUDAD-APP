import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAnimalbiteDetails, getAnimalBitePatientDetails, getAnimalbiteReferrals, getUniqueAnimalbitePatients, getPatientRecordsByPatId, getPatientRecordsByReferralId, getAnimalBitePatientSummary, getAnimalBiteAnalytics, getAnimalBitePatientAnalytics} from "../api/get-api" // Updated import
import { getAllPatients, getPatientById, createPatient } from "../api/get-api"
import { toast } from "sonner"
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

export const useAnimalBitePatientSummary = () => {
  return useQuery({
    queryKey: ["animalbite-patient-summary"],
    queryFn: () => getAnimalBitePatientSummary(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

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
    queryKey: ["patientRecordsByPatId", patId],
    queryFn: () => getPatientRecordsByPatId(patId),
    enabled: !!patId,
    staleTime: 1000 * 60 * 30,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitAnimalBiteReferral,
    onSuccess: (_data, variables) => {
      // Get the patient ID from the submitted data
      const patientId = variables.pat_id;
      
      // Invalidate both overall and individual queries
      queryClient.invalidateQueries({ queryKey: ["animalbite-records"] });
      queryClient.invalidateQueries({ 
        queryKey: ["animalBiteHistory", patientId] 
      });
      
      toast.success("Animal bite referral submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to submit referral: ${error.message || "Unknown error"}`);
    },
  });
};

export const useRefreshAllData = () => {
  const queryClient = useQueryClient()
  const { toast } = useToastContext();
  return useMutation({
    mutationFn: async () => {
      // These functions are now updated to fetch appropriate data as per get-api.tsx
      const patientSummary = await getUniqueAnimalbitePatients({ 
        page: 1, 
        limit: 20 
      })
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

function useToastContext(): { toast: any } {
  throw new Error("Function not implemented.")
}


export const useAnimalBiteAnalytics = ({ months = 12, month }: { months?: number; month?: string }) => {
  return useQuery({
    queryKey: ["animal-bite-analytics", months, month],
    queryFn: () => getAnimalBiteAnalytics({ months, month }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAnimalBitePatientAnalytics = (patientId: string) => {
  return useQuery({
    queryKey: ["animal-bite-patient-analytics", patientId],
    queryFn: () => getAnimalBitePatientAnalytics(patientId),
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5,
  });
};
