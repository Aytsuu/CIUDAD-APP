import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import { api } from "@/api/api";
import { updateWasteColData } from "../request/waste-col-put-request";
import { addAssCollector } from "../request/waste-col-post-request";


// Update the mutation hooks
export const useUpdateWasteSchedule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();  
  
  return useMutation({
    mutationFn: ({ wc_num, values }: { wc_num: number, values: any }) =>
      updateWasteColData(wc_num, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      toast.success("Schedule updated successfully");
    },
    onError: (err) => {
      console.error("Error updating schedule:", err);
      toast.error("Failed to update schedule.");
    }
  });
};



export const useUpdateCollectors = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();  

  return useMutation({
    mutationFn: async ({ 
      wc_num, 
      newCollectorIds,
      existingCollectorIds 
    }: { 
      wc_num: number, 
      newCollectorIds: string[],
      existingCollectorIds: string[] 
    }) => {
      // Determine collectors to add and remove
      const collectorsToAdd = newCollectorIds.filter(id => !existingCollectorIds.includes(id));
      const collectorsToRemove = existingCollectorIds.filter(id => !newCollectorIds.includes(id));

      // Add new collectors
      await Promise.all(
        collectorsToAdd.map(collectorId => 
          addAssCollector(wc_num, collectorId)
        )
      );

      // Remove unselected collectors
      await Promise.all(
        collectorsToRemove.map(async (collectorId) => {
          // First find the wasc_id for this collector
            const response = await api.get(`waste/waste-ass-collectors/list/?wc_num=${wc_num}&wstp=${collectorId}`);
        //   const response = await api.get(`waste/waste-ass-collectors/?wc_num=${wc_num}&wstp=${collectorId}`);
            console.log("KUHA WASC_ID: ", response)
            if (response.data.length > 0) {
                await api.delete(`waste/waste-ass-collectors/${response.data[0].wasc_id}/`);
            }
        })
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      toast.success("Schedule updated successfully");
    },
    onError: (err) => {
      console.error("Error updating collectors:", err);
      toast.error("Failed to update collectors.");
    }
  });
};