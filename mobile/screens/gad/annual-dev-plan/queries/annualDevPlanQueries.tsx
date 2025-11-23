import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getAnnualDevPlanById, 
  getAnnualDevPlansByYear, 
  getArchivedAnnualDevPlans, 
  archiveAnnualDevPlans, 
  restoreAnnualDevPlans 
} from "../restful-api/annualDevPlanGetAPI";
import { createAnnualDevPlan } from "../restful-api/annualDevPlanPostAPI";
import { updateAnnualDevPlan } from "../restful-api/annualDevPlanPutAPI";
import { deleteAnnualDevPlans } from "../restful-api/annualDevPlanDeleteAPI";
import { useToastContext } from "@/components/ui/toast";
import { api } from "@/api/api";

// Archive queries
export const useGetArchivedAnnualDevPlans = (page?: number, pageSize?: number, search?: string, ordering?: string) => {
  return useQuery({
    queryKey: ["archivedAnnualDevPlans", page, pageSize, search, ordering],
    queryFn: async () => {
      return await getArchivedAnnualDevPlans(search, page, pageSize, ordering);
    },
  });
};

export const useArchiveAnnualDevPlans = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (devIds: number[]) => {
      return await archiveAnnualDevPlans(devIds);
    },
    onSuccess: () => {
      // Invalidate and refetch queries to update the data
      queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
      queryClient.invalidateQueries({ queryKey: ["archivedAnnualDevPlans"] });
      toast.success("Development plans archived successfully");
    },
    onError: (error: any) => {
      console.error("Error archiving development plans:", error);
      toast.error("Failed to archive development plans");
    },
  });
};

export const useRestoreAnnualDevPlans = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (devIds: number[]) => {
      return await restoreAnnualDevPlans(devIds);
    },
    onSuccess: () => {
      // Invalidate and refetch queries to update the data
      queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
      queryClient.invalidateQueries({ queryKey: ["archivedAnnualDevPlans"] });
      toast.success("Development plans restored successfully");
    },
    onError: (error: any) => {
      console.error("Error restoring development plans:", error);
      toast.error("Failed to restore development plans");
    },
  });
};

export const useGetAnnualDevPlanById = (devId?: string | number) => {
  return useQuery({
    queryKey: ["annualDevPlan", devId],
    queryFn: async () => {
      if (!devId) throw new Error("No development plan ID provided");
      return await getAnnualDevPlanById(devId);
    },
    enabled: Boolean(devId),
  });
};

export const useGetAnnualDevPlansByYear = (year: string | number) => {
  return useQuery({
    queryKey: ["annualDevPlansByYear", year],
    queryFn: async () => {
      return await getAnnualDevPlansByYear(year);
    },
    enabled: Boolean(year),
  });
};

export const useCreateAnnualDevPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: createAnnualDevPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
      queryClient.invalidateQueries({ queryKey: ["annualDevPlansByYear"] });
      toast.success("Development plan created successfully");
    },
    onError: (error: any) => {
      console.error("Error creating development plan:", error);
      toast.error("Failed to create development plan");
    },
  });
};

export const useUpdateAnnualDevPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: updateAnnualDevPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
      queryClient.invalidateQueries({ queryKey: ["annualDevPlansByYear"] });
      toast.success("Development plan updated successfully");
    },
    onError: (error: any) => {
      console.error("Error updating development plan:", error);
      toast.error("Failed to update development plan");
    },
  });
};

export const useDeleteAnnualDevPlans = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async (devIds: number[]) => {
      return await deleteAnnualDevPlans(devIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["annualDevPlans"] });
      queryClient.invalidateQueries({ queryKey: ["archivedAnnualDevPlans"] });
      toast.success("Development plans deleted successfully");
    },
    onError: (error: any) => {
      console.error("Error deleting development plans:", error);
      toast.error("Failed to delete development plans");
    },
  });
};

// Fetch approved project proposals for status determination
export const useGetApprovedProposals = () => {
  return useQuery({
    queryKey: ['approvedProposalsFull'],
    queryFn: async () => {
      try {
        const res = await api.get('council/approved-proposals/');
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Error fetching proposals:', err);
        return [];
      }
    },
    staleTime: 1000 * 60 * 30,
  });
};

