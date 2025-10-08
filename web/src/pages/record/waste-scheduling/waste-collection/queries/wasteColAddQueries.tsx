import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { wasteColData } from "../request/wasteColPostRequest";
import WasteColSchedSchema from "@/form-schema/waste-col-form-schema";
import { addAssCollector } from "../request/wasteColPostRequest";
import { createCollectionReminders } from "../request/wasteColPostRequest";
import { showErrorToast } from "@/components/ui/toast";
import { showSuccessToast } from "@/components/ui/toast";


type ExtendedWasteColSchema = z.infer<typeof WasteColSchedSchema> & {
  staff: string;
};


export const useCreateWasteSchedule = (onSuccess?: (wc_num: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ExtendedWasteColSchema) =>
      wasteColData(values),
    onSuccess: (wc_num) => {
      queryClient.invalidateQueries({ queryKey: ['wasteCollectionSchedFull'] });

      showSuccessToast("Waste collection scheduled successfully");

      if (onSuccess) onSuccess(wc_num);
    },
    onError: (err) => {
      console.error("Error creating schedule:", err);
      showErrorToast("Failed to create schedule.");
    }
  });
};


export const useAssignCollectors = () => {
  const queryClient = useQueryClient();

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

      showSuccessToast("Collectors assigned successfully");

    },
    onError: (err) => {
      console.error("Error assigning collectors:", err);
      showErrorToast("Failed to assign collectors.");
    }
  });
};



// WASTE COLLECTION ANNOUNCEMENT
export const useCreateCollectionReminders = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      return await createCollectionReminders();
    },
    onSuccess: () => {
      // toast.loading("Creating collection announcement...", { id: "createReminders" });
      
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      
      // toast.success("Created announcement successfully", {
      //   id: "createReminders",
      //   icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      //   duration: 3000
      // });

      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error creating collection reminders:", err);
      toast.error(
        "Failed to create collection reminders. Please try again.",
        { 
          id: "createReminders",
          duration: 2000 
        }
      );
    }
  });
};