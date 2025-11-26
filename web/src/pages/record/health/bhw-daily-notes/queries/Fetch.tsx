import { api2 } from "@/api/api";
import { useQuery } from "@tanstack/react-query";
import { checkAttendanceSummaryExists } from "../restful-api/GET";

export const useBHWStaffWithNotes = (page: number, pageSize: number, search: string, staffId?: string) => {
   return useQuery({
      queryKey: ['bhwStaffWithNotes', page, pageSize, search, staffId],
      queryFn: async () => {
         try {
            const params: any = {
               page: page,
               page_size: pageSize,
               search: search,
            };
            
            // Only add staff_id filter if provided (for BHW role)
            if (staffId) {
               params.staff_id = staffId;
            }
            
            const res = await api2.get('/reports/bhw/with-notes/', { params })
            return res.data;
         } catch (error) {
            throw error;
         }
      },
      staleTime: 5000,
		retry: 1,
		refetchInterval: 2000,
   })
}

export const useCheckAttendanceSummary = (staffId: string, month: string) => {
   return useQuery({
      queryKey: ['attendanceSummaryCheck', staffId, month],
      queryFn: () => checkAttendanceSummaryExists(staffId, month),
      enabled: !!staffId && !!month,
      staleTime: 5000,
      retry: 1,
   })
}

export const useBHWDailyNoteDetail = (bhwdnId: number | null) => {
   return useQuery({
      queryKey: ['bhwDailyNoteDetail', bhwdnId],
      queryFn: async () => {
         if (!bhwdnId) throw new Error('Invalid note ID');
         try {
            const res = await api2.get(`/reports/bhw/daily-notes/${bhwdnId}/`);
            return res.data;
         } catch (error) {
            throw error;
         }
      },
      enabled: !!bhwdnId,
      staleTime: 5000,
      retry: 1,
   })
}