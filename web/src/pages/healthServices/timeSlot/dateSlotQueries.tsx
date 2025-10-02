import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dateSlotService } from "./dateSlotService";
import { SlotConfiguration, BookingRequest } from "./types";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";

// Query keys
export const dateSlotKeys = {
  all: ["date-slots"] as const,
  lists: () => [...dateSlotKeys.all, "list"] as const,
  list: (filters: any) => [...dateSlotKeys.lists(), { filters }] as const,
  details: () => [...dateSlotKeys.all, "detail"] as const,
  detail: (id: number) => [...dateSlotKeys.details(), id] as const,
  month: (year: number, month: number) => [...dateSlotKeys.all, "month", year, month] as const,
};

// Queries
export const useDateSlots = () => {
  return useQuery({
    queryKey: dateSlotKeys.lists(),
    queryFn: () => dateSlotService.getDateSlots(),
  });
};

export const useDateSlot = (id: number) => {
  return useQuery({
    queryKey: dateSlotKeys.detail(id),
    queryFn: () => dateSlotService.getDateSlot(id),
    enabled: !!id,
  });
};

export const useMonthData = (year: number, month: number) => {
  return useQuery({
    queryKey: dateSlotKeys.month(year, month),
    queryFn: () => dateSlotService.getMonthData(year, month),
    enabled: !!year && !!month,
  });
};

// Mutations
export const useCreateDateSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dateSlotService.createDateSlot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.lists() });
      showSuccessToast("Date slot created successfully!");
    },
    onError: (error: Error) => {
      console.error("Error creating date slot:", error);
      showErrorToast("Failed to create date slot");
    },
  });
};

export const useUpdateDateSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SlotConfiguration> }) =>
      dateSlotService.updateDateSlot(id, data),
    onSuccess: (data, variables) => {
      // Invalidate specific date slot and lists
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.all });
      showSuccessToast("Date slot updated successfully!");
    },
    onError: (error: Error) => {
      console.error("Error updating date slot:", error);
      showErrorToast("Failed to update date slot");
    },
  });
};

export const useBulkConfigure = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dateSlotService.bulkConfigure,
    onSuccess: () => {
      // Invalidate all date slot queries
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.all });
      showSuccessToast("Dates configured successfully!");
    },
    onError: (error: Error) => {
      console.error("Error bulk configuring dates:", error);
      showErrorToast("Failed to configure dates");
    },
  });
};

export const useBookSlots = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slotId, booking }: { slotId: number; booking: BookingRequest }) =>
      dateSlotService.bookSlots(slotId, booking),
    onSuccess: (data, variables) => {
      // Invalidate the specific slot and month queries
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.detail(variables.slotId) });
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.all });
      showSuccessToast(data.message);
    },
    onError: (error: any) => {
      console.error("Error booking slots:", error);
      const errorMessage = error.response?.data?.error || "Failed to book slots";
      showErrorToast(errorMessage);
    },
  });
};

export const useDeleteDateSlot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dateSlotService.deleteDateSlot,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dateSlotKeys.lists() });
      queryClient.removeQueries({ queryKey: dateSlotKeys.detail(variables) });
      showSuccessToast("Date slot deleted successfully!");
    },
    onError: (error: Error) => {
      console.error("Error deleting date slot:", error);
      showErrorToast("Failed to delete date slot");
    },
  });
};