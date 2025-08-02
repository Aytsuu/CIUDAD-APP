import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  archiveProjectProposal,
  restoreProjectProposal,
  permanentDeleteProjectProposal,
  deleteSupportDocument, restoreSupportDocument,
  archiveSupportDocument
} from "../api/delreq"
import type { ProjectProposal } from "../projprop-types"
import { useToastContext } from "@/components/ui/toast"

export const useArchiveProjectProposal = () => {
  const queryClient = useQueryClient()
  const { toast } = useToastContext()

  return useMutation({
    mutationFn: archiveProjectProposal,
    onMutate: async (gprId) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] })
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"])

      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.map((proposal) => (proposal.gprId === gprId ? { ...proposal, gprIsArchive: true } : proposal)),
      )

      return { previousProposals }
    },
    onError: (error: Error, gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals)
      }
      toast.error(`Failed to archive project proposal: ${error.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] })
      toast.success("Project proposal archived successfully")
    },
  })
}

export const useRestoreProjectProposal = () => {
  const queryClient = useQueryClient()
  const { toast } = useToastContext()

  return useMutation({
    mutationFn: restoreProjectProposal,
    onMutate: async (gprId) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] })
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"])

      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.map((proposal) => (proposal.gprId === gprId ? { ...proposal, gprIsArchive: false } : proposal)),
      )

      return { previousProposals }
    },
    onError: (error: Error, gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals)
      }
      toast.error(`Failed to restore project proposal: ${error.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] })
      toast.success("Project proposal restored successfully")
    },
  })
}

export const usePermanentDeleteProjectProposal = () => {
  const queryClient = useQueryClient()
  const { toast } = useToastContext()

  return useMutation({
    mutationFn: permanentDeleteProjectProposal,
    onMutate: async (gprId) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] })
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"])

      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.filter((proposal) => proposal.gprId !== gprId),
      )

      return { previousProposals }
    },
    onError: (error: Error, gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals)
      }
      toast.error(`Failed to permanently delete project proposal: ${error.message}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] })
      toast.success("Project proposal permanently deleted")
    },
  })
}

 export const useDeleteSupportDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({ gprId, psdId }: { gprId: number; psdId: number }) => {
      return deleteSupportDocument(gprId, psdId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      toast.success("Support document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete support document: ${error.message}`);
    },
  });
};

export const useArchiveSupportDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({ gprId, psdId }: { gprId: number; psdId: number }) => {
      return archiveSupportDocument(gprId, psdId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      toast.success("Document archived successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to archive document.");
    },
  });
};

export const useRestoreSupportDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext();

  return useMutation({
    mutationFn: async ({ gprId, psdId }: { gprId: number; psdId: number }) => {
      return restoreSupportDocument(gprId, psdId);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      toast.success("Document restored successfully.");
    },
    onError: (error: Error) => {
      toast.error("Failed to restore document.");
    },
  });
};