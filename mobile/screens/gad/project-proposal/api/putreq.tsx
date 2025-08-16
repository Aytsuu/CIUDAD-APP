import { api } from "@/api/api";

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