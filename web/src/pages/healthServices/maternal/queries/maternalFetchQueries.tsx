"use client"

import { useQuery } from "@tanstack/react-query";
import { getPatients, 
			getMaternalRecords, 
			getPatientPostpartumCount,
			getPregnancyDetails,
			getPrenatalPatientMedHistory,
			getPrenatalPatientObsHistory,
			getPrenatalPatientBodyMeasurement,
			getPatientPrenatalCount,
			getActivePregnanciesCount,
			getPrenatalPatientFollowUpVisits,
			getPrenatalPatientPrevHospitalization,
			getPrenatalPatientPrevPregnancy,
			getLatestPatientPrenatalRecord,
			getPrenatalPatientPrenatalCare
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

// for getActivePregnanciesCount
export const useActivepregnanciesCount = () => {
	return useQuery({
		queryKey: ["activePregnanciesCount"],
		queryFn: getActivePregnanciesCount,
		staleTime: 60 * 1, 
		retry: 2,
	})
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

// for getPatientPrenatalCount
export const usePatientPrenatalCount = (patientId: string) => {
	return useQuery({
		queryKey: ["patientPrenatalCount", patientId],
		queryFn: () => getPatientPrenatalCount(patientId),
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

// for getLatestPatientPrenatalRecord
export const useLatestPatientPrenatalRecord = (patientId: string) => {
	return useQuery({
		queryKey: ['latestPrenatalRecord', patientId],
		queryFn: () => getLatestPatientPrenatalRecord(patientId),
		enabled: !!patientId && patientId !== "undefined" && patientId !== "null",
		staleTime: 30 * 1,
		retry: 3,
	})
}

// for getPrenatalPatientMedHistory
export const usePrenatalPatientMedHistory = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientMedHistory", patientId],
		queryFn: () => getPrenatalPatientMedHistory(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 3,
		// refetchOnWindowFocus: true,
	})
}

// for getPrenatalPatientObsHistory
export const usePrenatalPatientObsHistory = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientObsHistory", patientId],
		queryFn: () => getPrenatalPatientObsHistory(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 3,
		// refetchOnWindowFocus: true,
	})
}

// for getPrenatalPatientBodyMeasurement
export const usePrenatalPatientBodyMeasurement = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientBodyMeasurement", patientId],
		queryFn: () => getPrenatalPatientBodyMeasurement(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 3,
	})
}

// for getPrenatalPatientFollowUpVisits
export const  usePrenatalPatientFollowUpVisits = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientFollowUpVisits", patientId],
		queryFn: () => getPrenatalPatientFollowUpVisits(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 3
	})
}

// for getPrenatalPatientPrevHospitalization
export const usePrenatalPatientPrevHospitalization = (patientid: string) => {
	return useQuery({
		queryKey: ["prenatalPatientPrevHospitalization", patientid],
		queryFn: () => getPrenatalPatientPrevHospitalization(patientid),
		enabled: !!patientid,
		staleTime: 30 * 1,
		retry: 3
	})
}

// for getPrenatalPatientPrevPregnancy
export const usePrenatalPatientPrevPregnancy = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientPrevPregnancy", patientId],
		queryFn: () => getPrenatalPatientPrevPregnancy(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 3
	})
}

// for getPrenatalPatientPrenatalCare
export const usePrenatalPatientPrenatalCare = (patientId: string, pregnancyId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientPrenatalCare", patientId, pregnancyId],
		queryFn: () => getPrenatalPatientPrenatalCare(patientId, pregnancyId),
		enabled: !!patientId && !!pregnancyId,
		staleTime: 30 * 1,
		retry: 3
	})
}