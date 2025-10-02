import { useQuery } from "@tanstack/react-query";
import {getpendingAppointments} from "../restful-api/get";


export const usePendingAppointments = (page: number = 1, pageSize: number = 10, search: string = "", dateFilter: string = "all") => {
  return useQuery<any>({
    queryKey: ["pendingmedicalapp", page, pageSize, search, dateFilter],
    queryFn: () => getpendingAppointments(page, pageSize, search, dateFilter)
  });
};