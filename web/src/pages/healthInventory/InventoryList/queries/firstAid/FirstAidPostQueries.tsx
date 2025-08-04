import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addFirstAid } from "../../restful-api/firstAid/FirstAidPostAPI";
import { FirstAidType } from "@/form-schema/inventory/lists/inventoryListSchema";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {CircleCheck,CircleX} from "lucide-react";
// export const useAddFirstAid = () => {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ data, staff_id }: { data: FirstAidType; staff_id: string }) => addFirstAid(data, staff_id),
//     onSuccess: () => {
//       navigate(-1);
//       toast.success("Added successfully", {
//         icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//         duration: 2000,
//       });
//       queryClient.invalidateQueries({ queryKey: ["firstAid"] });
//     },
//   });
// };

export const useAddFirstAid = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, staff_id }: { data: FirstAidType; staff_id: string }) => 
      addFirstAid(data, staff_id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["firstAid"] });
      toast.success("Added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error adding first aid:", error);
      toast.error("Failed to add first aid", {
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
      });
    }
  });
};