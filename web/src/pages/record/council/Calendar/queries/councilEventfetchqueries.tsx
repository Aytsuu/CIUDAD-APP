import { useQuery } from "@tanstack/react-query";
import { getCouncilEvents, getAttendees, getAttendanceSheets, getStaffList } from "../api/councilEventgetreq";
import { CouncilEvent, Attendee, AttendanceSheet, Staff } from "../councilEventTypes";

export const useGetCouncilEvents = () => {
  return useQuery<CouncilEvent[], Error>({
    queryKey: ["councilEvents"],
    queryFn: () => getCouncilEvents().catch((error) => {
      throw error;
    }),
    staleTime: 1000 * 60 * 5, 
  });
};

  export const useGetAttendees = (ceId?: number) => {
    return useQuery<Attendee[], Error>({
      queryKey: ["attendees", ceId],
      queryFn: () => {
        if (!ceId) throw new Error("ceId is required to fetch attendees");
        return getAttendees(ceId).then((data) => data.filter((a) => a.ce_id === ceId));
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

export const useGetStaffList = () =>
  useQuery<Staff[], Error>({
    queryKey: ["staffList"],
    queryFn: getStaffList,
  });