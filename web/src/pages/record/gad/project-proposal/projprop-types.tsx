
export type SupportDoc = {
  psd_id: number;
  psd_url: string;
  psd_name: string;
  psd_type: string;
  psd_path?: string;
  psd_is_archive: boolean;
};

export type FileInput = {
  name: string;
  type: string;
  file: string; 
};

export type SupportDocInput = {
  gpr_id: number;
  files: FileInput[];
};

export type DevelopmentPlanProject = {
  dev_id: number;
  dev_client: string;
  dev_issue: string;
  project_title: string;
  participants: {
    category: string;
    count: string | number;
  }[]; 
  budget_items: BudgetItem[];
  dev_date: string;
};

export type BudgetItem = {
  name: string;
  pax: number | string;
  amount: string;
};

export type ProjectProposal = {
  gprId: number;
  projectTitle: string; 
  background: string;
  objectives: string[];
  participants: {
    category: string;
    count: string | number;
  }[]; 
  date: string;
  venue: string;
  budgetItems: any[]; 
  monitoringEvaluation: string;
  signatories: {
    name: string;
    position: string;
    type: "prepared" | "approved";
  }[];
  headerImage: string | null;
  gprDateCreated: string;
  gprIsArchive: boolean;
  staffId: any;
  staffName: string;
  supportDocs: SupportDoc[];
  devId: number;
  projectIndex: number;
  devDetails?: {
    dev_id: number;
    dev_project: string[];
    dev_gad_items: BudgetItem[];
    dev_res_person: string[];
    dev_indicator: string[];
    dev_client: string;
    dev_issue: string;
    dev_date: string;
  };
};

export type ProjectProposalInput = {
  gprId?: number;
  gpr_background: string;
  gpr_objectives: string[];
  gpr_date: string;
  gpr_venue: string;
  gpr_monitoring: string;
  gpr_signatories: {
    name: string;
    position: string;
    type: "prepared" | "approved";
  }[];
  gpr_header_img: string | null;
  staffId?: number | null | string;
  gprIsArchive?: boolean;
  supportDocs?: SupportDoc[];
  dev: number;
  participants?: {
    category: string;
    count: string | number;
  }[];
  budget_items?: any[];
  dev_date?: string;
};

export type Staff = {
  staff_id: number;
  full_name: string;
  position: string;
};

export interface EditProjectProposalFormProps {
  onSuccess: (data: ProjectProposal) => void;
  initialValues?: ProjectProposal;
  isEditMode?: boolean;
  isSubmitting?: boolean;
}

export interface ProjectProposalFormProps {
  onSuccess: () => void;
  existingProposal?: any;
}

export interface Signatory {
  name: string;
  position: string;
  type: "prepared" | "approved";
}

export interface ViewProjectProposalProps {
  project: ProjectProposal;
  onLoad?: () => void;
  onError?: () => void;
  onClose?: () => void;
  projectSource?: string;
}


export const prepareProposalPayload = (proposalData: ProjectProposalInput) => {
  // Prepare header image data
  let headerImageData = null;
  if (proposalData.gpr_header_img) {
    if (proposalData.gpr_header_img.startsWith('data:')) {
      const [header, _data] = proposalData.gpr_header_img.split(';base64,');
      const mimeType = header.split(':')[1];
      const fileName = `header-${Date.now()}.${mimeType.split('/')[1]}`;
      
      headerImageData = {
        name: fileName,
        type: mimeType,
        file: proposalData.gpr_header_img
      };
    } else {
      headerImageData = proposalData.gpr_header_img;
    }
  }

  const payload = {
    gpr_background: proposalData.gpr_background,
    gpr_objectives: proposalData.gpr_objectives,
    gpr_date: proposalData.gpr_date,
    gpr_venue: proposalData.gpr_venue,
    gpr_monitoring: proposalData.gpr_monitoring,
    gpr_signatories: proposalData.gpr_signatories,
    gpr_header_img: headerImageData,
    staff: proposalData.staffId,
    gpr_is_archive: proposalData.gprIsArchive || false,
    dev: proposalData.dev,
    participants: proposalData.participants,
    budget_items: proposalData.budget_items
  };

 return Object.fromEntries(
    Object.entries(payload).filter(([key, value]) => {

      if (key === 'participants' || key === 'budget_items') {
        return true;
      }
      return value !== null && value !== undefined;
    })
  );
};

export const prepareEditProposalPayload = (proposalData: ProjectProposalInput) => {
  const payload: any = {
    gpr_background: proposalData.gpr_background,
    gpr_objectives: proposalData.gpr_objectives,
    gpr_date: proposalData.gpr_date,
    gpr_venue: proposalData.gpr_venue,
    gpr_monitoring: proposalData.gpr_monitoring,
    gpr_signatories: proposalData.gpr_signatories,
    staff: proposalData.staffId,
    gpr_is_archive: proposalData.gprIsArchive || false,
    dev: proposalData.dev,
    participants: proposalData.participants,
    budget_items: proposalData.budget_items
  };

  // Handle header image explicitly
  if (proposalData.gpr_header_img !== undefined) {
    if (proposalData.gpr_header_img === null) {
      payload.gpr_header_img = null;
    } else if (typeof proposalData.gpr_header_img === 'string') {
      if (proposalData.gpr_header_img.startsWith('data:')) {
        const [header, _data] = proposalData.gpr_header_img.split(';base64,');
        const mimeType = header.split(':')[1];
        payload.gpr_header_img = {
          name: `header-${Date.now()}.${mimeType.split('/')[1] || 'jpg'}`,
          type: mimeType,
          file: proposalData.gpr_header_img
        };
      }
    }
  }
  return payload;
};