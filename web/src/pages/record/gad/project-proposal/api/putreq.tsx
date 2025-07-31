import { api } from "@/api/api";
import { ProjectProposal, ProjectProposalInput } from "../projprop-types";

export const putProjectProposal = async (
  gprId: number, 
  proposalInfo: ProjectProposalInput,
  proposalF: ProjectProposal
) => {
  try {
    const payload = {
      gpr_title: proposalInfo.projectTitle,
      gpr_background: proposalInfo.background,
      gpr_objectives: proposalInfo.objectives,
      gpr_participants: proposalInfo.participants.map(p => ({
        category: p.category,
        count: p.count, // or parseInt(p.count) if backend expects number
      })),
      gpr_date: proposalInfo.date,
      gpr_venue: proposalInfo.venue,
      gpr_budget_items: proposalInfo.budgetItems.map(item => ({
        name: item.name,
        pax: item.pax,
        amount: item.amount, 
      })),
      gpr_monitoring: proposalInfo.monitoringEvaluation,
      gpr_signatories: proposalInfo.signatories || [],
      gpr_header_img: proposalInfo.gpr_header_img,
      staff: proposalInfo.staffId,
      gpr_is_archive: proposalInfo.gprIsArchive,
      gpr_page_size: proposalF.paperSize,
      support_docs: proposalInfo.supportDocs?.map(doc => ({
        psd_id: doc.psd_id,
        psd_url: doc.psd_url,
        psd_name: doc.psd_name,
        psd_type: doc.psd_type,
        psd_is_archive: doc.psd_is_archive,
      })) || [],
    };

    const res = await api.put(`gad/project-proposals/${gprId}/`, payload);
    return res.data;
  } catch (err) {
    console.error(`Error updating project proposal ${gprId}:`, err);
    throw err;
  }
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
    console.error(`Error updating project proposal status ${gprId}:`, err);
    throw err;
  }
};