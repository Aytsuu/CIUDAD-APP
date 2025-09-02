import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { delCouncilEvent, restoreCouncilEvent, delAttendee, delAttendanceSheet, restoreAttendanceSheet } from "../api/delreq";
import { CouncilEvent, Attendee, AttendanceSheet } from "../ce-att-types";

export const useDeleteCouncilEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ce_id, permanent = false }: { ce_id: number; permanent?: boolean }) => 
      delCouncilEvent(ce_id, permanent),
    onSuccess: (_data, variables) => {
      const { ce_id, permanent } = variables;
      if (permanent) {
        // Permanent delete
        queryClient.setQueryData(["councilEvents"], (old: CouncilEvent[] = []) => 
          old.filter(event => event.ce_id !== ce_id)
        );
        toast.success("Council event permanently deleted successfully", {
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 2000
        });
      } else {
        // Soft delete (archive)
        queryClient.setQueryData(["councilEvents"], (old: CouncilEvent[] = []) => 
          old.map(event => 
            event.ce_id === ce_id ? { ...event, ce_is_archive: true } : event
          )
        );
        toast.success("Council event archived successfully", {
          icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
          duration: 2000
        });
      }
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete council event", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (variables) => {
      const { ce_id, permanent = false } = variables;
      await queryClient.cancelQueries({ queryKey: ['councilEvents'] });
      const previousEvents = queryClient.getQueryData(['councilEvents']);
      if (permanent) {
        queryClient.setQueryData(['councilEvents'], (old: CouncilEvent[] = []) => 
          old.filter(event => event.ce_id !== ce_id)
        );
      } else {
        queryClient.setQueryData(['councilEvents'], (old: CouncilEvent[] = []) => 
          old.map(event => 
            event.ce_id === ce_id ? { ...event, ce_is_archive: true } : event
          )
        );
      }
      return { previousEvents };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['councilEvents'] });
    }
  });
};

export const useRestoreCouncilEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (ce_id: number) => restoreCouncilEvent(ce_id),
    onSuccess: (_, ce_id) => {
      queryClient.setQueryData(["councilEvents"], (old: CouncilEvent[] = []) => 
        old.map(event => 
          event.ce_id === ce_id ? { ...event, ce_is_archive: false } : event
        )
      );
      queryClient.invalidateQueries({ queryKey: ["councilEvents"] });
      toast.success("Council event restored successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to restore council event", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (ce_id) => {
      await queryClient.cancelQueries({ queryKey: ['councilEvents'] });
      const previousEvents = queryClient.getQueryData(['councilEvents']);
      queryClient.setQueryData(['councilEvents'], (old: CouncilEvent[] = []) => 
        old.map(event => 
          event.ce_id === ce_id ? { ...event, ce_is_archive: false } : event
        )
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

export const useArchiveAttendanceSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (att_id: number) => delAttendanceSheet(att_id, false),
    onSuccess: (_, att_id) => {
      queryClient.setQueryData(["attendanceSheets"], (old: AttendanceSheet[] = []) => 
        old.map(sheet => 
          sheet.att_id === att_id ? { ...sheet, att_is_archive: true } : sheet
        )
      );
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success("Attendance sheet archived successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to archive attendance sheet", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (att_id) => {
      await queryClient.cancelQueries({ queryKey: ['attendanceSheets'] });
      const previousSheets = queryClient.getQueryData(['attendanceSheets']);
      queryClient.setQueryData(['attendanceSheets'], (old: AttendanceSheet[] = []) => 
        old.map(sheet => 
          sheet.att_id === att_id ? { ...sheet, att_is_archive: true } : sheet
        )
      );
      return { previousSheets };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceSheets'] });
    }
  });
};

export const useDeleteAttendanceSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (att_id: number) => delAttendanceSheet(att_id, true),
    onSuccess: (_, att_id) => {
      queryClient.setQueryData(["attendanceSheets"], (old: AttendanceSheet[] = []) => 
        old.filter(sheet => sheet.att_id !== att_id)
      );
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success("Attendance sheet permanently deleted successfully", {
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

export const useRestoreAttendanceSheet = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (att_id: number) => restoreAttendanceSheet(att_id),
    onSuccess: (_, att_id) => {
      queryClient.setQueryData(["attendanceSheets"], (old: AttendanceSheet[] = []) => 
        old.map(sheet => 
          sheet.att_id === att_id ? { ...sheet, att_is_archive: false } : sheet
        )
      );
      queryClient.invalidateQueries({ queryKey: ["attendanceSheets"] });
      toast.success("Attendance sheet restored successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to restore attendance sheet", {
        description: error.message,
        duration: 2000
      });
    },
    onMutate: async (att_id) => {
      await queryClient.cancelQueries({ queryKey: ['attendanceSheets'] });
      const previousSheets = queryClient.getQueryData(['attendanceSheets']);
      queryClient.setQueryData(['attendanceSheets'], (old: AttendanceSheet[] = []) => 
        old.map(sheet => 
          sheet.att_id === att_id ? { ...sheet, att_is_archive: false } : sheet
        )
      );
      return { previousSheets };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceSheets'] });
    }
  });
};