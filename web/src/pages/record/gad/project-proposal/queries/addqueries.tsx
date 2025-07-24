import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";
import { postProjectProposal, addSupportDocument } from "../api/postreq";
import { ProjectProposalInput } from "./fetchqueries";

export const useAddProjectProposal = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (proposalData: ProjectProposalInput) => postProjectProposal(proposalData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals"] });
      toast.success("Project proposal added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
      navigate(`/gad-project-proposal`);
    },
    onError: (error: Error) => {
      toast.error("Failed to add project proposal", {
        description: error.message,
        duration: 2000,
      });
    },
  });
};

export const useAddSupportDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      gprId, 
      fileData 
    }: { 
      gprId: number; // Ensure this is required
      fileData: {
        file_url: string;
        file_path: string;
        file_name: string;
        file_type: string;
      };
    }) => {
      if (!gprId) {
        throw new Error("Project proposal ID is required");
      }
      return addSupportDocument(gprId, fileData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals", variables.gprId] });
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      // toast.success("Support document added successfully", {
      //   icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      //   duration: 2000,
      // });
    },
    onError: (error: Error) => {
      toast.error("Failed to add support document", {
        description: error.message,
        duration: 2000,
      });
    },
  });
};