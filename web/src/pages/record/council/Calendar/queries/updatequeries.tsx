import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putCouncilEvent, putAttendee, putAttendanceSheet } from "../api/putreq";
import { CouncilEvent, CouncilEventInput, Attendee, AttendeeInput, AttendanceSheet, AttendanceSheetInput } from "./fetchqueries";

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
      toast.success("Council event updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update council event", {
        description: error.message,
        duration: 2000
      });
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

export const useUpdateAttendee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ atn_id, attendeeInfo }: { atn_id: number; attendeeInfo: Partial<AttendeeInput> }) => 
      putAttendee(atn_id, attendeeInfo),
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(["attendees"], (old: Attendee[] = []) => 
        old.map(attendee => 
          attendee.atn_id === variables.atn_id ? { ...attendee, ...updatedData } : attendee
        )
      );
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      toast.success("Attendee updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update attendee", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['attendees'] });
      const previousAttendees = queryClient.getQueryData(['attendees']);
      queryClient.setQueryData(['attendees'], (old: Attendee[] = []) => 
        old.map(attendee => 
          attendee.atn_id === variables.atn_id ? { ...attendee, ...variables.attendeeInfo } : attendee
        )
      );
      return { previousAttendees };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
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
      toast.success("Attendance sheet updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to update attendance sheet", {
        description: error.message,
        duration: 2000
      });
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