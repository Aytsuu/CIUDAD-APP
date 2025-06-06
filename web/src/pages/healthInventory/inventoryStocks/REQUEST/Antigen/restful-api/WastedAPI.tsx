import { api } from "@/api/api";


export const getVaccineStock = async () => {
  try {
    const res = await api.get("inventory/vaccine_stocks/");
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    return res.data;
  } catch (err) {
    console.error("Error fetching vaccine stock:", err);
    throw err;
  }
};

export const updateVaccineStock = async (
  vacStck_id: number,
  wasted_dose: number,
  vacStck_qty_avail: number,
  vacStck_used: number
) => {
  try {
    if (!vacStck_id) {
      throw new Error("Vaccine stock ID is required.");
    }

    const res = await api.put(`inventory/vaccine_stocks/${vacStck_id}/`, {
      wasted_dose,
      vacStck_qty_avail,
      vacStck_used,
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error("Error updating vaccine stock:", err);
    throw err;
  }
};

export const addVaccineTransaction = async (
  antt_qty: string,
  staffId: number,
  vacStck_id: number
) => {
  try {
    if (!vacStck_id) {
      throw new Error("Vaccine stock ID is required.");
    }

    const res = await api.post("inventory/antigens_stocks/", {
      antt_qty,
      antt_action: "Wasted",
      staff: staffId,
      vacStck_id,
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error("Error creating vaccine transaction:", err);
    throw err;
  }
};




export const updateSupplyStock = async (
  imzStck_id: number,
  wasted_items: number,
  imzStck_avail: number,
  imzStck_pcs?: number
) => {
  try {
    if (!imzStck_id) {
      throw new Error("Supply stock ID is required.");
    }

    const payload: any = {
      wasted_items,
      imzStck_avail,
    };

    if (imzStck_pcs !== undefined) {
      payload.imzStck_pcs = imzStck_pcs;
    }

    const res = await api.put(`inventory/immunization_stock/${imzStck_id}/`, payload);

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error("Error updating supply stock:", err);
    throw err;
  }
};

export const addSupplyTransaction = async (
  imzt_qty: string,
  staffId: number,
  imzStck_id: number
) => {
  try {
    if (!imzStck_id) {
      throw new Error("Supply stock ID is required.");
    }

    const res = await api.post("inventory/imz_transaction/", {
      imzt_qty,
      imzt_action: "Wasted",
      staff: staffId,
      imzStck_id,
    });

    if (res.data.error) {
      throw new Error(res.data.error);
    }

    return res.data;
  } catch (err) {
    console.error("Error creating supply transaction:", err);
    throw err;
  }
};