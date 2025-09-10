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
  staffId?: number | null
) => {
  try {
    const payload = {
      gprl_status: status,
      gprl_reason: reason,
      staffId: staffId
    };

    const res = await api.patch(`gad/review-project-proposals/${gprId}/`, payload);
    return res.data;
  } catch (err) {
    throw err;
  }
};