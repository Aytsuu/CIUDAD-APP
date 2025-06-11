// updateCommodityStock.ts
import { api } from "@/pages/api/api";
import { CommodityStocksRecord } from "../../../tables/CommodityStocks";
import { CommodityTransactionPayload } from "./AddCommodityPost";
import { addCommodityTransaction } from  "./AddCommodityPost";
import { QueryClient } from "@tanstack/react-query";

export const updateCommodityStock = async (formData: any,initialData: CommodityStocksRecord,queryClient: QueryClient) => {
  const res = await api.get(`inventory/commodityinventorylist/`);
  const existingCommodity = res.data.find(
    (item: any) => item.cinv_id === initialData.cinv_id
  );

  if (!existingCommodity) {
    throw new Error("Commodity ID not found. Please check the ID.");
  }

  const currentQtyAvail = existingCommodity.cinv_qty_avail;
  let qty = existingCommodity.cinv_qty;
  const currentPcs = existingCommodity.cinv_pcs;
  const inv_id = existingCommodity.inv_detail?.inv_id;

  if (
    formData.cinv_qty_unit === "boxes" &&
    Number(currentPcs) !== Number(formData.cinv_pcs)
  ) {
    throw new Error(`Pieces per box must match the existing stock (${currentPcs}).`);
  }

  let newQtyAvail = currentQtyAvail;

  if (formData.cinv_qty_unit === "boxes") {
    qty += formData.cinv_qty;
    newQtyAvail = qty * currentPcs;
  } else {
    qty += formData.cinv_qty;
    newQtyAvail = qty;
  }

  await api.put(
    `inventory/update_commoditystocks/${initialData.cinv_id}/`,
    {
      cinv_qty: qty,
      cinv_qty_avail: newQtyAvail,
      
    }
  );
  
  if (inv_id) {
    await api.put(`inventory/update_inventorylist/${inv_id}/`, {
      updated_at: new Date().toISOString(),
    });
  }

  const string_qty =
    formData.cinv_qty_unit === "boxes"
      ? `${formData.cinv_qty} boxes (${formData.cinv_pcs} pcs per box)`
      : `${formData.cinv_qty} ${formData.cinv_qty_unit}`;

  const action = "Added";
  const commodityTransactionPayload = CommodityTransactionPayload(
    initialData.cinv_id,
    string_qty,
    action
  );
  
  await addCommodityTransaction(commodityTransactionPayload);
    // Invalidate queries to refresh the data
    await queryClient.invalidateQueries({
        queryKey: ["commodityinventorylist"],
      });
  
  return { success: true };
};