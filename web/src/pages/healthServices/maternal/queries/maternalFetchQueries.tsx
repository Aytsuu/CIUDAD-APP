"use client"

import { useQuery } from "@tanstack/react-query";
import { getPatients, 
			getMaternalRecords, 
			getPatientPostpartumCount,
			getPregnancyDetails 
} from "../restful-api/maternalGetAPI";

// for getPatients
export const usePatients = () => {
	return useQuery({
		queryKey: ["patientsData"],
		queryFn: getPatients,
		staleTime: 20 * 1000,
		retry: 2
	});
}

// for getMaternalRecords
export const useMaternalRecords = () => {
	return useQuery({
		queryKey: ["maternalRecords"],
		queryFn: getMaternalRecords,
		staleTime: 20 * 1000,
		retry: 2,
	});
}

// for getPatientPostpartumCount
export const usePatientPostpartumCount = (patientId: string) => {
  return useQuery({
	 queryKey: ["patientPostpartumCount", patientId],
	 queryFn: () => getPatientPostpartumCount(patientId),
	 enabled: !!patientId && patientId !== "undefined" && patientId !== "null",
	 staleTime: 60 * 1, 
	 retry: 1, 
	 refetchOnWindowFocus: true,
  })
}

// for getPregnancyDetails
export const usePregnancyDetails = (patientId: string) => {
	return useQuery({
		queryKey: ["pregnancyDetails", patientId],
		queryFn: () => getPregnancyDetails(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 3,
		// refetchOnWindowFocus: true,
	})
}