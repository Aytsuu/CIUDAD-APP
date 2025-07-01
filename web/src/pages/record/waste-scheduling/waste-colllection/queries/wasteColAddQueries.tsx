import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { wasteColData } from "../request/wasteColPostRequest";
import { wasteAssData } from "../request/wasteColPostRequest";
import WasteColSchedSchema from "@/form-schema/waste-col-form-schema";
import { addAssCollector } from "../request/wasteColPostRequest";



export const useCreateWasteSchedule = (onSuccess?: (wc_num: number) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: z.infer<typeof WasteColSchedSchema>) =>
      wasteColData(values),
    onSuccess: (wc_num) => {
      queryClient.invalidateQueries({ queryKey: ['wasteColData'] });

      toast.success("Waste collection scheduled successfully", {
        id: "createSchedule",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000
      });

      if (onSuccess) onSuccess(wc_num);
    },
    onError: (err) => {
      console.error("Error creating schedule:", err);
      toast.error("Failed to create schedule. Please try again.");
    }
  });
};



// export const useCreateWasteAssignment = () => {
//   return useMutation({
//     mutationFn: (data: any) => wasteAssData(data),
//     onSuccess: () => {
//       toast.success("Waste collection assigned successfully", {
//         icon: "✅",
//         duration: 6000
//       });
//     },
//     onError: (err) => {
//       console.error("Error creating assignment:", err);
//       toast.error("Failed to create assignment.");
//     }
//   });
// };



export const useCreateWasteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      // Step 1: Create waste assignment
      const was_id = await wasteAssData({
        wc_num: data.wc_num,
        sitio_id: data.sitio_id,
        wstp_id: data.wstp_id, // driver value here!
        truck_id: data.truck_id,
        staff_id: data.staff_id
      });

      // Step 2: Assign collectors
      const selectedCollectors = data.selectedCollectors || [];

      await Promise.all(
        selectedCollectors.map(async (collectorId: number | string) => {
          await addAssCollector({
            was_id: was_id,
            wstp_id: collectorId
          });
        })
      );

      return was_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wasteColData'] });
      toast.success("Waste collection assigned successfully", {
        id: "createAssignCol",
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 6000
      });
    },
    onError: (err) => {
      console.error("Error creating assignment:", err);
      toast.error("Failed to create assignment.");
    }
  });
};
