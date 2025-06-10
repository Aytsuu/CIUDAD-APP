
import { useMutation,useQueryClient } from "@tanstack/react-query"; // or 'react-query' depending on your version
import { api } from "@/pages/api/api";
import {updateVaccineStock} from "../restful-api/VaccinePutAPI"; // Adjust the path if needed
import { AntigenTransaction } from "../restful-api/VaccinePostAPI";

export const useUpdateVaccineStock = () => {
    return useMutation({
      mutationFn: (data: {
        vacStck_id: number;
        inv_id: number;
        qty: number;
        vacStck_qty_avail: number;
      }) => updateVaccineStock(data.vacStck_id, data.inv_id, data.qty, data.vacStck_qty_avail),
      onError: (error: Error) => {
        console.error("Error updating vaccine stock:", error.message);
      },
    });
  };



export const useSubmitUpdateVaccineStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vaccine,
      formData,
      isDiluent,
      staffId = 1,
    }: {
      vaccine: any;
      formData: any;
      isDiluent: boolean;
      staffId?: number;
    }) => {
      if (!formData) throw new Error("Form data is missing");

      const inputQty = Number(formData.qty) || 0;
      const inputDoseMl =
        Number(formData.dose_ml) || (isDiluent ? 1 : vaccine.item.dosage || 0);

      const res = await api.get("inventory/vaccine_stocks/");
      const existingVaccine = res.data.find(
        (vac: any) => vac.vacStck_id === vaccine.id
      );

      if (!existingVaccine) {
        throw new Error("Vaccine ID not found. Please check the ID.");
      }

      const currentQty = Number(existingVaccine.qty) || 0;
      const currentAvailQty = Number(existingVaccine.vacStck_qty_avail) || 0;

      const qty = currentQty + inputQty;
      const availqty =
        existingVaccine.solvent === "doses"
          ? currentAvailQty + inputQty * inputDoseMl
          : currentAvailQty + inputQty;

      await updateVaccineStock(vaccine.id, vaccine.inv_id, qty, availqty);

      const dose_ml = inputDoseMl;
      const string_qty = isDiluent
        ? `${formData.qty} container${formData.qty > 1 ? "s" : ""}`
        : `${formData.qty} vial${formData.qty > 1 ? "s" : ""} (${
            formData.qty * dose_ml
          } dose${formData.qty * dose_ml > 1 ? "s" : ""})`;

      const transactionResponse = await AntigenTransaction(
        vaccine.id,
        string_qty,
        "Added",
        staffId
      );

      if (!transactionResponse) {
        throw new Error("Failed to add vaccine transaction");
      }

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaccineStockList"] });
    },
    onError: (error: any) => {
      console.error("Update vaccine stock error:", error.message || error);
    },
  });
};
