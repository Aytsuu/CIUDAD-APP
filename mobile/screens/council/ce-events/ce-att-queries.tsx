import { useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  postCouncilEvent,
  addAttendanceSheets,
  delCouncilEvent,
  delAttendanceSheet,
  restoreAttendanceSheet,
  putAttendanceSheet,
  putCouncilEvent,
  getAttendanceSheets,
  getCouncilEvents,
  restoreCouncilEvent,
  getCouncilEventYears
} from "./ce-att-requests";
import { useToastContext } from "@/components/ui/toast";
import { CouncilEventInput,  AttendanceSheetInput, CouncilEvent, AttendanceSheet, UploadFile } from "./ce-att-typeFile";
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

export const useGetCouncilEvents = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  year?: string,
  isArchive?: boolean
) => {
  return useQuery<{ results: CouncilEvent[]; count: number }, Error>({
    queryKey: ["councilEvents", page, pageSize, searchQuery, year, isArchive],
    queryFn: () => getCouncilEvents(page, pageSize, searchQuery, year, isArchive).catch((error) => {
      throw error;
    }),
    staleTime: 1000 * 60 * 5, 
  });
};

export const useGetCouncilEventYears = () => {
  return useQuery<number[], Error>({
    queryKey: ["councilEventYears"],
    queryFn: getCouncilEventYears,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
};


export const useGetAttendanceSheets = (isArchived?: boolean) => {
  return useQuery<AttendanceSheet[], Error>({
    queryKey: ["attendanceSheets", isArchived],
    queryFn: () => getAttendanceSheets(isArchived),
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