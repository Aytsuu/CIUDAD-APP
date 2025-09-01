import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, CircleX } from "lucide-react";
import { archiveProjectProposal, 
  restoreProjectProposal,
  permanentDeleteProjectProposal, deleteSupportDocument, archiveSupportDocument, restoreSupportDocument } from "../api/projpropdelreq";
import { ProjectProposal } from "../projprop-types";


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
    onError: (error: Error, _gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      toast.error("Failed to archive project proposal", {
        description: error.message,
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      toast.success("Project proposal archived successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
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
    onError: (error: Error, _gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      toast.error("Failed to restore project proposal", {
        description: error.message,
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      toast.success("Project proposal restored successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
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
    onError: (error: Error, _gprId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(["projectProposals"], context.previousProposals);
      }
      toast.error("Failed to permanently delete project proposal", {
        description: error.message,
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
        duration: 2000
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      toast.success("Project proposal permanently deleted", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000
      });
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
      toast.success("Support document deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete support document", {
        description: error.message,
        duration: 2000,
      });
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
      toast.success("Support document archived successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to delete archive document", {
        description: error.message,
        duration: 2000,
      });
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
      toast.success("Support document restored successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: Error) => {
      toast.error("Failed to restore support document", {
        description: error.message,
        duration: 2000,
      });
    },
  });
};