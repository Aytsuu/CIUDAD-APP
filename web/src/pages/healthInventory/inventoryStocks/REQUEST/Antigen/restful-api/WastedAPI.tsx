import { api2 } from "@/api/api";

export const fetchVaccineStockById = async (vacStck_id: number) => {
  const response = await api2.get(`inventory/vaccine_stocks/${vacStck_id}/`);
  return response.data;
};

export const fetchImzSupplyStockById = async (imzStck_id: number) => {
  const response = await api2.get(
    `inventory/immunization_stock/${imzStck_id}/`
  );
  return response.data;
};



export const createVaccineWasteTransaction = async (
  data: Record<string, any>
) => {
  try {
    const res = await api2.post("inventory/antigens_stocks/transaction/", data);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const updateImmunizationStockQuantity = async (
  data: Record<string, any>
) => {
 

  const response = await api2.put(
    `inventory/immunization_stock/${data.imzStck_id}/`,
    data
  );
  return response.data;
};


export const createImmunizationWasteTransaction = async (
  data: Record<string, any>
) => {
  

  const response = await api2.post("inventory/imz_transaction/", data);
  return response.data;
};
