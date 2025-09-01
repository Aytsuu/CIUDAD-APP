import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { postCouncilEvent, postAttendee, postAttendanceSheet } from "../api/postreq";
import { CouncilEventInput, AttendeeInput, AttendanceSheetInput } from "../ce-att-types";

export const useAddCouncilEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData: CouncilEventInput) => postCouncilEvent(eventData),
    onSuccess: (_ce_id) => {
      toast.success("Council event added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add council event", {
        description: error.message,
      });
    },
  });
};

export const useAddAttendee = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (attendeeData: AttendeeInput) => postAttendee(attendeeData),
    onSuccess: (atn_id) => {
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
    },
  });
};

export const useAddAttendanceSheet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (attendanceData: AttendanceSheetInput) => postAttendanceSheet(attendanceData),
    onSuccess: (_att_id) => {
      toast.success("Attendance sheet added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to add attendance sheet", {
        description: error.message,
      });
    },
  });
};