import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck, CircleX, Loader2 } from "lucide-react";
import { handleDeleteMedicineList } from "../../restful-api/medicine/MedicineDeleteAPI";

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicineId: string) => handleDeleteMedicineList(medicineId),

    // Show loading toast with spinner
    onMutate: () => {
      toast.loading("Deleting medicine...", {
        icon: <Loader2 size={18} className="animate-spin stroke-gray" />,
        id: "delete-loading",
      });
    },

    // On success, dismiss loading and show success
    onSuccess: () => {
      toast.dismiss("delete-loading");
      toast.success("Medicine deleted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
      });
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },

    // On error, dismiss loading and show error
    onError: (error: any) => {
      toast.dismiss("delete-loading");
      const message =
        error?.response?.data?.error || "Failed to delete medicine";
      toast.error(message, {
        icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      });
    },
  });
};