import { api } from "@/api/api"

export const getProjectProposalYears = async (): Promise<number[]> => {
  try {
    const res = await api.get('gad/project-proposal-years/');
    return res.data || [];
  } catch (err) {
    console.error('Error fetching proposal years:', err);
    return [];
  }
};

export const getProjectProposals = async (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  archive?: boolean,
  year?: string
): Promise<{ results: any[]; count: number }> => {
  try {
    const params: any = {
      page,
      page_size: pageSize,
      is_archive: archive !== undefined ? archive : false
    };
    
    if (searchQuery) params.search = searchQuery;
    if (year && year !== "All") params.year = year;
    const res = await api.get('gad/project-proposals/', { params });
    
    if (res.data.results) {
      const proposalsWithData = await Promise.all(
        res.data.results.map(async (proposal: any) => {
          const gprId = proposal.gpr_id || proposal.gprId;
          try {
            const [suppDocsRes] = await Promise.all([
              api.get(`gad/project-proposals/${gprId}/support-docs/`, {
                params: { is_archive: false }
              })
            ]);
            return transformProposalWithData(proposal, suppDocsRes.data);
          } catch (err) {
            return transformProposalWithData(proposal, []);
          }
        })
      );
      
      return {
        results: proposalsWithData,
        count: res.data.count || 0
      };
    }
    
    return { results: [], count: 0 };
  } catch (err) {
    console.error('Error fetching project proposals:', err);
    return { results: [], count: 0 };
  }
};

export const getProjectProposal = async (gprId: number) => {
  try {
    const [proposalRes, suppDocsRes] = await Promise.all([
      api.get(`gad/project-proposals/${gprId}/`),
      api.get(`gad/project-proposals/${gprId}/support-docs/`, {
        params: { is_archive: false }
      })
    ]);
    return transformProposalWithData(proposalRes.data, suppDocsRes.data);
  } catch (err) {
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

    return [];
  }
};

export const getSupportDocs = async (proposalId: number) => {
  try {
    const res = await api.get(`gad/project-proposals/${proposalId}/support-docs/`, {
      params: { is_archive: false }
    });
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
    return [];
  }
};

const transformProposalWithData = (proposal: any, suppDocs: any[]) => {
  const transformed = {
    gprId: proposal.gprId ?? proposal.gpr_id ?? 0,
    projectTitle: proposal.gprTitle ?? proposal.gpr_title ?? 'Untitled',
    background: proposal.gprBackground ?? proposal.gpr_background ?? 'No background provided',
    objectives: proposal.gprObjectives ?? proposal.gpr_objectives ?? [],
    participants: proposal.gprParticipants ?? proposal.gpr_participants ?? [],
    date: proposal.gprDate ?? proposal.project_date ?? proposal.gpr_date ?? proposal.date ?? new Date().toISOString(),
    venue: proposal.gprVenue ?? proposal.gpr_venue ?? 'No venue provided',
     budgetItems: (proposal.gprBudgetItems || proposal.gpr_budget_items || []).map((item: any) => ({
      name: item.name || '',
      pax: item.pax || '',
      amount: item.amount || item.price || 0 
    })),
    monitoringEvaluation: proposal.gprMonitoring ?? proposal.gpr_monitoring ?? '',
    signatories: proposal.gprSignatories ?? proposal.gpr_signatories ?? [],
    headerImage: proposal.gprHeaderImage ?? proposal.gprHeaderImg ?? proposal.gpr_header_img ?? null,
    gprDateCreated: proposal.gprCreated ?? proposal.gpr_created ?? new Date().toISOString(),
    gprIsArchive: proposal.gprIsArchive ?? proposal.gpr_is_archive ?? false,
    staffId: proposal.staffId ?? proposal.staff ?? null,
    staffName: proposal.staffName ?? proposal.staff_name ?? 'Unknown',
    supportDocs: (suppDocs || []).map(doc => {
      return {
        psd_id: doc.psd_id ?? 0,
        psd_url: doc.psd_url ?? '',
        psd_name: doc.psd_name ?? 'Unknown',
        psd_type: doc.psd_type ?? 'application/octet-stream',
        psd_is_archive: doc.psd_is_archive ?? false
      };
    }),
    devId: proposal.devId ?? proposal.dev_id ?? proposal.dev?.dev_id ?? 0,
    projectIndex: proposal.projectIndex ?? proposal.gpr_project_index ?? 0,
    devDetails: proposal.devDetails ?? proposal.dev_details ?? (proposal.dev ? {
      dev_id: proposal.dev.dev_id,
      dev_project: proposal.dev.dev_project,
      dev_gad_items: proposal.dev.dev_gad_items,
      dev_res_person: proposal.dev.dev_res_person,
      dev_indicator: proposal.dev.dev_indicator,
      dev_client: proposal.dev.dev_client,
      dev_issue: proposal.dev.dev_issue,
      dev_date: proposal.dev.dev_date
    } : undefined)
  };
  
  return transformed;
};

