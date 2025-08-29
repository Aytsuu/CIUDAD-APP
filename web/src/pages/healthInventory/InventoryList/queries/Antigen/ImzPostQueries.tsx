import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { addImzSupplies } from "../../restful-api/Antigen/postAPI";
import { showErrorToast, showSuccessToast } from "@/components/ui/toast";

export const useAddImzSupplies = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: Record<string, any>) => addImzSupplies(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizationsupplies"] });
      showSuccessToast("Immunization supply added successfully");
      navigate(-1);
    },
    onError: (error: unknown) => {
      console.error("Failed to add immunization supply:", error);
      showErrorToast("Failed to add immunization supply");
    }
  });
};
