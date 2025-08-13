// src/services/firstAid/hooks/useFirstAidMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFirstAidTransaction } from "../restful-api/FirstAidPostAPI";
import { getFirstAidInventoryList } from "../restful-api/FirstAidGetAPI";
import {
  updateFirstAidStock,
  updateInventoryTimestamp,
} from "../restful-api/FirstAidPutAPI";
import { formatQuantityString } from "../../FormatQuantityString";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { useNavigate } from "react-router";

export const useEditFirstAidStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({
      data,
      finv_id,
    }: {
      data: Record<string, any>;
      finv_id: number;
    }) => {
      // First, fetch the current inventory list
      const inventoryList = await getFirstAidInventoryList();
      // Find the existing item with proper null checks
      const existingItem = inventoryList.find(
        (item: any) => item?.finv_id?.toString() === finv_id.toString()
      );

      if (!existingItem) {
        throw new Error("First aid item not found. Please check the ID.");
      }

      const currentQtyAvail = existingItem.finv_qty_avail || 0;
      let qty = existingItem.finv_qty || 0;
      const currentPcs = existingItem.finv_pcs || 0;
      const inv_id = existingItem.inv_detail?.inv_id;

      // Validate pieces per box if dealing with boxes
      if (
        data.finv_qty_unit === "boxes" &&
        Number(currentPcs) !== Number(data.finv_pcs)
      ) {
        throw new Error(
          `Pieces per box must match the existing stock (${currentPcs}).`
        );
      }

      let newQtyAvail = currentQtyAvail;

      // Calculate new quantities
      if (data.finv_qty_unit === "boxes") {
        qty += Number(data.finv_qty) || 0;
        newQtyAvail = qty * currentPcs;
      } else {
        qty += Number(data.finv_qty) || 0;
        newQtyAvail = qty;
      }

      // Update the stock
      await updateFirstAidStock(finv_id, {
        finv_qty: qty,
        finv_qty_avail: newQtyAvail,
      });

      if (inv_id) {
        await updateInventoryTimestamp(inv_id);
      }

      const quantityString = formatQuantityString(
        data.finv_qty,
        data.finv_qty_unit,
        data.finv_pcs
      );
      const staffId = 1; // Replace with actual staff ID from your auth system
      await addFirstAidTransaction(finv_id, quantityString, "Added", staffId);
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });

      return;
    },

    onSuccess: () => {
      navigate(-1);
      toast.success("Added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to add";
      toast.error(message, {
        icon: <CircleCheck size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
      });
    },
  });
};

export const useDeductFirstAidStock = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async ({
      data,
      values,
      displayUnit,
    }: {
      data: Record<string, any>;
      values: { usedItem: number };
      displayUnit: string;
    }) => {
      // First, fetch the current inventory list
      const inventoryList = await getFirstAidInventoryList();

      // Find the existing item with proper null checks
      const existingItem = inventoryList.find(
        (item: any) => item?.finv_id?.toString() === data.finv_id.toString()
      );

      if (!existingItem) {
        throw new Error("First aid item not found. Please check the ID.");
      }

      const currentQtyAvail = existingItem.finv_qty_avail;
      const existingUsedItem = existingItem.finv_used;
      let newUsedItem = 0;
      let newQty = 0;

      if (currentQtyAvail == 0) {
        throw new Error("Current quantity available is 0.");
      } else if (values.usedItem > currentQtyAvail) {
        throw new Error("Cannot use more items than available.");
      } else {
        newQty = currentQtyAvail - values.usedItem;
        newUsedItem = existingUsedItem + values.usedItem;
      }

      // Update the stock with proper payload structure
      const updatePayload = {
        finv_qty_avail: newQty,
        finv_used: newUsedItem,
        finv_name: existingItem.finv_name,
        finv_qty_unit: existingItem.finv_qty_unit,
      };

      await updateFirstAidStock(data.finv_id, updatePayload);

      // Update inventory timestamp if inv_id exists
      if (data.inv_id) {
        await updateInventoryTimestamp(data.inv_id);
      }

      // TRANSACTION
      const staffId = 1;
      const string_qty = `${values.usedItem} ${displayUnit}`;
      await addFirstAidTransaction(
        data.finv_id,
        string_qty,
        "Deducted",
        staffId
      );
      queryClient.invalidateQueries({ queryKey: ["firstaidinventorylist"] });
      queryClient.invalidateQueries({ queryKey: ["firstaidtransactions"] });
  
      return ;
    },
    onSuccess: () => {
      navigate(-1);
      toast.success("Deducted successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        duration: 2000,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || "Failed to deduct";
      toast.error(message, {
        icon: <CircleCheck size={24} className="fill-red-500 stroke-white" />,
        duration: 2000,
      });
    },
  });
};
