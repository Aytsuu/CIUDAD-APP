import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putProjectProposal} from "../api/projpropputreq";

export const useUpdateProjectProposal = (_usePut: boolean = false) => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putProjectProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      toast.success("Project proposal updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      toast.error("Failed to update project proposal", {
        description: error.response?.data ? JSON.stringify(error.response.data, null, 2) : error.message,
        duration: 5000,
      });
    },
  });
};