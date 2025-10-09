import { useQuery } from "@tanstack/react-query";
import { getPrenatalAppointmentRequests } from "../restful-api/get";

export const usePrenatalAppointmentRequests = (rp_id: string) => {
   return useQuery({
      queryKey: ['prenatal-appointment-requests', rp_id],
      queryFn: () => getPrenatalAppointmentRequests(rp_id),
      enabled: !!rp_id,
      staleTime: 2 * 1000,
      refetchInterval: 5 * 1000,
   })
}