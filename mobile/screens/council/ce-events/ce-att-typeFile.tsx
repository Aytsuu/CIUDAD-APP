import { UpdateEventFormSchema } from "@/form-schema/council-event-schema";
import z from "zod";

export type FormattedCouncilEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  day: string;
  rawDate: Date;
  place: string;
  description: string;
  is_archive: boolean;
  ce_id: number;
  ce_date: string;
  ce_time: string;
};

export type Staff = {
  staff_id: string;
  full_name: string;
  position_title: string;
};

export interface AttendanceRecords {
  ceId: number;
  attMettingTitle: string;
  attMeetingDate: string;
  attMeetingDescription: string;
  isArchived: boolean;
  sheets: any[];
}

export interface UploadFile {
  name: string;
  type: string;
  file: string;
  path: string;
}

export type UpdateEventFormValues = z.infer<typeof UpdateEventFormSchema>;
export type EventFormValues = UpdateEventFormValues;
export type EventCategory = "meeting" | "activity" | undefined;

export type CouncilEvent = {
  ce_id: number;
  ce_title: string;
  ce_place: string;
  ce_date: string;
  ce_time: string;
  ce_description: string;
  ce_rows?: number;
  ce_is_archive: boolean;
  staff_id: string | null;
};

export type CouncilEventInput = {
  ce_title: string;
  ce_place: string;
  ce_date: string | null;
  ce_time: string;
  ce_description: string;
  ce_rows?: number; 
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
  file_id?: number | null;
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

export interface EditEventFormProps {
  initialValues: {
    ce_id: number;
    ce_title: string;
    ce_date: string;
    ce_time: string;
    ce_place: string;
    ce_description: string;
    ce_rows?: number;
    ce_is_archive?: boolean;
    staff_id?: string | null;
    attendees?: { name: string; designation: string; present_or_absent?: string }[];
  };
  onClose: () => void;
}

export interface AttendeesProps {
  isEditMode: boolean;
  onEditToggle: (value: boolean) => void;
  onSave: () => void;
  ceId: number;
}

export interface AttendanceSheetViewProps {
  selectedAttendees?: { name: string; designation: string }[];
  numberOfRows?: number; 
  activity?: string;
  date?: string;
  time?: string;
  place?: string;
  ce_id?: number | null;
  description?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClose?: () => void;
  onConfirm?: () => void;
}

export interface SchedEventFormProps {
  onSuccess?: () => void;
}