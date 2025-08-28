import { api } from "@/api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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
