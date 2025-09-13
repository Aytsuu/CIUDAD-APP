export type CouncilEvent = {
  ce_id: number;
  ce_title: string;
  ce_place: string;
  ce_date: string;
  ce_time: string;
  ce_description: string;
  ce_is_archive: boolean;
  staff_id: string | null;
};

export type CouncilEventInput = {
  ce_title: string;
  ce_place: string;
  ce_date: string | null;
  ce_time: string;
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
  atn_id: number;
  atn_name: string;
  atn_designation: string;
  atn_present_or_absent?: string;
  ce_id: number;
  staff_id: string | null;
  composite_id: string;
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


export type Staff = {
  staff_id: string;
  full_name: string;
  position_title: string;
};

export interface EditEventFormProps {
  initialValues: {
    ce_id: number;
    ce_title: string;
    ce_date: string;
    ce_time: string;
    ce_place: string;
    ce_description: string;
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