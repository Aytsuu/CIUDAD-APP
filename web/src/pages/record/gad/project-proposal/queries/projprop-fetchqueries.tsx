import { useQuery } from "@tanstack/react-query";
import { getProjectProposals, getProjectProposal, getStaffList, getSupportDocs, getAvailableDevPlanProjects } from "../api/projpropgetreq";
import { ProjectProposal, SupportDoc, Staff, DevelopmentPlanProject } from "../projprop-types";

export const useGetProjectProposals = (options = {}) => {
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


export const useGetAvailableDevPlanProjects = (year?: string, options = {}) => {
  return useQuery<DevelopmentPlanProject[], Error>({
    queryKey: ["availableDevPlanProjects", year],
    queryFn: () => getAvailableDevPlanProjects(year),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};