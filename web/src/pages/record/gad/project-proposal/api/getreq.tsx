import api from "@/pages/api/api";

export const getProjectProposals = async (status?: string) => {
  try {
    const url = status 
      ? `gad/project-proposals/?status=${status}&is_archive=false`
      : 'gad/project-proposals/?is_archive=false';
    const res = await api.get(url);
    const data = res.data?.data ?? res.data ?? [];
    
    const proposalsWithData = await Promise.all(
      (Array.isArray(data) ? data : []).map(async (proposal: any) => {
        const gprId = proposal.gpr_id || proposal.gprId;
        try {
          const [logsRes, suppDocsRes] = await Promise.all([
            api.get(`gad/project-proposals/${gprId}/logs/`),
            api.get(`gad/project-proposals/${gprId}/support-docs/`, {
              params: { is_archive: false }
            })
          ]);
          return transformProposalWithData(proposal, logsRes.data, suppDocsRes.data);
        } catch (err) {
          console.error(`Error fetching data for gprId ${gprId}:`, err);
          return transformProposalWithData(proposal, [], []);
        }
      })
    );
    
    return proposalsWithData;
  } catch (err) {
    console.error('Error fetching project proposals:', err);
    return [];
  }
};

export const getProjectProposal = async (gprId: number) => {
  try {
    const [proposalRes, logsRes, suppDocsRes] = await Promise.all([
      api.get(`gad/project-proposals/${gprId}/`),
      api.get(`gad/project-proposals/${gprId}/logs/`),
      api.get(`gad/project-proposals/${gprId}/support-docs/`, {
        params: { is_archive: false }
      })
    ]);
    return transformProposalWithData(proposalRes.data, logsRes.data, suppDocsRes.data);
  } catch (err) {
    console.error(`Error fetching project proposal ${gprId}:`, err);
    throw err;
  }
};

export const getStaffList = async () => {
  try {
    const res = await api.get('gad/api/staff/');
    const data = res.data?.data ?? res.data ?? [];
    return data.map((staff: any) => ({
      staff_id: staff.staff_id,
      full_name: staff.full_name,
      position: staff.position,
    }));
  } catch (err) {
    console.error('Error fetching staff list:', err);
    return [];
  }
};

export const getSupportDocs = async (proposalId: number) => {
  try {
    const res = await api.get(`gad/project-proposals/${proposalId}/support-docs/`, {
      params: { is_archive: false }
    });
    console.log('Support Docs API Response:', res.data); // Debug log
    const data = res.data?.data ?? res.data ?? [];
    return data.map((doc: any) => ({
      psd_id: doc.psd_id ?? 0,
      psd_url: doc.psd_url ?? '',
      psd_name: doc.psd_name ?? 'Unknown',
      psd_type: doc.psd_type ?? 'application/octet-stream',
      psd_path: doc.psd_path ?? '',
      psd_is_archive: doc.psd_is_archive ?? false
    }));
  } catch (err) {
    console.error(`Error fetching support docs for proposal ${proposalId}:`, err);
    return [];
  }
};

const transformProposalWithData = (proposal: any, logs: any[], suppDocs: any[]) => {
  const transformed = {
    gprId: proposal.gprId ?? proposal.gpr_id ?? 0,
    projectTitle: proposal.gprTitle ?? proposal.gpr_title ?? 'Untitled',
    background: proposal.gprBackground ?? proposal.gpr_background ?? 'No background provided',
    objectives: proposal.gprObjectives ?? proposal.gpr_objectives ?? [],
    participants: proposal.gprParticipants ?? proposal.gpr_participants ?? [],
    date: proposal.gprDate ?? proposal.gpr_date ?? new Date().toISOString(),
    venue: proposal.gprVenue ?? proposal.gpr_venue ?? 'No venue provided',
    budgetItems: proposal.gprBudgetItems ?? proposal.gpr_budget_items ?? [],
    monitoringEvaluation: proposal.gprMonitoring ?? proposal.gpr_monitoring ?? '',
    signatories: proposal.gprSignatories ?? proposal.gpr_signatories ?? [],
    headerImage: proposal.gprHeaderImage ?? proposal.gprHeaderImg ?? proposal.gpr_header_img ?? null,
    gprDateCreated: proposal.gprCreated ?? proposal.gpr_created ?? new Date().toISOString(),
    gprIsArchive: proposal.gprIsArchive ?? proposal.gpr_is_archive ?? false,
    status: proposal.status ? 
      proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1).toLowerCase() : 'Pending',
    statusReason: null,
    statusDate: proposal.statusDate ?? proposal.date_approved_rejected ?? null,
    staffId: proposal.staffId ?? proposal.staff ?? null,
    staffName: proposal.staffName ?? proposal.staff_name ?? 'Unknown',
    logs: (logs || []).map(log => ({
      gprlId: log.gprl_id,
      gprlDateApprovedRejected: log.gprl_date_approved_rejected,
      gprlReason: log.gprl_reason,
      gprlDateSubmitted: log.gprl_date_submitted,
      gprlStatus: log.gprl_status,
      staffId: log.staff
    })),
    supportDocs: (suppDocs || []).map(doc => {
      console.log('Mapping Support Doc:', JSON.stringify(doc, null, 2)); // Debug
      return {
        psd_id: doc.psd_id ?? 0,
        psd_url: doc.psd_url ?? '',
        psd_name: doc.psd_name ?? 'Unknown',
        psd_type: doc.psd_type ?? 'application/octet-stream',
        psd_is_archive: doc.psd_is_archive ?? false
      };
    }),
    paperSize: proposal.gprPageSize ?? proposal.gpr_page_size ?? 'letter',
  };

  if (logs?.length > 0) {
    const validLogs = logs.filter(log => log.gprl_date_approved_rejected);
    const latestLog = validLogs.length > 0
      ? [...validLogs].sort((a, b) => 
          new Date(b.gprl_date_approved_rejected).getTime() - new Date(a.gprl_date_approved_rejected).getTime()
        )[0]
      : logs[0];
    transformed.statusReason = latestLog.gprl_reason || null;
    // Always update status from the latest log if it exists
    transformed.status = latestLog.gprl_status || transformed.status;
  }
  
  return transformed;
};