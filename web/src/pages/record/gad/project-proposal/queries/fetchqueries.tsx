import { useQuery } from "@tanstack/react-query";
import { getProjectProposals, getProjectProposal, getStaffList, getSupportDocs } from "../api/getreq";

export type ProjectProposalLog = {
  gprlId: number;
  gprlDateApprovedRejected: string;
  gprlReason: string | null;
  gprlDateSubmitted: string;
  gprlStatus: "Pending" | "Approved" | "Rejected" | "Viewed";
  staffId: number | null;
};

export type SupportDoc = {
  psd_id: number;
  psd_url: string;
  psd_name: string;
  psd_type: string;
  psd_path?: string;
  psd_is_archive: boolean;
};

export type ProjectProposal = {
  gprId: number;
  projectTitle: string;
  background: string;
  objectives: string[];
  participants: { category: string; count: number }[];
  date: string;
  venue: string;
  budgetItems: { name: string; pax: string; amount: number }[];
  monitoringEvaluation: string;
  signatories: { name: string; position: string; type: "prepared" | "approved" }[];
  headerImage: string | null;
  gprDateCreated: string;
  gprIsArchive: boolean;
  staffId: number | null;
  staffName: string;
  status: "Pending" | "Approved" | "Rejected" | "Viewed";
  statusReason: string | null;
  logs: ProjectProposalLog[];
  paperSize: "a4" | "letter" | "legal";
  supportDocs: SupportDoc[];
};

export type ProjectProposalInput = {
  projectTitle: string;
  background: string;
  objectives: string[];
  participants: { category: string; count: string }[];
  date: string;
  venue: string;
  budgetItems: { name: string; pax: string; amount: string }[];
  monitoringEvaluation: string;
  signatories: { name: string; position: string; type: "prepared" | "approved" }[];
  gpr_header_img: string | null;
  staffId?: number | null;
  gprIsArchive?: boolean;
  supportDocs?: SupportDoc[];
};

export type Staff = {
  staff_id: number;
  full_name: string;
  position: string;
};

export const useGetProjectProposals = (status?: string, options = {}) => {
  return useQuery<ProjectProposal[], Error>({
    queryKey: ["projectProposals", status],
    queryFn: () => getProjectProposals(status),
    staleTime: 1000 * 60 * 5,
    ...options,
  });
};

export const useGetProjectProposal = (gprId: number, options = {}) => {
  return useQuery<ProjectProposal, Error>({
    queryKey: ["projectProposals", gprId],
    queryFn: () => getProjectProposal(gprId),
    enabled: !!gprId,
    ...options,
  });
};

export const useGetStaffList = (options = {}) => {
  return useQuery<Staff[], Error>({
    queryKey: ["staffList"],
    queryFn: getStaffList,
    staleTime: 1000 * 60 * 60,
    ...options,
  });
};



export const useGetSupportDocs = (proposalId: number, options = {}) => {
  return useQuery<SupportDoc[], Error>({
    queryKey: ["supportDocs", proposalId],
    queryFn: () => getSupportDocs(proposalId),
    enabled: !!proposalId,
    ...options
  });
};