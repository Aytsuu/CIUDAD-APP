import { api } from "@/api/api";
import { ProjectProposalInput, prepareEditProposalPayload } from "../projprop-types";

export const putProjectProposal =  async (proposalData: ProjectProposalInput) => {
  if (!proposalData.gprId) {
    throw new Error("Project proposal ID is required for updates");
  }

  const cleanedPayload = prepareEditProposalPayload(proposalData);
  
  const response = await api.put(
    `/gad/project-proposals/${proposalData.gprId}/`, 
    cleanedPayload,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
};