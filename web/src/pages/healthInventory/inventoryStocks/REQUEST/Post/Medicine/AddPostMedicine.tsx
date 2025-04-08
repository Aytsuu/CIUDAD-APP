import { QueryClient } from "@tanstack/react-query";
import api from "@/pages/api/api";
import { addInventory } from "../Inventory";

export interface MedicineStockType {
  minv_dsg: number;
  minv_dsg_unit: string;
  minv_form: string;
  minv_qty: number;
  minv_qty_unit: string;
  minv_pcs: number;
  minv_distributed: number;
  minv_qty_avail: number;
  inv_id: number;
  med_id: number;
  cat_id: number;
}

export const MedicinePayload = (
  data: any, // Replace with the correct type if available
  inv_id: number
): MedicineStockType => {
  const qty = Number(data.qty) || 0;
  const pcs = Number(data.pcs) || 0;
  const minv_qty_avail = data.unit === "boxes" ? qty * pcs : qty;
  const med_id = parseInt(data.medicineID, 10);
  return {
    minv_dsg: Number(data.dosage) || 0,
    minv_dsg_unit: data.dsgUnit,
    minv_form: data.form,
    minv_qty: minv_qty_avail,
    minv_qty_unit: data.unit,
    minv_pcs: pcs,
    minv_distributed: 0,
    minv_qty_avail,
    med_id,
    cat_id: Number(data.category),
    inv_id,
  };
};

export interface MedicineTransactionType {
  mdt_qty: string;
  mdt_action: string;
  mdt_staff: number;
  minv_id: number;
}

export const InventoryMedicinePayload = (data: any) => {
  return {
    expiry_date: data.expiryDate,
    inv_type: "Medicine",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const addMedicineInventory = async (medicineData: MedicineStockType) => {
  try {
    const res = await api.post(
      "inventory/medicineinventorylist/",
      medicineData
    );
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

// add stocks for medicine
export const addMedicineTransaction = async (
  MedTransactindata: MedicineTransactionType
) => {
  try {
    const res = await api.post(
      "inventory/medicinetransaction/",
      MedTransactindata
    );
    return res.data;
  } catch (err: any) {
    console.log("Error response:", err.response?.data || err.message);
    throw err;
  }
};

export const submitMedicineStock = async (data: any, queryClient: QueryClient) => {
  const inventoryResponse = await addInventory(InventoryMedicinePayload(data));

  if (!inventoryResponse?.inv_id) {
    throw new Error("Failed to generate inventory ID.");
  }
  const inv_id = parseInt(inventoryResponse.inv_id, 10);

  if (!data.medicineID) {
    throw new Error("Medicine ID is required.");
  }

  const medicinePayload = MedicinePayload(data, inv_id);

  await new Promise((resolve) => setTimeout(resolve, 500));
  const medicineInventoryResponse = await addMedicineInventory(medicinePayload);
  if (!medicineInventoryResponse || medicineInventoryResponse.error) {
    throw new Error("Failed to add medicine inventory.");
  }

  const transactionPayload = {
    mdt_qty: data.qty,
    mdt_action: "Add",
    mdt_staff: 1,
    minv_id: medicineInventoryResponse.minv_id,
  };

    await addMedicineTransaction(transactionPayload);

  queryClient.invalidateQueries({ queryKey: ["medicineStocks"] });

  console.log("Medicine Inventory Response:", medicineInventoryResponse);

};
