import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchCommodityStock,
  updateCommodityStockQuantity,
  updateInventoryTimestamp,
} from "../restful-api/CommodityPutAPI";
import { CommodityStocksRecord } from "../../../tables/type";
import { useAddCommodityTransaction } from "./CommodityPostQueries";

export const useFetchCommodityStock = () => {
  return useMutation({
    mutationFn: (cinv_id: number) => fetchCommodityStock(cinv_id),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};

export const useUpdateCommodityStockQuantity = () => {
  return useMutation({
    mutationFn: ({
      cinv_id,
      qty,
      qty_avail,
    }: {
      cinv_id: number;
      qty: number;
      qty_avail: number;
    }) => updateCommodityStockQuantity(cinv_id, qty, qty_avail),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};

export const useUpdateInventoryTimestamp = () => {
  return useMutation({
    mutationFn: (inv_id: number) => updateInventoryTimestamp(inv_id),
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};

export const useUpdateCommodityStock = () => {
  const queryClient = useQueryClient();
  const { mutateAsync: fetchStock } = useFetchCommodityStock();
  const { mutateAsync: updateQuantity } = useUpdateCommodityStockQuantity();
  const { mutateAsync: updateTimestamp } = useUpdateInventoryTimestamp();
  const { mutateAsync: addTransaction } = useAddCommodityTransaction();

  return useMutation({
    mutationFn: async ({
      formData,
      initialData,
    }: {
      formData: any;
      initialData: CommodityStocksRecord;
    }) => {
      // Step 1: Fetch current commodity stock using mutation
      const existingCommodity = await fetchStock(initialData.cinv_id);

      const currentQtyAvail = existingCommodity.cinv_qty_avail;
      let qty = existingCommodity.cinv_qty;
      const currentPcs = existingCommodity.cinv_pcs;
      const inv_id = existingCommodity.inv_detail?.inv_id;

      // Validate pieces per box if updating boxes
      if (
        formData.cinv_qty_unit === "boxes" &&
        Number(currentPcs) !== Number(formData.cinv_pcs)
      ) {
        throw new Error(
          `Pieces per box must match the existing stock (${currentPcs}).`
        );
      }

      // Calculate new quantities
      let newQtyAvail = currentQtyAvail;
      if (formData.cinv_qty_unit === "boxes") {
        qty += formData.cinv_qty;
        newQtyAvail = qty * currentPcs;
      } else {
        qty += formData.cinv_qty;
        newQtyAvail = qty;
      }

      // Step 2: Update commodity stock quantity using mutation
      await updateQuantity({
        cinv_id: initialData.cinv_id,
        qty,
        qty_avail: newQtyAvail,
      });

      // Step 3: Update inventory timestamp if inv_id exists using mutation
      if (inv_id) {
        await updateTimestamp(inv_id);
      }

      // Format the quantity string for the transaction
      const string_qty =
        formData.cinv_qty_unit === "boxes"
          ? `${formData.cinv_qty} boxes (${formData.cinv_pcs} pcs per box)`
          : `${formData.cinv_qty} ${formData.cinv_qty_unit}`;

      // Step 4: Add commodity transaction
      await addTransaction({
        string_qty,
        staffId: 1,
        cinv_id: initialData.cinv_id,
        action: "Added",
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["commodityinventorylist"],
      });
    },
    onError: (error: Error) => {
      console.error(error.message);
    },
  });
};
