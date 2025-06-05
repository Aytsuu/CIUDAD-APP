import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { postCouncilEvent, postAttendee, postAttendanceSheet } from "../api/postreq";
import { CouncilEventInput, AttendeeInput, AttendanceSheetInput } from "./fetchqueries";

export const useAddCouncilEvent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  return useMutation({
    mutationFn: (eventData: CouncilEventInput) => postCouncilEvent(eventData),
    onSuccess: (ce_id) => {
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      toast.success("Council event added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
      navigate("/event-meeting");
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
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      toast.success("Attendee added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to add attendee", {
        description: error.message,
      });
    },
  });
};

export const useAddAttendanceSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (attendanceData: AttendanceSheetInput) => postAttendanceSheet(attendanceData),
    onSuccess: (att_id) => {
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success("Attendance sheet added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to add attendance sheet", {
        description: error.message,
      });
    },
  });
};