import { api } from "@/pages/api/api";

export const addMedicineInventory = async (
  data: any,  // Consider replacing 'any' with a proper type interface
  inv_id: number
) => {
  try {
    if (!data.medicineID) {
      throw new Error("Medicine ID is required.");
    }

    // Calculate values directly
    const qty = Number(data.qty) || 0;
    const pcs = Number(data.pcs) || 0;
    const minv_qty_avail = data.unit === "boxes" ? qty * pcs : qty;
    const med_id = parseInt(data.medicineID, 10);

    // Make the API call with directly constructed object
    const res = await api.post("inventory/medicineinventorylist/", {
      minv_dsg: Number(data.dosage) || 0,
      minv_dsg_unit: data.dsgUnit,
      minv_form: data.form,
      minv_qty: qty,
      minv_qty_unit: data.unit,
      minv_pcs: pcs,
      minv_distributed: 0,  // Default value as in your payload
      minv_qty_avail: minv_qty_avail,
      med_id,
      cat_id: Number(data.category),
      inv_id,
      // Add any other fields that might be needed
    });

    return res.data;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw to allow calling code to handle the error
  }
};


export const addMedicineTransaction = async (data: any) => {try {
      const res = await api.post("inventory/medicinetransaction/", data);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };
  


  