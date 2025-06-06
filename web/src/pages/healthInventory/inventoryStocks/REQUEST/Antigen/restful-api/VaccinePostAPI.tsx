import {api} from "@/pages/api/api";

 
export const addVaccineStock = async (data: Record<string,any>, vac_id: number, inv_id: number) => {
  // Calculate available quantity based on solvent type
  const availqty = data.solvent === 'doses' 
    ? data.qty * (data.volume || 0) 
    : data.qty;

  try {
    const payload = {
      inv_id: inv_id,
      vac_id: vac_id,
      batch_number: data.batchNumber,
      solvent: data.solvent,
      volume: data.volume || 0,
      qty: data.qty,
      dose_ml: data.volume || 0,
      vacStck_qty_avail: availqty,  // Use the calculated available quantity
      wasted_dose: 0,  // Initialize wasted doses to 0
      expiry_date: data.expiryDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const res = await api.post("inventory/vaccine_stocks/", payload);
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};


export const AntigenTransaction = async ( vacStck_id: number, string_qty: string, action: string, staffId: number) => {
  try {
    const res = await api.post("inventory/antigens_stocks/", {
    antt_qty: string_qty,
    antt_action: action,
    vacStck_id: vacStck_id,
      staff: staffId,
    });
    return res.data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

