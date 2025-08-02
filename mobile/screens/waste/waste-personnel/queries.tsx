import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchTrucks,
  fetchPersonnel,
  addTruck,
  updateTruck,
  deleteTruck,
  restoreTruck,
  TruckData,
  PersonnelItem,
  TruckFormValues,
  getTruckById,
  Truck
} from './requests';
import { useToastContext } from '@/components/ui/toast';

export const useGetTruckById = (truck_id: number, options = {}) => {
  return useQuery<Truck, Error>({
    queryKey: ["trucks", truck_id],
    queryFn: () => getTruckById(truck_id),
    enabled: !!truck_id,
    ...options
  });
};

export const useTrucks = () => {
  return useQuery<TruckData[]>({
    queryKey: ['trucks'],
    queryFn: fetchTrucks,
  });
};

export const usePersonnel = () => {
  return useQuery<PersonnelItem[]>({
    queryKey: ['personnel'],
    queryFn: fetchPersonnel,
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