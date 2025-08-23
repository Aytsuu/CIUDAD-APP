import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { addImzSupplies } from "../../restful-api/Antigen/postAPI";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useAddImzSupplies = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, any>) => addImzSupplies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ImzSupplies"] });
      showSuccessToast("Immunization supply added successfully");
    },
    onError: (error: unknown) => {
      console.error("Failed to add immunization supply:", error);
      showErrorToast("Failed to add immunization supply");
    }
  });
};
