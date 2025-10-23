import { useQuery } from "@tanstack/react-query";
import {
  getArchivedComplaints,
  getComplaints,
} from "../restful-api/complaint-api";
import api from "@/api/api";

export const useGetComplaint = () => {
  return useQuery({
    queryKey: ["complaints"],
    queryFn: () => getComplaints(),
    select: (response) => response.data,
  });
};

export const useGetComplaintById = (comp_id: string) =>
  useQuery({
    queryKey: ["complaint", comp_id],
    queryFn: async () => {
      try {
        const res = await api.post("complaint/view/", { comp_id });
        console.log(res.data)
        return res.data;
      } catch (error) {
        throw error;
      }
    },
    enabled: !!comp_id,
  });

export const useGetArchivedComplaints = () =>
  useQuery({
    queryKey: ["archivedComplaints"],
    queryFn: () => getArchivedComplaints().then((res) => res.data),
    staleTime: 60_000,
  });

export const useSearchAccused = (query: string) => {
  return useQuery({
    queryKey: ["search-accused", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await api.get(
        `/complaint/accused/search/?q=${encodeURIComponent(query)}`
      );
      return response.data;
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });
};

export const useSearchComplainants = (query: string) => {
  return useQuery({
    queryKey: ["search-complainants", query],
    queryFn: async () => {
      if (!query.trim()) {
        return [];
      }

      try {
        const response = await api.get(
          `/complaint/complainant/search/?q=${encodeURIComponent(query)}`
        );
        console.log("Search response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
    enabled: query.trim().length >= 2,
    staleTime: 30000,
  });
};

export const useAllResidents = () => {
  return useQuery({
    queryKey: ["all-residents"],
    queryFn: async () => {
      try {
        const response = await api.get(`/complaint/residentLists/`);
        console.log("All residents response:", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching all residents:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
