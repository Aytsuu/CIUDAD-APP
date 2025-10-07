import {  useQuery } from "@tanstack/react-query";
import { getArchivedComplaints, getComplaintById, getComplaints } from "../restful-api/complaint-api";
import api from "@/api/api";

export const useGetComplaint = () => {
    return useQuery({
        queryKey: ["complaints"],
        queryFn: () => getComplaints(),
        select: (response) => response.data
    })
}

export const useGetComplaintById = (id: string) => 
    useQuery({
        queryKey: ["complaint", id],
        queryFn: () => getComplaintById(id).then(res => res.data),
        enabled: !!id,
    });

export const useGetArchivedComplaints = () =>
    useQuery({
        queryKey: ["archivedComplaints"],
        queryFn: () => getArchivedComplaints().then(res => res.data),
        staleTime: 60_000,
    });


export const useSearchAccused = (query: string) => {
  return useQuery({
    queryKey: ["search-accused", query],
    queryFn: async () => {
      if (!query.trim()) return [];
      const response = await api.get(`/complaint/accused/search/?q=${encodeURIComponent(query)}`);
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
      if (!query.trim()) return [];
      
      const response = await api.get(`/complaint/complainant/search/?q=${encodeURIComponent(query)}`);
      console.log('Response status:', response.status); 
      
      return response.data;
    },
    enabled: query.length >= 2,
    staleTime: 30000,
  });
};