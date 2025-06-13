import { useQuery } from "@tanstack/react-query";
import { getCouncilEvents, getAttendees, getAttendanceSheets, getStaffList } from "../api/getreq";

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
  atn_id: number;
  atn_name: string;
  atn_designation: string;
  atn_present_or_absent?: string;
  ce_id: number;
  staff_id: string | null;
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
  file_id: number | null;
  staff_id: string | null;
  file_url: string | null;
  att_is_archive: boolean;
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

export const useGetCouncilEvents = () => {
  return useQuery<CouncilEvent[], Error>({
    queryKey: ["councilEvents"],
    queryFn: () => getCouncilEvents().catch((error) => {
      console.error("Error fetching council events:", error);
      throw error;
    }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// export const useGetAttendees = () => {
//   return useQuery<Attendee[], Error>({
//     queryKey: ["attendees"],
//     queryFn: () => getAttendees().catch((error) => {
//       console.error("Error fetching attendees:", error);
//       throw error;
//     }),
//     staleTime: 1000 * 60 * 5, // 5 minutes
//   });
// };

  export const useGetAttendees = (ceId?: number) => {
    return useQuery<Attendee[], Error>({
      queryKey: ["attendees", ceId], // Cache per ceId
      queryFn: () => {
        if (!ceId) throw new Error("ceId is required to fetch attendees");
        return getAttendees(ceId).then((data) => data.filter((a) => a.ce_id === ceId));
      },
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!ceId, // Only fetch if ceId is defined
    });
  };

export const useGetAttendanceSheets = (isArchived?: boolean) => {
  return useQuery<AttendanceSheet[], Error>({
    queryKey: ["attendanceSheets", isArchived],
    queryFn: () => getAttendanceSheets(isArchived),
    staleTime: 1000 * 60 * 5,
  });
};

export const useGetStaffList = () =>
  useQuery<Staff[], Error>({
    queryKey: ["staffList"],
    queryFn: getStaffList,
  });
