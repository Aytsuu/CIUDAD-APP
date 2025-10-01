"use client"

import { useQuery } from "@tanstack/react-query";
import { getPatients, 
			getMaternalRecords, 
			getMaternalCounts,
			getPatientPostpartumCount,
			getPregnancyDetails,
			getPrenatalPatientMedHistory,
			getPrenatalPatientObsHistory,
			getPrenatalPatientBodyMeasurement,
			getPatientPrenatalCount,
			getPrenatalPatientFollowUpVisits,
			getPrenatalPatientPrevHospitalization,
			getPrenatalPatientPrevPregnancy,
			getLatestPatientPrenatalRecord,
			getPrenatalPatientPrenatalCare,
			getPrenatalRecordComplete,
			getPatientTTStatus,
			getCalculatedMissedVisits,
			getLatestPatientPostpartumRecord,
			getIllnessList,
			getPatientPostpartumCompleteRecord,
			getPatientPostpartumAllRecords,
} from "../restful-api/maternalGetAPI";

import { MaternalPatientFilters } from "../restful-api/maternalGetAPI";


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
export const useMaternalRecords = (filters: MaternalPatientFilters, options = {}) => {
	return useQuery({
		queryKey: ["maternalRecords", filters],
		queryFn: () => getMaternalRecords(filters),
		staleTime: 20 * 1000,
		retry: 2,
		refetchInterval: 2000,
		...options
	});
}

// maternal and active pregnancies count
export const useMaternalCounts = () => {
	return useQuery({
		queryKey: ["maternalCounts"],
		queryFn: getMaternalCounts,
		staleTime: 20 * 1000, 
		retry: 1, 
		refetchInterval: 2000,
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
export const usePregnancyDetails = (patientId: string, filters: Partial<MaternalPatientFilters> = {}) => {
	return useQuery({
		queryKey: ["pregnancyDetails", { patientId, ...filters }],
		queryFn: () => getPregnancyDetails({ patientId, ...filters }),
		enabled: !!patientId,
		staleTime: 30 * 1,
		refetchInterval: 2000,
		retry: 2,
	})
}

// for getLatestPatientPrenatalRecord
export const useLatestPatientPrenatalRecord = (patientId: string) => {
	return useQuery({
		queryKey: ['latestPrenatalRecord', patientId],
		queryFn: () => getLatestPatientPrenatalRecord(patientId),
		enabled: !!patientId && patientId !== "undefined" && patientId !== "null",
		staleTime: 30 * 1,
		retry: 2,
	})
}

// for getPrenatalPatientMedHistory
export const usePrenatalPatientMedHistory = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientMedHistory", patientId],
		queryFn: () => getPrenatalPatientMedHistory(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 2,
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
		retry: 2,
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
		retry: 2,
	})
}

// for getPrenatalPatientFollowUpVisits
export const  usePrenatalPatientFollowUpVisits = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientFollowUpVisits", patientId],
		queryFn: () => getPrenatalPatientFollowUpVisits(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 2
	})
}

// for getPrenatalPatientPrevHospitalization
export const usePrenatalPatientPrevHospitalization = (patientid: string) => {
	return useQuery({
		queryKey: ["prenatalPatientPrevHospitalization", patientid],
		queryFn: () => getPrenatalPatientPrevHospitalization(patientid),
		enabled: !!patientid,
		staleTime: 30 * 1,
		retry: 2
	})
}

// for getPrenatalPatientPrevPregnancy
export const usePrenatalPatientPrevPregnancy = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientPrevPregnancy", patientId],
		queryFn: () => getPrenatalPatientPrevPregnancy(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 2
	})
}

// for getPrenatalPatientPrenatalCare
export const usePrenatalPatientPrenatalCare = (patientId: string, pregnancyId: string) => {
	return useQuery({
		queryKey: ["prenatalPatientPrenatalCare", patientId, pregnancyId],
		queryFn: () => getPrenatalPatientPrenatalCare(patientId, pregnancyId),
		enabled: !!patientId && !!pregnancyId,
		staleTime: 30 * 1,
		retry: 2
	})
}

// for getPrenatalRecordComplete
export const usePrenatalRecordComplete = (patientId: string) => {
	return useQuery({
		queryKey: ["prenatalRecordComplete", patientId],
		queryFn: () => getPrenatalRecordComplete(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 2
	})
}

// for getPatientTTStatus
export const usePatientTTStatus = (patientId: string) => {
	return useQuery({
		queryKey: ["patientTTStatus", patientId],
		queryFn: () => getPatientTTStatus(patientId),
		enabled: !!patientId,
		staleTime: 30 * 1,
		retry: 2
	})
}

// for getCalculatedMissedVisits
export const useCalculatedMissedVisits = (pregnancyId: string, aogWks?: number, aogDays?: number) => {
	return useQuery({
		queryKey: ["calculatedMissedVisits", pregnancyId, aogWks, aogDays],
		queryFn: () => getCalculatedMissedVisits(pregnancyId, aogWks, aogDays),
		enabled: !!pregnancyId,
		staleTime: 30 * 1,
		retry: 2,
		refetchOnWindowFocus: false
	})
}

// for getLatestPatientPostpartumRecord
export const useLatestPatientPostpartumRecord = (patientId: string) => {
	return useQuery({
		queryKey: ['latestPostpartumRecord', patientId],
		queryFn: () => getLatestPatientPostpartumRecord(patientId),
		enabled: !!patientId && patientId !== "undefined" && patientId !== "null",
		staleTime: 30 * 1,
		retry: 2,
	})
}

// for getIllnessList
export const useIllnessList = () => {
	return useQuery({
		queryKey: ["illnessList"],
		queryFn: getIllnessList,
		enabled: true,
		staleTime: 30 * 1,
		retry: 2,
		refetchInterval: 2000,
	})
}

// for getPatientPostpartumCompleteRecord
export const usePatientPostpartumCompleteRecord = (pprId: string) => {
	return useQuery({
		queryKey: ['postpartumRecordComplete', pprId],
		queryFn: () => getPatientPostpartumCompleteRecord(pprId),
		enabled: !!pprId && pprId !== "undefined" && pprId !== "null",
		staleTime: 30 * 1,
		retry: 2,
		refetchInterval: 2000,
	})
}

// for getPatientPostpartumAllRecords
export const usePatientPostpartumAllRecords = (pregnancyId: string) => {
	return useQuery({
		queryKey: ['postpartumAllRecords', pregnancyId],
		queryFn: () => getPatientPostpartumAllRecords(pregnancyId),
		enabled: !!pregnancyId && pregnancyId !== "undefined" && pregnancyId !== "null",
		staleTime: 30 * 1,
		retry: 2,
		refetchInterval: 2000,
	})
}