import { useMutation,useQueryClient } from '@tanstack/react-query';
import { archiveInventory } from './ArchivePutAPI';

export const useArchiveInventory = () => {
    const queryClient = useQueryClient();
    return useMutation({
    mutationFn: (inv_id: number) => archiveInventory(inv_id),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] }); // Update with your query key
      },
      onError: (error: Error) => {
        console.error("Error adding medicine inventory:", error.message);
      }
  });
};