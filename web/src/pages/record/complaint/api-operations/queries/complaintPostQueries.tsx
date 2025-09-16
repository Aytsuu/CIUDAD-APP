import { useQueryClient, useMutation } from "@tanstack/react-query";
import {archiveComplaint, raiseIssue,submitComplaint} from "../restful-api/complaint-api";

export const usePostComplaint = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => submitComplaint(formData),
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