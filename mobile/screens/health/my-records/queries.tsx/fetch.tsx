import { useQuery } from "@tanstack/react-query";
import { getChildren } from "../restful-api/get";

export const useGetChildren = (patientId: string) => {
	return useQuery({
		queryKey: ['getchildren', patientId],
		queryFn: () => getChildren(patientId),
		staleTime: 300000, // 5 minutes
		enabled: !!patientId,
	})
}
