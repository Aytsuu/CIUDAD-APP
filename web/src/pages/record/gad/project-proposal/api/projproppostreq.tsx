import { api } from "@/api/api";
import { SupportDocInput, ProjectProposalInput, prepareProposalPayload } from "../projprop-types";

export const postProjectProposal = async (proposalData: ProjectProposalInput) => {
  const cleanedPayload = prepareProposalPayload(proposalData);
  
  try {
    const response = await api.post('/gad/project-proposals/', cleanedPayload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const addSupportDocuments = async (fileData: SupportDocInput) => {
  if (!fileData.gpr_id) {
    throw new Error("Project proposal ID is required");
  }
  const response = await api.post(
    `/gad/project-proposals/${fileData.gpr_id}/support-docs/`, 
    fileData
  );
  return response.data;
};