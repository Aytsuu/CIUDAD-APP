import { UpdateEventFormSchema } from "@/form-schema/council-event-schema";
import z from "zod";

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

export type FormattedCouncilEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  day: string;
  rawDate: Date;
  place: string;
  description: string;
  type: string;
  is_archive: boolean;
  ce_id: number;
  ce_date: string;
  ce_time: string;
};

export type CouncilEventInput = {
  ce_title: string;
  ce_place: string;
  ce_date: string | null;
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

export interface AttendanceSheetInput {
  ce_id: number;
  att_file_name: string;
  att_file_path: string;
  att_file_url: string;
  att_file_type: string;
  staff_id?: number | null;
  att_id?: number; 
  file?: string;  
}

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
  file: string; // Required for upload
  path: string;
}

export type UpdateEventFormValues = z.infer<typeof UpdateEventFormSchema>;
export type EventFormValues = UpdateEventFormValues;
export type EventCategory = "meeting" | "activity" | undefined;

