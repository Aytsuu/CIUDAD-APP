import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { putProjectProposal, patchProjectProposalStatus } from "../api/putreq";
import { ProjectProposal, ProjectProposalInput } from "./fetchqueries";

type ProposalStatus = "Pending" | "Approved" | "Rejected" | "Viewed";

export const useUpdateProjectProposal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gprId, proposalData, proposalF }: { 
      gprId: number; 
      proposalData: ProjectProposalInput; 
      proposalF: ProjectProposal 
    }) => putProjectProposal(gprId, proposalData, proposalF),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] });
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"]);

      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.map((proposal) =>
          proposal.gprId === variables.gprId
            ? {
                ...proposal,
                ...variables.proposalF,
                gprId: variables.gprId,
                projectTitle: variables.proposalData.projectTitle,
                background: variables.proposalData.background,
                objectives: variables.proposalData.objectives,
                participants: variables.proposalData.participants.map(p => ({
                  category: p.category,
                  count: typeof p.count === 'string' ? parseInt(p.count) || 0 : p.count,
                })),
                date: variables.proposalData.date,
                venue: variables.proposalData.venue,
                budgetItems: variables.proposalData.budgetItems.map(item => ({
                  name: item.name,
                  pax: item.pax,
                  amount: typeof item.amount === 'string' ? parseFloat(item.amount) || 0 : item.amount,
                })),
                monitoringEvaluation: variables.proposalData.monitoringEvaluation,
                signatories: variables.proposalData.signatories || [],
                headerImage: variables.proposalData.gpr_header_img,
                staffId: variables.proposalData.staffId || null,
                gprIsArchive: variables.proposalData.gprIsArchive || false,
                paperSize: variables.proposalF.paperSize,
                supportDocs: variables.proposalF.supportDocs,
              }
            : proposal
        )
      );

      return { previousProposals };
    },
    onError: (error: Error, variables, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      toast.error("Failed to update project proposal", {
        description: error.message,
        duration: 2000,
      });
    },
    onSuccess: (data, variables) => {
      toast.success("Project proposal updated successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.map(proposal => 
          proposal.gprId === variables.gprId ? { ...proposal, ...data } : proposal
        )
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
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
    onError: (error: Error, variables, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      toast.error("Failed to update project proposal status", {
        description: error.message,
        duration: 2000,
      });
    },
    onSuccess: (data, variables) => {
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