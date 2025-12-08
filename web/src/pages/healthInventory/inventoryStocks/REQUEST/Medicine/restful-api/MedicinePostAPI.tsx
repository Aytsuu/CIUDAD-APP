import {api2}  from "@/api/api";

export const createMedicineStock  = async (data: Record<string, any>) => {
  try {
    if (!data.medicineID && !data.med_id) {
      if (process.env.NODE_ENV === "development") {
        console.error("Medicine ID is required.");
      }
      return null;
    }

    const response = await api2.post("inventory/medicine_stock-create/", data);

    if (response.data.error) {
      if (process.env.NODE_ENV === "development") {
        console.error(response.data.error);
      }
      return null;
    }

    return response.data;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    }
    return null;
  }
};

export const addMedicineTransaction = async (data: Record<string, any>) => {try {
    const res = await api2.post("inventory/medicinetransaction/", data);
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    }
    return null;
  }
}
  

