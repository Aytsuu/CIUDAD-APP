// mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { update_monthly_recipient_list_report } from "../restful-api/updateAPI";
import { toast } from "sonner";

export const useUpdateMonthlyRecipientList = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ monthlyrcplist_id, data }: { monthlyrcplist_id: string; data: any }) => update_monthly_recipient_list_report(monthlyrcplist_id, data),

    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["fareport"] });
      queryClient.invalidateQueries({ queryKey: ["medreport"] });
      queryClient.invalidateQueries({ queryKey: ["monthlyRecipientList", variables.monthlyrcplist_id] });

      toast.success("Recipient list updated successfully!");
    },

    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast.error(error.response?.data?.message || "Failed to update recipient list");
    }
  });
};
