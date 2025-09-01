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

export const patchProjectProposalStatus = async (
  gprId: number,
  status: string,
  reason: string | null,
) => {
  try {
    const payload = {
      gprl_status: status, // Only send the status field
      gprl_reason: reason,
    };

    const res = await api.patch(`gad/review-project-proposals/${gprId}/`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};