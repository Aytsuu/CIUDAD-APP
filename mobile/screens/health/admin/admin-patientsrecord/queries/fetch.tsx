import { getPatients } from "../restful-api/get";
import { useQuery } from "@tanstack/react-query";

import { PatientFilters } from "../restful-api/get";

// patient query keys
export const patientQueryKey = {
	allPatients: ["patients"],
	lists: () => [...patientQueryKey.allPatients, "list"],
	list: (filters: any) => [...patientQueryKey.lists(), { filters }],
	details: () => [...patientQueryKey.allPatients, "detail"],
	detail: (id:any) => [patientQueryKey.details(), id],
	search: (params:any) => [...patientQueryKey.allPatients, "search", params]  
}

export const usePatients = (filters: PatientFilters, options = {}) => {
	return useQuery({
		queryKey: patientQueryKey.lists(),
		queryFn: () => getPatients(filters),
		staleTime: 30 * 1,
		retry: 3,
		refetchInterval: 3000,
		...options
	})
}