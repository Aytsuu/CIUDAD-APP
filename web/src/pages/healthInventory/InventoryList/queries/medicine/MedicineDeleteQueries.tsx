import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleDeleteMedicineList } from "../../restful-api/medicine/MedicineDeleteAPI";
import { showSuccessToast,showErrorToast } from "@/components/ui/toast";
export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (medicineId: string) => handleDeleteMedicineList(medicineId),

    // On success, dismiss loading and show success
    onSuccess: () => {
      showSuccessToast("Medicine deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["medicines"] });
    },

    // On error, dismiss loading and show error
    onError: () => {
      showErrorToast("Cannot delete. It is still in use by other records.");

      // toast.dismiss("delete-loading");
      // const message =
      //   error?.response?.data?.error || "Cannot delete. It is still in use by other records.";
      // toast.error(message, {
      //   icon: <CircleX size={24} className="fill-red-500 stroke-white" />,
      // });
    },
  });
};