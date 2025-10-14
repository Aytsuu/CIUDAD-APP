import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { useNavigate } from "react-router";
import { ProjectProposalInput, SupportDocInput } from "../projprop-types";
import { postProjectProposal, addSupportDocuments } from "../api/projproppostreq";

export const useAddProjectProposal = (isUpdate: boolean = false) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (proposalData: ProjectProposalInput) =>
      postProjectProposal(proposalData),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      queryClient.invalidateQueries({ queryKey: ["projectProposalGrandTotal"] });
      showSuccessToast(
        `Project proposal ${isUpdate ? "updated" : "added"} successfully`
      );
      navigate(`/gad-project-proposal`);
    },
    onError: (_error: any) => {
      showErrorToast(`Failed to ${isUpdate ? "update" : "add"} project proposal`);
    },
  });
};

export const useAddSupportDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileData: SupportDocInput) => addSupportDocuments(fileData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["projectProposals", variables.gpr_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["supportDocs", variables.gpr_id],
      });
      queryClient.invalidateQueries({ queryKey: ["projectProposalGrandTotal"] });
    },
    onError: (_error: any) => {
      showErrorToast("Failed to add support document");
    },
  });
};