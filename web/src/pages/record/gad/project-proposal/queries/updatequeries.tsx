import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putProjectProposal, patchProjectProposalStatus } from "../api/putreq";
import { ProjectProposal,  ProposalStatus } from "../projprop-types";

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

export const useUpdateProjectProposalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gprId,
      status,
      reason,
    }: {
      gprId: number;
      status: ProposalStatus;
      reason: string | null;
    }) => patchProjectProposalStatus(gprId, status, reason),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] });
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"]);

      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.map((proposal) =>
          proposal.gprId === variables.gprId
            ? { ...proposal, status: variables.status }
            : proposal
        )
      );

      return { previousProposals };
    },
    onError: (error: Error, _variables, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      toast.error("Failed to update project proposal status", {
        description: error.message,
        duration: 2000,
      });
    },
    onSuccess: (_data, variables) => {
      toast.success("Data updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      // Invalidate and refetch to ensure logs are updated
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      queryClient.invalidateQueries({ queryKey: ["projectProposal", variables.gprId] });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
    },
  });
};