// use-update-header-report.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { update_header_report } from "../restful-api/update";
import { toast } from "sonner";

export const useUpdateHeaderReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rcpheader_id, data }: { rcpheader_id: string; data: any }) =>
      update_header_report(rcpheader_id, data),
    onSuccess: () => {
      toast.success("Header report updated successfully");
      queryClient.invalidateQueries({ queryKey: ["monthlyMorbidityDetails"] });
    },
    onError: (error: any) => {
      console.error("Error updating header report:", error);
      toast.error("Failed to update header report");
    },
  });
};