import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { deleteTemplateRec } from "../request/template-DeleteRequest";


// interface deleteTemplateData {
//   temp_is_archive: boolean;
// }


// export const useDeleteTemplate = (temp_id: number, onSuccess?: () => void) => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (data: deleteTemplateData) => {
//         return deleteTemplateRec(temp_id, data)
//     },
//    onSuccess: () => {
//       toast.loading("Updating template...", { id: "deleteTemplate" });

//       toast.success('Template deleted', {
//         id: 'deleteTemplate',
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 5000
//       });
      
//       // Invalidate any related queries if needed
//       queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      
//       if (onSuccess) onSuccess();
//     },
//     onError: (err) => {
//       console.error("Error deleting template:", err);
//       toast.error("Failed to deleting template");
//     }

//   });
// };



interface deleteTemplateData {
  temp_id: number;
  temp_is_archive: boolean;
}

export const useDeleteTemplate = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: deleteTemplateData) => {
      return deleteTemplateRec(data.temp_id, data)
    },
    onSuccess: () => {
      toast.loading("Updating template...", { id: "deleteTemplate" });
      toast.success('Template deleted', {
        id: 'deleteTemplate',
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 5000
      });
      
      queryClient.invalidateQueries({ queryKey: ['templateRec'] });
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      console.error("Error deleting template:", err);
      toast.error("Failed to deleting template");
    }
  });
};