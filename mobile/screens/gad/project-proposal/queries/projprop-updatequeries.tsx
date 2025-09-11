import { useMutation, useQueryClient } from "@tanstack/react-query"
import { patchProjectProposalStatus } from "../api/projprop-putreq"
import type { ProjectProposal, ProposalStatus } from "../projprop-types"
import { useToastContext } from "@/components/ui/toast"

export const useUpdateProjectProposalStatus = () => {
    const queryClient = useQueryClient()
    const { toast } = useToastContext()

    return useMutation({
        mutationFn: async ({
            gprId,
            status,
            reason,
        }: {
            gprId: number
            status: ProposalStatus
            reason: string | null
        }) => patchProjectProposalStatus(gprId, status, reason),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: ["projectProposals"] })
            const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"])

            queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
                old.map((proposal) =>
                    proposal.gprId === variables.gprId ? { ...proposal, status: variables.status } : proposal,
                ),
            )

            return { previousProposals }
        },
        onError: (error: Error, variables, context) => {
            if (context?.previousProposals) {
                queryClient.setQueryData(["projectProposals"], context.previousProposals)
            }
            toast.error("Failed to update project proposal status: " + error.message)
        },
        onSuccess: (data, variables) => {
            toast.success("Status updated successfully")
            // Invalidate and refetch to ensure logs are updated
            queryClient.invalidateQueries({ queryKey: ["projectProposals"] })
            queryClient.invalidateQueries({ queryKey: ["projectProposal", variables.gprId] })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["projectProposals"] })
        },
    })
}