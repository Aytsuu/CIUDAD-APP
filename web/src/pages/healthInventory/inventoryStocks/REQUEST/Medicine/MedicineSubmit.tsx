import { QueryClient } from "@tanstack/react-query";
import { formatQuantityString } from "../FormatQuantityString";
import {
  addMedicineInventory,
  addMedicineTransaction,
} from "./restful-api/MedicinePost";
import { addInventory } from "../Inventory";
import { getMedicineInventory } from "./restful-api/MedicineGet";
import {
  updateMedicineStocks,
  updateInventoryTimestamp,
} from "./restful-api/MedicinePut";
// ADD MODAL
export const submitMedicineStock = async (data: any,queryClient: QueryClient
) => {
  try {
    const inv_type = "Medicine";
    const inventoryResponse = await addInventory(data, inv_type);

    if (!inventoryResponse?.inv_id) {
      console.error(Error);
    }
    const inv_id = parseInt(inventoryResponse.inv_id, 10);

    if (!data.medicineID) {
      console.error(Error);
    }
    const medicineInventoryResponse = await addMedicineInventory(data, inv_id);
    console.log("Medicine Inventory Response:", medicineInventoryResponse);
    if (!medicineInventoryResponse || medicineInventoryResponse.error) {
      console.error(Error);
    }

    const quantityString = formatQuantityString(data.qty, data.unit, data.pcs);
    const staffid = 1;

    const transactionPayload = {
      mdt_qty: quantityString,
      mdt_action: "Added",
      mdt_staff: staffid,
      minv_id: medicineInventoryResponse.minv_id,
      created_at: new Date().toISOString(),
    };

    await addMedicineTransaction(transactionPayload);

    queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] });
    queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });

    return { success: true };
  } catch (err) {
    console.error(err);
  }
};

// 2. Main business logic function
export const updateMedicineStock = async (initialData: { id: number },data: any,queryClient: QueryClient) => {
  try {
    // Fetch existing medicine data
    const inventoryList = await getMedicineInventory();
    const existingMedicine = inventoryList.find(
      (med: any) => med.minv_id === initialData.id
    );

    if (!existingMedicine) {console.error(Error);}
    // Calculate new quantities
    const currentMinvQtyAvail = existingMedicine.minv_qty_avail;
    let qty = existingMedicine.minv_qty;
    const currentMinvPcs = existingMedicine.minv_pcs;
    const inv_id = existingMedicine.inv_detail?.inv_id;

    let newMinvQtyAvail = currentMinvQtyAvail;

    if (data.minv_qty_unit === "boxes") {
      qty += data.minv_qty;
      newMinvQtyAvail = qty * currentMinvPcs;
    } else {
      qty += data.minv_qty;
      newMinvQtyAvail = qty;
    }

    await updateMedicineStocks(initialData.id, { minv_qty: qty, minv_qty_avail: newMinvQtyAvail,});
    // Update inventory timestamp if exists
    if (inv_id) {await updateInventoryTimestamp(inv_id); }
    // Create and add transaction
    const quantityString = formatQuantityString(
      data.minv_qty,
      data.minv_qty_unit,
      data.minv_pcs
    );

    await addMedicineTransaction({
      mdt_qty: quantityString,
      mdt_action: "Added",
      mdt_staff: 1,
      minv_id: initialData.id,
      created_at: new Date().toISOString(),
    });

    // Invalidate queries
    queryClient.invalidateQueries({ queryKey: ["medicineinventorylist"] });
    queryClient.invalidateQueries({ queryKey: ["medicinetransactions"] });

    return { success: true };
  } catch (error) {
    console.error("Error updating medicine stock:", error);
    throw error;
  }
};
