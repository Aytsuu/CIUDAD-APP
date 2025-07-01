import api from '@/pages/api/api';

export const postProjectProposal = async (proposalInfo: Record<string, any>) => {
  try {
    const payload = {
      gpr_title: proposalInfo.projectTitle,
      gpr_background: proposalInfo.background,
      gpr_objectives: proposalInfo.objectives || [],
      gpr_participants: proposalInfo.participants || [],
      gpr_date: proposalInfo.date,
      gpr_venue: proposalInfo.venue,
      gpr_budget_items: proposalInfo.budgetItems || [],
      gpr_monitoring: proposalInfo.monitoringEvaluation,
      gpr_signatories: proposalInfo.signatories || [],
      gpr_header_img: proposalInfo.gpr_header_img || null,
      staff: proposalInfo.staffId || null,
      gpr_is_archive: false,
      gpr_page_size: proposalInfo.paperSize
    };

    const res = await api.post('gad/project-proposals/', payload);
    return res.data;
  } catch (err: any) {
   console.error('Error posting project proposal:', {
    status: err.response?.status,
      data: JSON.stringify(err.response?.data, null, 2),
      message: err.message,
  });
    throw err;
  }
};

export const addSupportDocument = async (gprId: number, fileData: {
  psd_url: string;
  psd_path: string;
  psd_name: string;
  psd_type: string;
}) => {
  if (!gprId) {
    throw new Error("Project ID is required");
  }
  
  try {
    const res = await api.post(`gad/project-proposals/${gprId}/support-docs/`, {
      ...fileData,
      psd_is_archive: false,
      gpr_id: gprId 
    });
    return res.data;
  } catch (error) {
    console.error("Error adding support document:", error);
    throw error;
  }
};