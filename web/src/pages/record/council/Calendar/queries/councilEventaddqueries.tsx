import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { postCouncilEvent, postAttendanceSheet } from "../api/councilEventpostreq";
import { CouncilEventInput, AttendanceSheetInput } from "../councilEventTypes";

export const useAddCouncilEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: CouncilEventInput) => postCouncilEvent(eventData),
    onSuccess: (_ce_id) => {
      showSuccessToast("Council event added successfully");
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
    },
    onError: (_error: Error) => {
       showErrorToast("Failed to add council event");
    },
  });
};

// export const useAddAttendee = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (attendeeData: AttendeeInput) => postAttendee(attendeeData),
//     onSuccess: (_atn_id) => {
//       queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
//     },
//   });
// };

export const useAddAttendanceSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceData: AttendanceSheetInput) => postAttendanceSheet(attendanceData),
    onSuccess: (_att_id) => {
      showSuccessToast("Attendance sheet added successfully");
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to add attendance sheet");
    },
  });
};