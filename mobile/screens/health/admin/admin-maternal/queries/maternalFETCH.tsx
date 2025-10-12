import { useQuery } from "@tanstack/react-query";
import { api2 } from "@/api/api";
import { getMaternalCount, getPatientPostpartumAllRecords,
	getPatientPostpartumCompleteRecord,
	getPrenatalRecordComplete
 } from "../restful-api/maternalGET";


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

// for getMaternalCount
export const useMaternalCount = () => {
	return useQuery({
		queryKey: ["activePregnanciesCount"],
		queryFn: getMaternalCount,
		staleTime: 60 * 1, 
		retry: 2,
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

