// Mutation hook for React Query

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateImmunizationStock } from "../restful-api/ImzSupplyPut.API"; // Adjust the path as needed
import { api } from "@/api/api";
import { useAddImzTransaction } from "../queries/ImzSupplyPostQueries";

export const useUpdateImmunizationStock = () => {
    return useMutation({
        mutationFn: async ({
            imzStck_id,
            inv_id,
            imzStck_qty,
            imzStck_pcs,
            imzStck_avail,
        }: {
            imzStck_id: number;
            inv_id: number;
            imzStck_qty: number;
            imzStck_pcs: number;
            imzStck_avail: number;
        }) =>
            updateImmunizationStock(
                imzStck_id,
                inv_id,
                imzStck_qty,
                imzStck_pcs,
                imzStck_avail,
            ),
        onError: (error: Error) => {
            console.error("Error updating immunization stock:", error.message);
        },
    });
};

export const useSubmitUpdateImmunizationStock = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: addImzTransactionRecord } = useAddImzTransaction();
  const { mutateAsync: UpdateImmunizationStockRecord } = useUpdateImmunizationStock();

  return useMutation({
    mutationFn: async ({
      supply,
      formData,
      originalUnit,
    }: {
      supply: any;
      formData: any;
      originalUnit: string;
    }) => {
      if (!formData) throw new Error("Form data is missing");

      // Get existing supply data
      const res = await api.get(`inventory/immunization_stock/${supply.id}/`);
      const existingSupply = res.data;

      // Calculate quantities and unit to store
      const currentUnit = formData.imzStck_unit;
      let boxCount = 0;
      let pcsCount = 0;
      let pcsPerBoxValue =
        Number(formData.pcsPerBox) || existingSupply.imzStck_per_pcs || 0;
      let totalPcsToAdd = 0;
      let fullBoxesToAdd = 0;
      let remainingPcsToAdd = 0;

      if (currentUnit === "boxes") {
        boxCount = Number(formData.boxCount) || 0;
        pcsPerBoxValue =
          Number(formData.pcsPerBox) || existingSupply.imzStck_per_pcs || 0;
        totalPcsToAdd = boxCount * pcsPerBoxValue;
        fullBoxesToAdd = boxCount;
        remainingPcsToAdd = 0;
      } else {
        pcsCount = Number(formData.pcsCount) || 0;
        totalPcsToAdd = pcsCount;

        if (pcsPerBoxValue > 0) {
          fullBoxesToAdd = Math.floor(pcsCount / pcsPerBoxValue);
          remainingPcsToAdd = pcsCount % pcsPerBoxValue;
        } else {
          remainingPcsToAdd = pcsCount;
        }
      }

      // Determine the unit to store
      let imzStck_unit = originalUnit;
      if (
        originalUnit === "pcs" &&
        (currentUnit === "boxes" || fullBoxesToAdd > 0)
      ) {
        imzStck_unit = "boxes";
      }

      const payload = {
        imzStck_id: supply.id,
        inv_id: supply.inv_id,
        imzStck_qty:
          imzStck_unit === "boxes"
            ? (existingSupply.imzStck_qty || 0) + fullBoxesToAdd
            : existingSupply.imzStck_qty || 0,
        imzStck_per_pcs: pcsPerBoxValue,
        imzStck_pcs: (existingSupply.imzStck_pcs || 0) + totalPcsToAdd,
        imzStck_avail: (existingSupply.imzStck_avail || 0) + totalPcsToAdd,
      };

      // Update immunization stock
      await UpdateImmunizationStockRecord({
        imzStck_id: payload.imzStck_id,
        inv_id: payload.inv_id,
        imzStck_qty: payload.imzStck_qty,
        imzStck_pcs: payload.imzStck_pcs,
        imzStck_avail: payload.imzStck_avail,
      });

      // Step 3: Add Transaction
      const string_qty =
        imzStck_unit === "boxes"
          ? `${payload.imzStck_qty} boxes (${payload.imzStck_pcs} pcs per box)`
          : `${payload.imzStck_qty} ${imzStck_unit}`;
      const staffId = 1;
      const imzStck_id = payload.imzStck_id;

      const transactionResponse = await addImzTransactionRecord({
        string_qty,
        staffId,
        imzStck_id,
        action: "Added",
      });

        if (!transactionResponse) {
            throw new Error("Failed to add immunization transaction");
        }

      return { success: true };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["immunizationStockList"] });
      alert("Successfully updated immunization stock");
    },

    onError: (error: any) => {
      console.error("Update immunization stock error:", error.message || error);
      alert(`Update failed: ${error.message || "Unknown error"}`);
    },
  });
};
