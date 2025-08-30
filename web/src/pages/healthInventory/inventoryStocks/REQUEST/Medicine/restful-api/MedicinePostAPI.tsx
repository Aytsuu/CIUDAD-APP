import {api2}  from "@/api/api";

export const createMedicineStock  = async (data: Record<string, any>) => {
  try {
    if (!data.medicineID && !data.med_id) {
      throw new Error("Medicine ID is required.");
    }
    
    const response = await api2.post("inventory/medicine_stock-create/", data);
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    return response.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const addMedicineTransaction = async (data: Record<string, any>) => {try {
      const res = await api2.post("inventory/medicinetransaction/", data);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };
  


  