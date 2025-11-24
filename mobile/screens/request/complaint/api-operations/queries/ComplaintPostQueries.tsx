import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ComplaintFormData } from "@/form-schema/complaint-schema";

type ComplaintSubmissionPayload = Omit<ComplaintFormData, 'incident'> & {
  comp_incident_type: string;
  comp_allegation: string;
  comp_location: string;
  comp_datetime: string;
}
export const usePostComplaint = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: ComplaintSubmissionPayload) => {
      const res = await api.post("complaint/create/", payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["complaints"] });

      toast.success("Complaint Submitted", 3000, "bottom");
    },
    onError: () => {
      toast.error("Submission Failed", 3000, "bottom");
    },
  });
};