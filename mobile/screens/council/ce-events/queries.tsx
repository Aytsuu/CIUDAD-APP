"use client";

import { useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  postCouncilEvent,
  postAttendee,
  postAttendanceSheet,
  delCouncilEvent,
  delAttendee,
  delAttendanceSheet,
  restoreAttendanceSheet,
  putAttendanceSheet,
  putAttendee,
  putCouncilEvent,
  updateAttendees,
  getAttendanceSheets,
  getAttendees,
  getCouncilEvents,
  getStaffList,
  restoreCouncilEvent
} from "./requests";
import { useToastContext } from "@/components/ui/toast";

export type CouncilEvent = {
  ce_id: number;
  ce_title: string;
  ce_place: string;
  ce_date: string;
  ce_time: string;
  ce_type: string;
  ce_description: string;
  ce_is_archive: boolean;
  staff_id: string | null;
};

export type CouncilEventInput = {
  ce_title: string;
  ce_place: string;
  ce_date: string;
  ce_time: string;
  ce_type: string;
  ce_description: string;
  ce_is_archive?: boolean;
  staff_id?: string | null;
};

export type Attendance = {
  ceId: number;
  att_id?: number;
  attMettingTitle: string;
  attMeetingDate: string;
  attMeetingDescription: string;
  attAreaOfFocus?: string[];
  isArchived?: boolean;
};

export type Attendee = {
  atn_id?: number;
  atn_name: string;
  atn_designation: string;
  atn_present_or_absent?: string;
  ce_id: number;
  ce_title: string;
  staff_id?: string | null;
};

export type AttendeeInput = {
  atn_name: string;
  atn_designation: string;
  atn_present_or_absent: string;
  ce_id: number;
  staff_id?: string | null;
};

export type AttendanceSheet = {
  att_id: number;
  ce_id: number;
  att_file_name: string;
  att_file_path: string;
  att_file_url: string;
  att_file_type: string;
  att_is_archive: boolean;
  staff_id: string | null;
};

export type AttendanceSheetInput = {
  ce_id: number;
  att_file_name: string;
  att_file_path: string;
  att_file_url: string;
  att_file_type: string;
  staff_id?: string | null;
};

export type AttendanceRecord = {
  ceId: number;
  attMettingTitle: string;
  attMeetingDate: string;
  attMeetingDescription: string;
  attAreaOfFocus?: string[];
  isArchived: boolean;
  sheets: AttendanceSheet[];
};

export type Staff = {
  staff_id: string;
  full_name: string;
  position_title: string;
};

export const useAddCouncilEvent = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (eventData: CouncilEventInput) => postCouncilEvent(eventData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      toast.success('Council event added successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add council event');
    },
  });
};

export const useAddAttendee = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (attendeeData: AttendeeInput) => postAttendee(attendeeData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attendees", data.ce_id] });
      toast.success('Attendee added successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add attendee');
    },
  });
};

export const useAddAttendanceSheet = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (attendanceData: AttendanceSheetInput) => 
       postAttendanceSheet({
        ce_id: attendanceData.ce_id,
        att_file_name: attendanceData.att_file_name,
        att_file_path: attendanceData.att_file_path,
        att_file_url: attendanceData.att_file_url,
        att_file_type: attendanceData.att_file_type,
        staff_id: attendanceData.staff_id
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success('Attendance sheet added successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add attendance sheet');
    },
  });
};

export const useDeleteCouncilEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: ({ ce_id, permanent = false }: { ce_id: number; permanent?: boolean }) => 
      delCouncilEvent(ce_id, permanent),
    onSuccess: (data, variables) => {
      const { ce_id, permanent } = variables;
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      toast.success(
        permanent 
          ? 'Council event permanently deleted successfully' 
          : 'Council event archived successfully'
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete council event');
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["councilEvents"] });
      const previousEvents = queryClient.getQueryData(["councilEvents"]);
      
      queryClient.setQueryData(["councilEvents"], (old: CouncilEvent[] = []) =>
        variables.permanent
          ? old.filter((event) => event.ce_id !== variables.ce_id)
          : old.map((event) =>
              event.ce_id === variables.ce_id ? { ...event, ce_is_archive: true } : event
            )
      );
      return { previousEvents };
    },
  });
};

export const useRestoreCouncilEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (ce_id: number) => restoreCouncilEvent(ce_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      toast.success('Council event restored successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore council event');
    },
    onMutate: async (ce_id) => {
      await queryClient.cancelQueries({ queryKey: ["councilEvents"] });
      const previousEvents = queryClient.getQueryData(["councilEvents"]);
      
      queryClient.setQueryData(["councilEvents"], (old: CouncilEvent[] = []) =>
        old.map((event) =>
          event.ce_id === ce_id ? { ...event, ce_is_archive: false } : event
        )
      );
      return { previousEvents };
    },
  });
};

export const useDeleteAttendee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (atn_id: number) => delAttendee(atn_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
      toast.success('Attendee deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attendee');
    },
  });
};

export const useArchiveAttendanceSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (att_id: number) => delAttendanceSheet(att_id, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success('Attendance sheet archived successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to archive attendance sheet');
    },
  });
};

export const useDeleteAttendanceSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (att_id: number) => delAttendanceSheet(att_id, true),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success('Attendance sheet permanently deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete attendance sheet');
    },
  });
};

export const useRestoreAttendanceSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (att_id: number) => restoreAttendanceSheet(att_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success('Attendance sheet restored successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to restore attendance sheet');
    },
  });
};

export const useGetCouncilEvents = (isArchived?: boolean) => {
  return useQuery<CouncilEvent[], Error>({
    queryKey: ["councilEvents", isArchived],
    queryFn: () => getCouncilEvents(isArchived),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAttendees = (ceId?: number) => {
  return useQuery<Attendee[], Error>({
    queryKey: ["attendees", ceId],
    queryFn: async () => {
      if (!ceId) throw new Error("ceId is required to fetch attendees");
      const attendees = await getAttendees(ceId);
      
      // Add debug logging
      console.log(`Fetched attendees for ceId ${ceId}:`, attendees);
      
      return attendees;
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!ceId,
  });
};

export const useGetAttendanceSheets = (isArchived?: boolean) => {
  return useQuery<AttendanceSheet[], Error>({
    queryKey: ["attendanceSheets", isArchived],
    queryFn: () => getAttendanceSheets(isArchived),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetStaffList = () => {
  return useQuery<Staff[], Error>({
    queryKey: ["staffList"],
    queryFn: getStaffList,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateCouncilEvent = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: ({ ce_id, eventInfo }: { ce_id: number; eventInfo: Partial<CouncilEventInput> }) =>
      putCouncilEvent(ce_id, eventInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      toast.success('Council event updated successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update council event');
    },
  });
};

export const useUpdateAttendanceSheet = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: ({ att_id, attendanceInfo }: { att_id: number; attendanceInfo: Partial<AttendanceSheetInput> }) =>
      putAttendanceSheet(att_id, attendanceInfo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success('Attendance sheet updated successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update attendance sheet');
    },
  });
};

export const useUpdateAttendees = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: ({ ce_id, attendees }: { ce_id: number; attendees: AttendeeInput[] }) =>
      updateAttendees(ce_id, attendees),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees", ce_id] });
      // toast.success('Attendees updated successfully');
      onSuccess?.();
    },
    onError: (error: Error) => {
      // toast.error(error.message || 'Failed to update attendees');
    },
  });
};

export const useUpdateAttendee = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  const pendingUpdates = useRef(0);

  return useMutation({
    mutationFn: ({ atn_id, attendeeInfo }: { atn_id: number; attendeeInfo: { atn_present_or_absent: string } }) => {
      pendingUpdates.current += 1;
      return putAttendee(atn_id, attendeeInfo);
    },
    onSuccess: () => {
      if (pendingUpdates.current > 0) {
        toast.success(`${pendingUpdates.current} attendees updated successfully`);
        pendingUpdates.current = 0;
      }
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update attendee');
    },
  });
};