import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { putCouncilEvent, putAttendanceSheet } from "../api/councilEventputreq";
import { CouncilEvent, CouncilEventInput, AttendanceSheet, AttendanceSheetInput } from "../councilEventTypes";

export const useUpdateCouncilEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ce_id, eventInfo }: { ce_id: number; eventInfo: Partial<CouncilEventInput> }) => 
      putCouncilEvent(ce_id, eventInfo),
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(["councilEvents"], (old: CouncilEvent[] = []) => 
        old.map(event => 
          event.ce_id === variables.ce_id ? { ...event, ...updatedData } : event
        )
      );
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      showSuccessToast("Council event updated successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to update council event");
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['councilEvents'] });
      const previousEvents = queryClient.getQueryData(['councilEvents']);
      queryClient.setQueryData(['councilEvents'], (old: CouncilEvent[] = []) => 
        old.map(event => 
          event.ce_id === variables.ce_id ? { ...event, ...variables.eventInfo } : event
        )
      );
      return { previousEvents };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['councilEvents'] });
    }
  });
};

export const useUpdateAttendanceSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ att_id, attendanceInfo }: { att_id: number; attendanceInfo: Partial<AttendanceSheetInput> }) => 
      putAttendanceSheet(att_id, attendanceInfo),
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(["attendanceSheets"], (old: AttendanceSheet[] = []) => 
        old.map(sheet => 
          sheet.att_id === variables.att_id ? { ...sheet, ...updatedData } : sheet
        )
      );
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      showSuccessToast("Attendance sheet updated successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to update attendance sheet");
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['attendanceSheets'] });
      const previousSheets = queryClient.getQueryData(['attendanceSheets']);
      queryClient.setQueryData(['attendanceSheets'], (old: AttendanceSheet[] = []) => 
        old.map(sheet => 
          sheet.att_id === variables.att_id ? { ...sheet, ...variables.attendanceInfo } : sheet
        )
      );
      return { previousSheets };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceSheets'] });
    }
  });
};

// export const useUpdateAttendees = () => { // New mutation
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ ce_id, attendees }: { ce_id: number; attendees: { atn_name: string; atn_designation: string; atn_present_or_absent: string }[] }) =>
//       updateAttendees(ce_id, attendees),
//     onSuccess: (_updatedData, variables) => {
//       queryClient.setQueryData(["attendees", variables.ce_id], (old: Attendee[] = []) => 
//         variables.attendees.map((a, index) => ({ atn_id: old[index]?.atn_id || index + 1, ...a, ce_id: variables.ce_id, staff_id: null }))
//       );
//       queryClient.invalidateQueries({ queryKey: ["attendees", variables.ce_id] });
//     },
//     onError: (_error: any) => {
//       // const errorMessage = error.response?.data?.detail || error.message || "Unknown error";

//     },
//     onMutate: async (variables) => {
//       await queryClient.cancelQueries({ queryKey: ["attendees", variables.ce_id] });
//       const previousAttendees = queryClient.getQueryData(["attendees", variables.ce_id]);
//       queryClient.setQueryData(["attendees", variables.ce_id], (old: Attendee[] = []) => 
//         variables.attendees.map((a, index) => ({ atn_id: old[index]?.atn_id || index + 1, ...a, ce_id: variables.ce_id, staff_id: null }))
//       );
//       return { previousAttendees };
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["attendees"] });
//     },
//   });
// };


// const useToastManager = () => {
//   const toastShownRef = useRef(false);
//   const pendingUpdatesRef = useRef(0);

//   const showSuccessToast = useCallback((count: number) => {
//     if (!toastShownRef.current) {
//       toastShownRef.current = true;
//       toast.success(`${count} attendees updated successfully`, {
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 2000,
//       });

//       // Reset after toast disappears
//       setTimeout(() => {
//         toastShownRef.current = false;
//         pendingUpdatesRef.current = 0;
//       }, 2000);
//     }
//   }, []);

//   return {
//     incrementPending: () => {
//       pendingUpdatesRef.current += 1;
//     },
//     showSuccess: () => {
//       showSuccessToast(pendingUpdatesRef.current);
//     },
//     showError: (error: any) => {
//       const errorMessage = error.response?.data?.detail || error.message || "Unknown error";
//       toast.error("Failed to update attendee", {
//         description: errorMessage,
//         duration: 2000,
//       });
//     }
//   };
// };

// export const useUpdateAttendee = () => {
//   const queryClient = useQueryClient();
//   const toastManager = useToastManager();

//   return useMutation({
//     mutationFn: ({ atn_id, attendeeInfo }: { 
//       atn_id: number; 
//       attendeeInfo: { atn_present_or_absent: string } 
//     }) => {
//       toastManager.incrementPending();
//       return putAttendee(atn_id, attendeeInfo);
//     },
//     onSuccess: (updatedData, variables) => {
//       queryClient.setQueryData(["attendees"], (old: Attendee[] = []) =>
//         old.map((attendee) =>
//           attendee.atn_id === variables.atn_id ? { ...attendee, ...updatedData } : attendee
//         )
//       );
//       toastManager.showSuccess();
//     },
//     onError: toastManager.showError,
//     onMutate: async (variables) => {
//       await queryClient.cancelQueries({ queryKey: ["attendees"] });
//       const previousAttendees = queryClient.getQueryData(["attendees"]);
//       queryClient.setQueryData(["attendees"], (old: Attendee[] = []) =>
//         old.map((attendee) =>
//           attendee.atn_id === variables.atn_id
//             ? { ...attendee, atn_present_or_absent: variables.attendeeInfo.atn_present_or_absent }
//             : attendee
//         )
//       );
//       return { previousAttendees };
//     },
//     onSettled: () => {
//       queryClient.invalidateQueries({ queryKey: ["attendees"] });
//     },
//   });
// };