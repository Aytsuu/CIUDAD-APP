import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { delCouncilEvent, delAttendee, delAttendanceSheet } from "../api/delreq";
import { CouncilEvent, Attendee, AttendanceSheet } from "./fetchqueries";

export const useDeleteCouncilEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ce_id: number) => delCouncilEvent(ce_id),
    onSuccess: (_, ce_id) => {
      queryClient.setQueryData(["councilEvents"], (old: CouncilEvent[] = []) => 
        old.filter(event => event.ce_id !== ce_id)
      );
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      toast.success("Council event deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete council event", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (ce_id) => {
      await queryClient.cancelQueries({ queryKey: ['councilEvents'] });
      const previousEvents = queryClient.getQueryData(['councilEvents']);
      queryClient.setQueryData(['councilEvents'], (old: CouncilEvent[] = []) => 
        old.filter(event => event.ce_id !== ce_id)
      );
      return { previousEvents };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['councilEvents'] });
    }
  });
};

export const useDeleteAttendee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (atn_id: number) => delAttendee(atn_id),
    onSuccess: (_, atn_id) => {
      queryClient.setQueryData(["attendees"], (old: Attendee[] = []) => 
        old.filter(attendee => attendee.atn_id !== atn_id)
      );
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      toast.success("Attendee deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete attendee", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (atn_id) => {
      await queryClient.cancelQueries({ queryKey: ['attendees'] });
      const previousAttendees = queryClient.getQueryData(['attendees']);
      queryClient.setQueryData(['attendees'], (old: Attendee[] = []) => 
        old.filter(attendee => attendee.atn_id !== atn_id)
      );
      return { previousAttendees };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attendees'] });
    }
  });
};

export const useDeleteAttendanceSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (att_id: number) => delAttendanceSheet(att_id),
    onSuccess: (_, att_id) => {
      queryClient.setQueryData(["attendanceSheets"], (old: AttendanceSheet[] = []) => 
        old.filter(sheet => sheet.att_id !== att_id)
      );
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success("Attendance sheet deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete attendance sheet", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (att_id) => {
      await queryClient.cancelQueries({ queryKey: ['attendanceSheets'] });
      const previousSheets = queryClient.getQueryData(['attendanceSheets']);
      queryClient.setQueryData(['attendanceSheets'], (old: AttendanceSheet[] = []) => 
        old.filter(sheet => sheet.att_id !== att_id)
      );
      return { previousSheets };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceSheets'] });
    }
  });
};