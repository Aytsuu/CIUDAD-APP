import { useQuery } from "@tanstack/react-query";
import { getMaternalRecords, getMaternalCount, getPregnancyDetails } from "../restful-api/maternalGET";

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