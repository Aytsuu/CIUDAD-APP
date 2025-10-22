import {  useQuery } from "@tanstack/react-query";
import { getArchivedComplaints, getComplaintById, getComplaints } from "../restful-api/complaint-api";

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
