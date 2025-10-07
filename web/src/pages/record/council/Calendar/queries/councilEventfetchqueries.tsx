import { useQuery } from "@tanstack/react-query";
import { getCouncilEvents, getAttendanceSheets, getCouncilEventYears } from "../api/councilEventgetreq";
import { CouncilEvent, AttendanceSheet } from "../councilEventTypes";

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

// Get available years
export const useGetCouncilEventYears = () => {
  return useQuery<number[], Error>({
    queryKey: ["councilEventYears"],
    queryFn: getCouncilEventYears,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
};

  // export const useGetAttendees = (ceId?: number) => {
  //   return useQuery<Attendee[], Error>({
  //     queryKey: ["attendees", ceId],
  //     queryFn: () => {
  //       if (!ceId) throw new Error("ceId is required to fetch attendees");
  //       return getAttendees(ceId).then((data) => data.filter((a) => a.ce_id === ceId));
  //     },
  //     staleTime: 1000 * 60 * 5,
  //     enabled: !!ceId, 
  //   });
  // };

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