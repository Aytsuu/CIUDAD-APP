import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccessToast, showErrorToast } from "@/components/ui/toast";
import { delWasteEvent, restoreWasteEvent } from "../api/wasteEventDelReq";
import { WasteEvent } from "./wasteEventQueries";

export const useDeleteWasteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ we_num, permanent = false }: { we_num: number; permanent?: boolean }) => 
      delWasteEvent(we_num, permanent),
    onSuccess: (_data, variables) => {
      const { we_num, permanent } = variables;
      if (permanent) {
        showSuccessToast("Waste event permanently deleted successfully");
      } else {
        showSuccessToast("Waste event archived successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["wasteEvents"] });
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to delete waste event");
    },
  });
};

export const useRestoreWasteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (we_num: number) => restoreWasteEvent(we_num),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wasteEvents"] });
      showSuccessToast("Waste event restored successfully");
    },
    onError: (_error: Error) => {
      showErrorToast("Failed to restore waste event");
    },
  });
};

