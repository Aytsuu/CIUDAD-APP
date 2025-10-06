import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { 
	getResident, 
	getPatients, 
	getPatientDetails, 
	getAllFollowUpVisits, 
	getAllTransientAddresses,
	getchilddata,
 } from "../restful-api/get";
import { AppointmentFilters } from "../restful-api/get";



 export const useChildHealthRecords = (patientId: string | undefined) => {
	return useQuery({
	  queryKey: ["childHealthRecords", patientId],
	  queryFn: () => getchilddata(patientId ?? ""),
	  refetchOnMount: false,
	  staleTime: 300000, // 5 minutes
	  gcTime: 600000, // 10 minutes
	});
  };
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
		  staleTime: 60 * 3,
		  retry: 3,
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
		staleTime: 30 * 1,
		retry: 3,
		...options
	})
}

// patient details query
export const usePatientDetails = (patientId: string, options = {}) => {
	return useQuery({
		queryKey: patientQueryKey.detail(patientId),
		queryFn: () => getPatientDetails(patientId),
		staleTime: 30 * 1,
		retry: 3,
		enabled: !!patientId,
		...options,
	})
}


// follow-up visit query keys
export const followUpVisitQueryKey = {
  allFollowUpVisits: ["followUpVisits"],
  lists: () => [...followUpVisitQueryKey.allFollowUpVisits, "list"],
}

export const useAllFollowUpVisits = (filters: AppointmentFilters, options = {}) => {
  return useQuery({
    queryKey: ['followUpVisits', filters],
    queryFn: () => getAllFollowUpVisits(filters),
    staleTime: 60 * 2,
    retry: 3,
	placeholderData: keepPreviousData,
    ...options,
  })
}


// transient address query keys
export const transientAddressQueryKey = {
	allTransientAddresses: ["transientAddresses"],
	lists: () => [...transientAddressQueryKey.allTransientAddresses, "list"],
}

export const useAllTransientAddresses = (options = []) => {
	return useQuery({
		queryKey: transientAddressQueryKey.lists(),
		queryFn: getAllTransientAddresses,
		staleTime: 60 * 3,
		retry: 3,
		... options,
	})
}
