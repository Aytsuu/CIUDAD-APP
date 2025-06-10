import {api}  from "@/pages/api/api";

export const addMedicineInventory = async (data: Record<string, any>, inv_id: number) => {
  try {
    if (!data.medicineID) {
      throw new Error("Medicine ID is required.");
    }
    
    const qty = Number(data.qty) || 0;
    const pcs = Number(data.pcs) || 0;
    const minv_qty_avail = data.unit === "boxes" ? qty * pcs : qty;

    const res = await api.post("inventory/medicineinventorylist/", {
      minv_dsg: Number(data.dosage) || 0,
      minv_dsg_unit: data.dsgUnit,
      minv_form: data.form,
      minv_qty: qty,
      minv_qty_unit: data.unit,
      minv_pcs: pcs,
      minv_distributed: 0, 
      minv_qty_avail: minv_qty_avail,
      med_id:data.medicineID,
      inv_id,
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err: any) {
    let errorMessage = "Failed to add medicine inventory";
    if (err.response?.data) {
      // Handle the specific 400 error you're seeing
      if (err.response.data.med_id) {
        errorMessage = "Medicine ID is required";
      } else if (err.response.data.cat_id) {
        errorMessage = "Category is required";
      } else {
        errorMessage = JSON.stringify(err.response.data);
      }
    } else if (err.message) {
      errorMessage = err.message;
    }
    throw new Error(errorMessage);
  }
};


export const addMedicineTransaction = async (data: Record<string, any>) => {try {
      const res = await api.post("inventory/medicinetransaction/", data);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };
  


  