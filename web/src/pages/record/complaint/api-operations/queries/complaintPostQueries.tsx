import { useQueryClient, useMutation } from "@tanstack/react-query";
import {archiveComplaint, raiseIssue} from "../restful-api/complaint-api";
import { ComplaintFormData } from "@/form-schema/complaint-schema";
import api from "@/api/api";

type ComplaintSubmissionPayload = Omit<ComplaintFormData, 'incident'> & {
  comp_incident_type: string;
  comp_allegation: string;
  comp_location: string;
  comp_datetime: string;
};

export const usePostComplaint = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: ComplaintSubmissionPayload) => {
      const response = await api.post("complaint/create/", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
    },
  });
};

export const usePostArchiveComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveComplaint(id),
    onSuccess: () => {
        queryClient.invalidateQueries({queryKey: ["complaints"]});
        queryClient.invalidateQueries({queryKey: ["archivedComplaints"]});
    },
  });
};

export const useBulkArchiveComplaints = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const results = [];
      for (const id of ids) {
        const result = await archiveComplaint(id);
        results.push(result);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["complaints"]});
      queryClient.invalidateQueries({queryKey: ["archivedComplaints"]});
    },
  });
};

export const usePostRaiseIssue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (compId: number) => raiseIssue(compId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["complaints"]});
        },
    })
}
