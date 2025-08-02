import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastContext } from "@/components/ui/toast"
import { addSupportDocument } from "../api/postreq";

export const useAddSupportDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToastContext()

  return useMutation({
    mutationFn: async ({ 
      gprId, 
      fileData 
    }: { 
      gprId: number;
      fileData: {
        psd_url: string;
        psd_path: string;
        psd_name: string;
        psd_type: string;
      };
    }) => {
      if (!gprId) {
        throw new Error("Project proposal ID is required");
      }
      return addSupportDocument(gprId, fileData);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["projectProposals", variables.gprId] });
      queryClient.invalidateQueries({ queryKey: ["supportDocs", variables.gprId] });
      toast.success("Supporting documents added successfully.")
    },
    onError: (error: Error) => {
      toast.error("Failed to add supporting document.")
    },
  });
};