export type SupportDoc = {
  psd_id: number;
  psd_url: string;
  psd_name: string;
  psd_type: string;
  psd_path?: string;
  psd_is_archive: boolean;
};

export type ProjectProposal = {
  gprId: number
  projectTitle: string
  background: string
  objectives: string[]
  participants: { category: string; count: number }[]
  date: string
  venue: string
  budgetItems: { name: string; pax: string; amount: number }[]
  monitoringEvaluation: string
  signatories: { name: string; position: string; type: "prepared" | "approved" }[]
  headerImage: string | null
  gprDateCreated: string
  gprIsArchive: boolean
  staffId: number | null
  staffName: string
  supportDocs: SupportDoc[]
}

export type ProjectProposalInput = {
  projectTitle: string
  background: string
  objectives: string[]
  participants: { category: string; count: string }[]
  date: string
  venue: string
  budgetItems: { name: string; pax: string; amount: string }[]
  monitoringEvaluation: string
  signatories: { name: string; position: string; type: "prepared" | "approved" }[]
  gpr_header_img: string | null
  staffId?: number | null
  gprIsArchive?: boolean
  supportDocs?: SupportDoc[]
}

export type Staff = {
  staff_id: number
  full_name: string
  position: string
}

export interface ProjectProposalViewProps {
  project?: ProjectProposal ;
  onBack?: () => void;
  customHeaderActions?: React.ReactNode;
  disableDocumentManagement?: boolean;
}