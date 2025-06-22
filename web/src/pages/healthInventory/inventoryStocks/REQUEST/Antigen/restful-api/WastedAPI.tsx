import { api2 } from "@/api/api";

export const fetchVaccineStockById = async (vacStck_id: number) => {
  const response = await api2.get(`inventory/vaccine_stocks/${vacStck_id}/`);
  return response.data;
};


export const fetchImzSupplyStockById = async (imzStck_id: number) => {
  const response = await api2.get(`inventory/immunization_stock/${imzStck_id}/`);
  return response.data;
};

export const updateVaccineStockQuantity = async (
  vacStck_id: number,
  wasted_dose: number,
  vacStck_qty_avail: number,
  // vacStck_used: number
) => {
  const payload = {
    wasted_dose,
    vacStck_qty_avail,
    // vacStck_used,
    updated_at: new Date().toISOString()
  };

  const response = await api2.put(
    `inventory/vaccine_stocks/${vacStck_id}/`,
    payload
  );
  return response.data;
};

export const createVaccineWasteTransaction = async (
  vacStck_id: number,
  wastedAmount: number,
  unit: 'doses' | 'containers'
) => {
  try {
    const res = await api2.post("inventory/antigens_stocks/transaction/", {
    antt_qty: `${wastedAmount} ${unit}`,
    antt_action: "Wasted",
    vacStck_id: vacStck_id,
      staff: 0,
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};







export const updateImmunizationStockQuantity = async (
  imzStck_id: number,
  wasted_items: number,
  imzStck_avail: number,
) => {
  const payload: {
    wasted_items: number;
    imzStck_avail: number;
    updated_at: string;
  } = {
    wasted_items,
    imzStck_avail,
    updated_at: new Date().toISOString()
  };

  

  const response = await api2.put(
    `inventory/immunization_stock/${imzStck_id}/`,
    payload
  );
  return response.data;
};


export const createImmunizationWasteTransaction = async (
  imzStck_id: number,
  wastedAmount: number,
  unit: 'pcs' | 'boxes'
) => {
  const payload = {
    imzt_qty: `${wastedAmount} ${unit}`,
    imzt_action: "Wasted",
    staff: 0, // Assuming staff ID 0 for system-generated transactions
    imzStck_id,
    created_at: new Date().toISOString()
  };

  const response = await api2.post("inventory/imz_transaction/", payload);
  return response.data;
};