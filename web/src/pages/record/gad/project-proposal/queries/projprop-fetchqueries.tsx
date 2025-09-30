import { useQuery } from "@tanstack/react-query";
import { getProjectProposals, getProjectProposal, getStaffList, getSupportDocs, getAvailableDevPlanProjects, getProjectProposalYears } from "../api/projpropgetreq";
import { ProjectProposal, SupportDoc, Staff, DevelopmentPlanProject } from "../projprop-types";

export const useGetProjectProposalYears = (options = {}) => {
  return useQuery<number[], Error>({
    queryKey: ["projectProposalYears"],
    queryFn: getProjectProposalYears,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    ...options,
  });
};

// export const useGetProjectProposals = (options = {}) => {
//   return useQuery<ProjectProposal[], Error>({
//     queryKey: ["projectProposals", status],
//     queryFn: () => getProjectProposals(status),
//     staleTime: 1000 * 60 * 5,
//     ...options,
//   });
// };

export const useGetProjectProposals = (
  page: number = 1,
  pageSize: number = 10,
  searchQuery?: string,
  archive?: boolean,
  year?: string,
  options = {}
) => {
  return useQuery<{ results: ProjectProposal[]; count: number }, Error>({
    queryKey: ["projectProposals", page, pageSize, searchQuery, archive, year],
    queryFn: () => getProjectProposals(page, pageSize, searchQuery, archive, year),
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


export const useGetAvailableDevPlanProjects = (year?: string, options = {}) => {
  return useQuery<DevelopmentPlanProject[], Error>({
    queryKey: ["availableDevPlanProjects", year],
    queryFn: () => getAvailableDevPlanProjects(year),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};