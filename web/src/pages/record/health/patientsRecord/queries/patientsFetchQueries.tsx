import { useQuery } from "@tanstack/react-query";
import { 
	getResident, 
	getPatients, 
	getPatientDetails, 
	getAllFollowUpVisits,
  	getPatientPostpartumCount, 
	getPatientPostpartumRecords
 } from "../restful-api/patientsGetAPI";

// resident query keys
export const residentQueryKey = {
	allResidents: ["residents"],
	lists: () => [...residentQueryKey.allResidents, "list"],
	list: (filters: any) => [...residentQueryKey.lists(), { filters }],
	details: () => [...residentQueryKey.allResidents, "detail"],
	detail: (id:any) => [residentQueryKey.details(), id],
	search: (params:any) => [...residentQueryKey.allResidents, "search", params]  
}

export const useResidents = (options = {}) => {
	 return useQuery({
		  queryKey: residentQueryKey.lists(),
		  queryFn: getResident,
		  staleTime: 60 * 30,
		  retry: 2,
		  ...options
	 })
}

// patient query keys
export const patientQueryKey = {
	allPatients: ["patients"],
	lists: () => [...patientQueryKey.allPatients, "list"],
	list: (filters: any) => [...patientQueryKey.lists(), { filters }],
	details: () => [...patientQueryKey.allPatients, "detail"],
	detail: (id:any) => [patientQueryKey.details(), id],
	search: (params:any) => [...patientQueryKey.allPatients, "search", params]  
}

export const usePatients = (options = {}) => {
	return useQuery({
		queryKey: patientQueryKey.lists(),
		queryFn: getPatients,
		staleTime: 60 * 30,
		retry: 2,
		...options
	})
}

// patient details query
export const usePatientDetails = (patientId: string, options = {}) => {
	return useQuery({
		queryKey: patientQueryKey.detail(patientId),
		queryFn: () => getPatientDetails(patientId),
		staleTime: 60 * 30,
		retry: 2,
		enabled: !!patientId,
		...options,
	})
}


// follow-up visit query keys
export const followUpVisitQueryKey = {
  allFollowUpVisits: ["followUpVisits"],
  lists: () => [...followUpVisitQueryKey.allFollowUpVisits, "list"],
}

export const useAllFollowUpVisits = (options = {}) => {
  return useQuery({
    queryKey: followUpVisitQueryKey.lists(),
    queryFn: getAllFollowUpVisits,
    staleTime: 60 * 30, // 30 minutes
    retry: 2,
    ...options,
  })
}


export const usePatientPostpartumCount = (patientId: string) => {
  return useQuery({
    queryKey: ["patientPostpartumCount", patientId],
    queryFn: () => getPatientPostpartumCount(patientId),
    enabled: !!patientId && patientId !== "undefined" && patientId !== "null",
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once on failure
  })
}

// Hook to get all postpartum records for a specific patient
export const usePatientPostpartumRecords = (patientId: string) => {
  return useQuery({
    queryKey: ["patientPostpartumRecords", patientId],
    queryFn: () => getPatientPostpartumCount(patientId),
    enabled: !!patientId && patientId !== "undefined" && patientId !== "null",
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Hook to get all postpartum records
// export const useAllPostpartumRecords = () => {
//   return useQuery({
//     queryKey: ["allPostpartumRecords"],
//     queryFn: getAllPostpartumRecords,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   })
// }

// // Hook to get specific postpartum record detail
// export const usePostpartumRecordDetail = (pprId: string) => {
//   return useQuery({
//     queryKey: ["postpartumRecordDetail", pprId],
//     queryFn: () => getPostpartumRecordDetail(pprId),
//     enabled: !!pprId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   })
// }