import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  getAnimalbiteDetails,
  getAnimalbitePatients,
  getAnimalbiteReferrals,
  getAllPatients,
  getBitingAnimals,
  getExposureSites,
  getStaffMembers,
  getUniqueAnimalbitePatients,
} from "../api/get-api"

export const useAnimalBitePatient = () => {
  return useQuery({
    queryKey: ["animalbite-patients"],
    queryFn: getAnimalbitePatients,
    staleTime: 1000 * 60 * 30,
  })
}

export const useAllPatients = () => {
  return useQuery({
    queryKey: ["all-patients"],
    queryFn: getAllPatients,
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

export const useBitingAnimals = () => {
  return useQuery({
    queryKey: ["biting-animals"],
    queryFn: getBitingAnimals,
    staleTime: 1000 * 60 * 30,
  })
}

export const useExposureSites = () => {
  return useQuery({
    queryKey: ["exposure-sites"],
    queryFn: getExposureSites,
    staleTime: 1000 * 60 * 30,
  })
}

export const useStaffMembers = () => {
  return useQuery({
    queryKey: ["staff-members"],
    queryFn: getStaffMembers,
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

export const useRefreshAllData = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const patientData = await getAnimalbitePatients()
      const referralData = await getAnimalbiteReferrals()
      const biteDetailsData = await getAnimalbiteDetails()
      const allPatientsData = await getAllPatients()
      const bitingAnimalsData = await getBitingAnimals()
      const exposureSitesData = await getExposureSites()

      return {
        patientData,
        referralData,
        biteDetailsData,
        allPatientsData,
        bitingAnimalsData,
        exposureSitesData,
      }
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(["animalbite-patients"], data.patientData)
      queryClient.setQueryData(["animalbite-referrals"], data.referralData)
      queryClient.setQueryData(["animalbite-details"], data.biteDetailsData)
      queryClient.setQueryData(["all-patients"], data.allPatientsData)
      queryClient.setQueryData(["biting-animals"], data.bitingAnimalsData)
      queryClient.setQueryData(["exposure-sites"], data.exposureSitesData)
    },
  })
}
