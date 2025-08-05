import { useQuery } from "@tanstack/react-query";
import { getProjectProposals, getProjectProposal, getStaffList, getSupportDocs, getAllProposalLogs } from "../api/getreq";
import { ProjectProposal, SupportDoc, Staff, ProposalLog } from "../projprop-types";

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


export const useGetAllProposalLogs = (options = {}) => {
  return useQuery<ProposalLog[], Error>({
    queryKey: ["allProjectProposalLogs"],
    queryFn: getAllProposalLogs,
    staleTime: 1000 * 60 * 60,
    ...options,
  });
};