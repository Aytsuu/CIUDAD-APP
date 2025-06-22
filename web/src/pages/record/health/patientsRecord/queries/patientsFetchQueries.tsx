import { useQuery } from "@tanstack/react-query";
import { getResident, getPatients, getPatientDetails, getAllFollowUpVisits } from "../restful-api/patientsGetAPI";

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
