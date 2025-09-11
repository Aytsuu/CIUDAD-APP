import { useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  postCouncilEvent,
  postAttendee,
  addAttendanceSheets,
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
} from "./ce-att-requests";
import { useToastContext } from "@/components/ui/toast";
import { CouncilEventInput, AttendeeInput, AttendanceSheetInput, CouncilEvent, AttendanceSheet, Attendee, Staff, UploadFile } from "./ce-att-typeFile";
import { MediaItem} from "@/components/ui/media-picker";


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

export const useAddAttendanceSheet = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({
      ceId,
      files,
    }: {
      ceId: number;
      files: MediaItem[];
    }) => {
      // Filter out files without base64 data and validate types
      const validFiles = files
        .filter(file => file.file !== undefined && typeof file.file === 'string')
        .map(file => file as MediaItem & { file: string });

      if (validFiles.length === 0) {
        throw new Error("No valid files to upload (missing file data)");
      }

      // Format files for API - TypeScript now knows file.file exists
      const formattedFiles: UploadFile[] = validFiles.map(file => ({
        name: file.name || `attendance_${Date.now()}.jpg`,
        type: file.type || 'image/jpeg',
        file: file.file.startsWith('data:') 
          ? file.file 
          : `data:${file.type || 'image/jpeg'};base64,${file.file}`,
        path: `uploads/attendance/${file.name || `file_${Date.now()}`}`
      }));

      return addAttendanceSheets(ceId, formattedFiles);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["attendees", data.ce_id] });
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets", variables.ceId] });
      toast.success(`Attendance sheet(s) uploaded successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload attendance sheets");
    },
  });
};

export const useDeleteCouncilEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: ({ ce_id, permanent = false }: { ce_id: number; permanent?: boolean }) => 
      delCouncilEvent(ce_id, permanent),
    onSuccess: (_data, variables) => {
      const { permanent } = variables;
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
    // queryFn: () => getCouncilEvents(isArchived),
    queryFn: () => getCouncilEvents(),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetAttendees = (ceId?: number) => {
  return useQuery<Attendee[], Error>({
    queryKey: ["attendees", ceId],
    queryFn: async () => {
      if (!ceId) throw new Error("ceId is required to fetch attendees");
      const attendees = await getAttendees(ceId);  
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
    mutationFn: ({ ce_id, attendees }: { ce_id: number; attendees: { atn_name: string; atn_designation: string; atn_present_or_absent: string }[] }) => {
      return updateAttendees(ce_id, attendees);
    },
    onSuccess: (updatedData, variables) => {
      queryClient.setQueryData(["attendees", variables.ce_id], (old: Attendee[] = []) =>
        variables.attendees.map((a, index) => ({ atn_id: old[index]?.atn_id || index + 1, ...a, ce_id: variables.ce_id, staff_id: null }))
      );
      queryClient.invalidateQueries({ queryKey: ["attendees", variables.ce_id] });
      toast.success('Attendees updated successfully');
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update attendees');
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["attendees", variables.ce_id] });
      const previousAttendees = queryClient.getQueryData(["attendees", variables.ce_id]);
      queryClient.setQueryData(["attendees", variables.ce_id], (old: Attendee[] = []) =>
        variables.attendees.map((a, index) => ({ atn_id: old[index]?.atn_id || index + 1, ...a, ce_id: variables.ce_id, staff_id: null }))
      );
      return { previousAttendees };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attendees"] });
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