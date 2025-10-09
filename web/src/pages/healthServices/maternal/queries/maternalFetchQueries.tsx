"use client"

import { useQuery } from "@tanstack/react-query";
import { getPatients, 
			getMaternalCounts,
			getPatientPostpartumCount,
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
			getLatestPatientPostpartumRecord,
			getIllnessList,
			getPatientPostpartumCompleteRecord,
			getPatientPostpartumAllRecords,
			getPostpartumAssessements,
			getPrenatalAppointmentRequests,
			getPrenatalRecordComparison,
} from "../restful-api/maternalGetAPI";

import { api2 } from "@/api/api";


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
export const useMaternalRecords = (page: number, pageSize: number, searchcQuery: string, status: string) => {
	const normalizedStatus = typeof status === 'string' ? status.toLowerCase() : '';
	const shouldSendStatus = normalizedStatus && normalizedStatus !== 'all';

	return useQuery({
		queryKey: ["maternalRecords", page, pageSize, searchcQuery, status],
		queryFn: async () => {
			try {
				const res = await api2.get('/maternal/maternal-patients/', {
					params: {
						page,
						page_size: pageSize,
						search: searchcQuery,
						status: shouldSendStatus ? status : undefined
					}
				});
				return res.data
			} catch (error) {
				throw error;
			}
		},
		staleTime: 5000,
		retry: 1,
		refetchInterval: 5000,
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
export const usePregnancyDetails = (patientId: string, page: number, pageSize: number, status: string, search: string) => {
	return useQuery({
		queryKey: ["pregnancyDetails", { patientId, page, pageSize, status, search }],
		queryFn: async () => {
			try {
				const res = await api2.get(`maternal/pregnancy/${patientId}/details/`, {
					params: {
						page,
						pageSize,
						status,
						search,
					}
				})
				return res.data
			} catch (error) {
				throw error;
			}
		},
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
export const usePrenatalPatientMedHistory = (patientId: string, search?: string) => {
	return useQuery({
		queryKey: ["prenatalPatientMedHistory", patientId, search],
		queryFn: () => getPrenatalPatientMedHistory(patientId,search),
		enabled: !!patientId,
		staleTime: 30 * 1000, // Fixed: 30 seconds (was 30 * 1 = 30ms)
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
		retry: 1,
		refetchInterval: 2000,
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

// for getPostpartumAssessements
export const usePostpartumAssessements = (patientId: string) => {
	return useQuery({
		queryKey: ['postpartumAssessements', patientId],
		queryFn: () => getPostpartumAssessements(patientId),
		enabled: !!patientId && patientId !== "undefined" && patientId !== "null",
		staleTime: 30 * 1,
		retry: 2,
		refetchInterval: 2000,
	})
}

// for getPrenatalAppointmentRequests
export const usePrenatalAppointmentRequest = () => {
	return useQuery({
		queryKey: ['prenatalAppointmentRequests'],
		queryFn: () => getPrenatalAppointmentRequests(),
		staleTime: 5000,
		retry: 1,
		refetchInterval: 2000,
	})
}

// for getPrenatalRecordComparison
export const usePrenatalRecordComparison = (pregnancyId: string) => {
	return useQuery({
		queryKey: ['prenatalRecordComparison', pregnancyId],
		queryFn: () => getPrenatalRecordComparison(pregnancyId),
		enabled: !!pregnancyId && pregnancyId !== "undefined" && pregnancyId !== "null",
		staleTime: 30 * 1000,
		retry: 2,
	})
}

