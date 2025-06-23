import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getAnimalbiteDetails, getAnimalBitePatientDetails, getAnimalbiteReferrals, getUniqueAnimalbitePatients, getPatientRecordsByPatId, getPatientRecordsByReferralId} from "../api/get-api" // Updated import
import { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient } from "../api/get-api"
import { toast } from "sonner"
import { submitAnimalBiteReferral } from "./postrequest"

// // Existing hooks...

// export const useAllPatients = () => {
//   return useQuery({
//     queryKey: ["all-patients"],
//     queryFn: getAllPatients,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   })
// }

// export const usePatient = (patientId: string) => {
//   return useQuery({
//     queryKey: ["patient", patientId],
//     queryFn: () => getPatientById(patientId),
//     enabled: !!patientId,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   })
// }

// export const useCreatePatient = () => {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: (patientData: any) => createPatient(patientData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["all-patients"] })
//     },
//   })
// }

// export const useUpdatePatient = () => {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: ({ patientId, patientData }: { patientId: string; patientData: any }) =>
//       updatePatient(patientId, patientData),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["all-patients"] })
//       queryClient.invalidateQueries({ queryKey: ["patient"] })
//     },
//   })
// }
// export const useDeletePatient = () => {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: (patientId: string) => deletePatient(patientId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["all-patients"] })
//     },
//   })
// }

// export const useAnimalbiteDetails = () => {
//   return useQuery({
//     queryKey: ["animalbite-details"],
//     queryFn: getAnimalbiteDetails,
//     staleTime: 1000 * 60 * 5,
//   })
// }

// export const useAnimalbiteReferrals = () => {
//   return useQuery({
//     queryKey: ["animalbite-referrals"],
//     queryFn: getAnimalbiteReferrals, // This now calls getAnimalBitePatientDetails
//     staleTime: 1000 * 60 * 5,
//   })
// }

// export const useUniqueAnimalbitePatients = () => {
//   return useQuery({
//     queryKey: ["unique-animalbite-patients"],
//     queryFn: getUniqueAnimalbitePatients,
//     staleTime: 1000 * 60 * 5,
//   })
// }

// export const usePatientRecordsByPatId = (patId: string) => {
//   return useQuery({
//     queryKey: ["patientRecordsByPatId", patId],
//     queryFn: () => getPatientRecordsByPatId(patId),
//     enabled: !!patId,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const usePatientRecordsByReferralId = (referralId: string) => {
//   return useQuery({
//     queryKey: ["patientRecordsByReferralId", referralId],
//     queryFn: () => getPatientRecordsByReferralId(referralId),
//     enabled: !!referralId,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useRefreshAllData = () => {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: async () => {
//       // These functions are now updated to fetch appropriate data as per get-api.tsx
//       const patientData = await getAnimalBitePatientDetails() // Fetches combined details
//       const referralData = await getAnimalbiteReferrals() // Also fetches combined details
//       const biteDetailsData = await getAnimalbiteDetails()
//       const allPatientsData = await getAllPatients()
   

//       return {
//         patientData,
//         referralData,
//         biteDetailsData,
//         allPatientsData,

//       }
//     },
//     onSuccess: async (data) => {
//       queryClient.setQueryData(["animalbite-patients"], data.patientData)
//       queryClient.setQueryData(["animalbite-referrals"], data.referralData)
//       queryClient.setQueryData(["animalbite-details"], data.biteDetailsData)
//       queryClient.setQueryData(["all-patients"], data.allPatientsData)
//       toast.success("Data refreshed successfully!")
//     },
//     onError: (error) => {
//       toast.error(`Failed to refresh data: ${error.message}`)
//     },
//   })
// }


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

export const useCreatePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientData: any) => createPatient(patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-patients"] })
    },
  })
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ patientId, patientData }: { patientId: string; patientData: any }) =>
      updatePatient(patientId, patientData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-patients"] })
      queryClient.invalidateQueries({ queryKey: ["patient"] })
    },
  })
}
export const useDeletePatient = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (patientId: string) => deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-patients"] })
    },
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

export const useUniqueAnimalbitePatients = () => {
  return useQuery({
    queryKey: ["unique-animalbite-patients"],
    queryFn: getUniqueAnimalbitePatients,
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
    onSuccess: () => {
      // Invalidate the query key that 'overall.tsx' uses to refetch data
      queryClient.invalidateQueries({ queryKey: ["animalbite-records"] });
      queryClient.invalidateQueries({ queryKey: ["animalbitePatientHistory"] }); // Also invalidate individual patient history queries
      toast.success("Animal bite referral submitted successfully!");
    },
    onError: (error: any) => {
      toast.error(`Failed to submit referral: ${error.message || "Unknown error"}`);
    },
  });
};


export const useRefreshAllData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      // These functions are now updated to fetch appropriate data as per get-api.tsx
      const patientData = await getAnimalBitePatientDetails() // Fetches combined details
      const referralData = await getAnimalbiteReferrals() // Also fetches combined details
      const biteDetailsData = await getAnimalbiteDetails()
      const allPatientsData = await getAllPatients()
   

      return {
        patientData,
        referralData,
        biteDetailsData,
        allPatientsData,

      }
    },
    onSuccess: async (data) => {
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