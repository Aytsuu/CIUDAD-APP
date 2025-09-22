import { useQuery } from "@tanstack/react-query";
import { getMaternalRecords, getActivePregnanciesCount } from "../restful-api/maternalGET";

import { MaternalPatientFilters } from "../restful-api/maternalGET";

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

export const useActivepregnanciesCount = () => {
	return useQuery({
		queryKey: ["activePregnanciesCount"],
		queryFn: getActivePregnanciesCount,
		staleTime: 60 * 1, 
		retry: 2,
	})
}