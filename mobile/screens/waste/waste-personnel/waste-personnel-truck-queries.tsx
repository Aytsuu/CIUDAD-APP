import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTrucks,
  getAllPersonnel,
  addTruck,
  updateTruck,
  deleteTruck,
  restoreTruck,
  getTruckById,
} from './waste-personnel-truck-requests';
import { useToastContext } from '@/components/ui/toast';
import { Trucks, TruckData, WastePersonnel, TruckFormValues } from "./waste-personnel-types";

export const useGetTruckById = (truck_id: any, options = {}) => {
  return useQuery<Trucks, Error>({
    queryKey: ["trucks", truck_id],
    queryFn: () => getTruckById(truck_id),
    enabled: !!truck_id,
    ...options
  });
};

export const useGetTrucks = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  isArchive?: boolean,
  options = {}
) => {
  return useQuery<{ results: Trucks[]; count: number }, Error>({
    queryKey: ["trucks", page, pageSize, searchQuery, isArchive],
    queryFn: () => getAllTrucks(page, pageSize, searchQuery, isArchive),
    staleTime: 1000 * 60 * 5,
    ...options
  });
};

export const useGetAllPersonnel = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  position?: string,
  options = {}
) => {
  return useQuery<{ results: WastePersonnel[]; count: number }, Error>({
    queryKey: ["wastePersonnel", page, pageSize, searchQuery, position],
    queryFn: () => getAllPersonnel(page, pageSize, searchQuery, position),
    staleTime: 1000 * 60 * 5,
    ...options
  });
};
export const useAddTruck = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation<TruckData, Error, TruckFormValues>({
    mutationFn: addTruck,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
      toast.success('Truck added successfully');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add truck');
    },
  });
};

export const useUpdateTruck = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation<TruckData, Error, { id: string; data: TruckFormValues }>({
    mutationFn: ({ id, data }) => updateTruck(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
      toast.success('Truck updated successfully');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update truck');
    },
  });
};

export const useDeleteTruck = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation<void, Error, { id: string; permanent?: boolean }>({
    mutationFn: ({ id, permanent }) => deleteTruck(id, permanent),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
      toast.success(
        variables.permanent 
          ? 'Truck permanently deleted successfully' 
          : 'Truck archived successfully'
      );
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete truck');
    },
  });
};

export const useRestoreTruck = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation<void, Error, string>({
    mutationFn: (id) => restoreTruck(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trucks'] });
      toast.success('Truck restored successfully');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to restore truck');
    },
  });
};