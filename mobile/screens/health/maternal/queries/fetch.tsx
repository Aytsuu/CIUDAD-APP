import { useQuery } from "@tanstack/react-query";
import { getPrenatalAppointmentRequests, getPrenatalAppointmentRequestsByDate } from "../restful-api/get";

export const usePrenatalAppointmentRequests = (rp_id: string) => {
   return useQuery({
      queryKey: ['prenatal-appointment-requests', rp_id],
      queryFn: () => getPrenatalAppointmentRequests(rp_id),
      enabled: !!rp_id,
      staleTime: 2 * 1000,
      refetchInterval: 5 * 1000,
   })
}


export const usePrenatalAppointmentRequestsByDate = (rp_id: string, date: string) => {
   return useQuery({
      queryKey: ['prenatal-appointment-requests-by-date', rp_id, date],
      queryFn: () => getPrenatalAppointmentRequestsByDate(rp_id, date),
      enabled: !!rp_id && !!date,
   })
}


