import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast";
import WasteColSchedSchema from "@/form-schema/waste/waste-collection";
import { wasteColData } from "../request/waste-col-post-request";
import { addAssCollector } from "../request/waste-col-post-request";
import { createCollectionReminders } from "../request/waste-col-post-request";

type ExtendedWasteColSchema = z.infer<typeof WasteColSchedSchema> & {
  staff: string;
};


export const useCreateWasteSchedule = (onSuccess?: (wc_num: number) => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: (values: ExtendedWasteColSchema) =>
      wasteColData(values),
    onSuccess: (wc_num) => {
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      toast.success("Waste collection scheduled successfully");
      if (onSuccess) onSuccess(wc_num);
    },
    onError: (err) => {
      console.error("Error creating schedule:", err);
      toast.error("Failed to create schedule.");
    }
  });
};


export const useAssignCollectors = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();
  
  return useMutation({
    mutationFn: async ({ wc_num, collectorIds }: { wc_num: number, collectorIds: string[] }) => {
      await Promise.all(
        collectorIds.map(collectorId => 
          addAssCollector(wc_num, collectorId)
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });
      toast.success("Collectors assigned successfully");
    },
    onError: (err) => {
      console.error("Error assigning collectors:", err);
      toast.error("Failed to assign collectors.");
    }
  });
};





// WASTE COLLECTION ANNOUNCEMENT
export const useCreateCollectionReminders = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async () => {
      return await createCollectionReminders();
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      
      // toast.success("Created announcement successfully");

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error creating collection reminders:", err);
      toast.error("Failed to create collection reminders. Please try again.");
    }
  });
};