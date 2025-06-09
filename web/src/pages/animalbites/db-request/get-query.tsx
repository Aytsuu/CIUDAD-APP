// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
// import {
//   getAnimalbiteDetails,
//   getAnimalbitePatients,
//   getAnimalbiteReferrals,
//   getAllPatients,
//   getBitingAnimals,
//   getExposureSites,
//   getStaffMembers,
//   getUniqueAnimalbitePatients,
// } from "../api/get-api"

// export const useAnimalBitePatient = () => {
//   return useQuery({
//     queryKey: ["animalbite-patients"],
//     queryFn: getAnimalbitePatients,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useAllPatients = () => {
//   return useQuery({
//     queryKey: ["all-patients"],
//     queryFn: getAllPatients,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useAnimalbiteReferrals = () => {
//   return useQuery({
//     queryKey: ["animalbite-referrals"],
//     queryFn: getAnimalbiteReferrals,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useAnimalbiteDetails = () => {
//   return useQuery({
//     queryKey: ["animalbite-details"],
//     queryFn: getAnimalbiteDetails,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useBitingAnimals = () => {
//   return useQuery({
//     queryKey: ["biting-animals"],
//     queryFn: getBitingAnimals,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useExposureSites = () => {
//   return useQuery({
//     queryKey: ["exposure-sites"],
//     queryFn: getExposureSites,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useStaffMembers = () => {
//   return useQuery({
//     queryKey: ["staff-members"],
//     queryFn: getStaffMembers,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useUniqueAnimalbitePatients = () => {
//   return useQuery({
//     queryKey: ["unique-animalbite-patients"],
//     queryFn: getUniqueAnimalbitePatients,
//     staleTime: 1000 * 60 * 30,
//   })
// }

// export const useRefreshAllData = () => {
//   const queryClient = useQueryClient()
//   return useMutation({
//     mutationFn: async () => {
//       const patientData = await getAnimalbitePatients()
//       const referralData = await getAnimalbiteReferrals()
//       const biteDetailsData = await getAnimalbiteDetails()
//       const allPatientsData = await getAllPatients()
//       const bitingAnimalsData = await getBitingAnimals()
//       const exposureSitesData = await getExposureSites()

//       return {
//         patientData,
//         referralData,
//         biteDetailsData,
//         allPatientsData,
//         bitingAnimalsData,
//         exposureSitesData,
//       }
//     },
//     onSuccess: async (data) => {
//       queryClient.setQueryData(["animalbite-patients"], data.patientData)
//       queryClient.setQueryData(["animalbite-referrals"], data.referralData)
//       queryClient.setQueryData(["animalbite-details"], data.biteDetailsData)
//       queryClient.setQueryData(["all-patients"], data.allPatientsData)
//       queryClient.setQueryData(["biting-animals"], data.bitingAnimalsData)
//       queryClient.setQueryData(["exposure-sites"], data.exposureSitesData)
//     },
//   })
// }
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getAnimalbiteDetails,
  getAnimalbitePatients,
  getAnimalbiteReferrals,

  getUniqueAnimalbitePatients,
  getPatientRecordsByPatId,
  getPatientRecordsByReferralId,
} from "../api/get-api"
import { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient } from "../api/get-api"

// Existing hooks...

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patient", variables.patientId] })
      queryClient.invalidateQueries({ queryKey: ["all-patients"] })
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
export const useAnimalBitePatient = () => {
  return useQuery({
    queryKey: ["animalbite-patients"],
    queryFn: getAnimalbitePatients,
    staleTime: 1000 * 60 * 30,
  })
}


export const useAnimalbiteReferrals = () => {
  return useQuery({
    queryKey: ["animalbite-referrals"],
    queryFn: getAnimalbiteReferrals,
    staleTime: 1000 * 60 * 30,
  })
}

export const useAnimalbiteDetails = () => {
  return useQuery({
    queryKey: ["animalbite-details"],
    queryFn: getAnimalbiteDetails,
    staleTime: 1000 * 60 * 30,
  })
}

export const useUniqueAnimalbitePatients = () => {
  return useQuery({
    queryKey: ["unique-animalbite-patients"],
    queryFn: getUniqueAnimalbitePatients,
    staleTime: 1000 * 60 * 30,
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

export const useRefreshAllData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const patientData = await getAnimalbitePatients()
      const referralData = await getAnimalbiteReferrals()
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
   
      
      // Also invalidate the unique patients query
      queryClient.invalidateQueries({ queryKey: ["unique-animalbite-patients"] })
    },
  })
}