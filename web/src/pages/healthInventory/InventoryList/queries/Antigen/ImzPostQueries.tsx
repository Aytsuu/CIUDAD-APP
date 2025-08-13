import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addImzSupplies } from "../../restful-api/Antigen/ImzPostAPI";
import {toast} from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";

export const useAddImzSupplies = () => {
  const queryClient = useQueryClient();
  const navigate= useNavigate();
  return useMutation({
    mutationFn: (data: Record<string,any>) => addImzSupplies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizationsupplies"] });
      toast.success("Immunization supply added successfully", {
        icon: (
          <CircleCheck size={18} className="fill-green-500 stroke-white" />
        ),
        duration: 2000,
      });
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Failed to add immunization supply:", error);
      toast.error("Failed to add immunization supply");
    },

  });
};
