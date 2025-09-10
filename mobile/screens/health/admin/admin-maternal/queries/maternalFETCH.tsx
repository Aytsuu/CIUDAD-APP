import { useQuery } from "@tanstack/react-query";
import { getMaternalRecords, getActivePregnanciesCount } from "../restful-api/maternalGET";


export const useMaternalRecords = () => {
	return useQuery({
		queryKey: ["maternalRecords"],
		queryFn: getMaternalRecords,
		staleTime: 20 * 1000,
		retry: 2,
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