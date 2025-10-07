import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { putProjectProposal} from "../api/projpropputreq";

export const useUpdateProjectProposal = (_usePut: boolean = false) => {
const queryClient = useQueryClient();

  return useMutation({
    mutationFn: putProjectProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      showSuccessToast("Project proposal updated successfully");
    },
    onError: (_error: any) => {
      showErrorToast("Failed to update project proposal");
    },
  });
};