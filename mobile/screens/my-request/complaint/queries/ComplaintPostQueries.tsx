import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { raiseIssue } from "./complaintApi";
import { useToast } from "@/hooks/use-toast";
import { addSchedule } from "./complaintPostAPI";
import { useToastContext } from "@/components/ui/toast";

export const usePostComplaint = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const res = await api.post("complaint/create/", formData);
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


export const usePostRaiseIssue = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (compId: number) => raiseIssue(compId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["complaints"]});
        },
    })
}


export const useAddSummonSchedule = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const {toast} = useToastContext()

     return useMutation({
            mutationFn: (values: {sd_id: string; st_id: string; sr_id: string, ss_mediation_level: string}) => addSchedule(values),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['serviceChargeDetails'] });
                queryClient.invalidateQueries({ queryKey: ['caseTracking'] });

                toast.success('Record Submitted!');
                onSuccess?.()
            },
            onError: (err) => {
                console.error("Error submitting record:", err);
                toast.error("Failed to submit record. Please check the input data and try again.")
            } 
        })
}