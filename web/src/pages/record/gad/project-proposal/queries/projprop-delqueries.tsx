import { useMutation, useQueryClient } from "@tanstack/react-query";
import { archiveProjectProposal, 
  restoreProjectProposal,
  permanentDeleteProjectProposal, deleteSupportDocument, archiveSupportDocument, restoreSupportDocument } from "../api/projpropdelreq";
import { ProjectProposal } from "../projprop-types";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";

export const useArchiveProjectProposal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: archiveProjectProposal,
    onMutate: async (gprId) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] });
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"]);
      
      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.map(proposal => 
          proposal.gprId === gprId 
            ? { ...proposal, gprIsArchive: true } 
            : proposal
        )
      );
      
      return { previousProposals };
    },
    onError: (_error: Error, _gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      showErrorToast("Failed to archive project proposal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      queryClient.invalidateQueries({ queryKey: ["projectProposalGrandTotal"] });
      showSuccessToast("Project proposal archived successfully");
    }
  });
};

export const useRestoreProjectProposal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: restoreProjectProposal,
    onMutate: async (gprId) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] });
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"]);
      
      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.map(proposal => 
          proposal.gprId === gprId 
            ? { ...proposal, gprIsArchive: false } 
            : proposal
        )
      );
      
      return { previousProposals };
    },
    onError: (_error: Error, _gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      showErrorToast("Failed to restore project proposal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      queryClient.invalidateQueries({ queryKey: ["projectProposalGrandTotal"] });
      showSuccessToast("Project proposal restored successfully");
    }
  });
};

export const usePermanentDeleteProjectProposal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: permanentDeleteProjectProposal,
    onMutate: async (gprId) => {
      await queryClient.cancelQueries({ queryKey: ["projectProposals"] });
      const previousProposals = queryClient.getQueryData<ProjectProposal[]>(["projectProposals"]);
      
      queryClient.setQueryData<ProjectProposal[]>(["projectProposals"], (old = []) =>
        old.filter(proposal => proposal.gprId !== gprId)
      );
      
      return { previousProposals };
    },
    onError: (_error: Error, _gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      showErrorToast("Failed to permanently delete project proposal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      showSuccessToast("Project proposal permanently deleted");
    }
  });
};

export const useDeleteSupportDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gprId, psdId }: { gprId: number; psdId: number }) => {
      return deleteSupportDocument(gprId, psdId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      showSuccessToast("Support document deleted successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to delete support document");
    },
  });
};

export const useArchiveSupportDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gprId, psdId }: { gprId: number; psdId: number }) => {
      return archiveSupportDocument(gprId, psdId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      showSuccessToast("Support document archived successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to archive support document");
    },
  });
};

export const useRestoreSupportDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gprId, psdId }: { gprId: number; psdId: number }) => {
      return restoreSupportDocument(gprId, psdId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      showSuccessToast("Support document restored successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to restore support document");
    },
  });
};