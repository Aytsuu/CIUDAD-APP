import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { ProjectProposalInput, SupportDocInput } from "../projprop-types";
import { postProjectProposal, addSupportDocuments } from "../api/postreq";

export const useAddProjectProposal = (isUpdate: boolean = false) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (proposalData: ProjectProposalInput) =>
      postProjectProposal(proposalData),
    onSuccess: (_data) => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      toast.success(
        `Project proposal ${isUpdate ? "updated" : "added"} successfully`,
        {
          icon: (
            <CircleCheck size={24} className="fill-green-500 stroke-white" />
          ),
          duration: 2000,
        }
      );
      navigate(`/gad-project-proposal`);
    },
    onError: (error: any) => {
      toast.error(`Failed to ${isUpdate ? "update" : "add"} project proposal`, {
        description: error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : error.message,
        duration: 5000,
      });
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
    },
    onError: (error: any) => {
      toast.error("Failed to add support document", {
        description: error.response?.data
          ? JSON.stringify(error.response.data, null, 2)
          : error.message,
        duration: 5000,
      });
    },
  });
};
