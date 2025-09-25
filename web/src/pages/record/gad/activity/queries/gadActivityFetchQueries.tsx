import { useQuery } from "@tanstack/react-query";
import { 
  getGADActivityData, 
  getFilteredAnnualDevPlans, 
  getCalendarEventsData,
  getWasteEventsData,
  getCouncilEventsData,
  getHotspotData,
  getWasteCollectionData,
  getProjectProposalsData
} from "../restful-api/gadActivityGetAPI.tsx";

// Get all GAD activity data
export const useGetGADActivityData = () => {
  return useQuery({
    queryKey: ['gadActivityData'],
    queryFn: getGADActivityData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get filtered annual development plans with project proposals
export const useGetFilteredAnnualDevPlans = (year: number) => {
  return useQuery({
    queryKey: ['filteredAnnualDevPlans', year],
    queryFn: () => getFilteredAnnualDevPlans(year),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get calendar events data
export const useGetCalendarEventsData = () => {
  return useQuery({
    queryKey: ['calendarEventsData'],
    queryFn: getCalendarEventsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get waste events data
export const useGetWasteEventsData = () => {
  return useQuery({
    queryKey: ['wasteEventsData'],
    queryFn: getWasteEventsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get council events data
export const useGetCouncilEventsData = () => {
  return useQuery({
    queryKey: ['councilEventsData'],
    queryFn: getCouncilEventsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get hotspot data
export const useGetHotspotData = () => {
  return useQuery({
    queryKey: ['hotspotData'],
    queryFn: getHotspotData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get waste collection data
export const useGetWasteCollectionData = () => {
  return useQuery({
    queryKey: ['wasteCollectionData'],
    queryFn: getWasteCollectionData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get project proposals data
export const useGetProjectProposalsData = () => {
  return useQuery({
    queryKey: ['projectProposalsData'],
    queryFn: getProjectProposalsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
