import { useQuery } from "@tanstack/react-query";
import { getPatients, getMaternalRecords } from "../restful-api/maternalGetAPI";

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
export const useMaternalRecords = () => {
	return useQuery({
		queryKey: ["maternalRecords"],
		queryFn: getMaternalRecords,
		staleTime: 20 * 1000,
		retry: 2,
	});
}

