import { useQuery } from "@tanstack/react-query";
import { getChildren } from "../restful-api/get";

export const useGetChildren = (patientId: string) => {
	return useQuery({
		queryKey: ['getchildren', patientId],
		queryFn: () => getChildren(patientId),
		staleTime: 5000,
		refetchInterval: 5000, 
		refetchIntervalInBackground: true,
		enabled: !!patientId,
	})
}
