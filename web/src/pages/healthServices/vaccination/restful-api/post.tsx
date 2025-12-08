import { api2 } from "@/api/api";

export const createVaccinationHistory = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("vaccination/vaccination-history/", data);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating vaccination history:", error);
    }
  }
};

export const createVitalSigns = async (data: Record<string, any>) => {
  try {
    const response = await api2.post("patientrecords/vital-signs/", data);
    if (process.env.NODE_ENV === "development") {
      console.log("Vital sign created", response.data);
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }
};

export const createFollowUpVisit = async (patrec_id: string, followv_date: string, followv_description: string, followv_status: "pending" | "completed" | "missed") => {
  try {
    const response = await api2.post("patientrecords/follow-up-visit/", {
      followv_date,
      patrec: parseInt(patrec_id, 10),
      followv_status: followv_status || "pending",
      followv_description,
      created_at: new Date().toISOString(),
    });
    if (process.env.NODE_ENV === "development") {
      console.log("Parsed patrec_id:", parseInt(patrec_id, 10));
    }
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error creating follow-up visit:", error);
    }
  }
};

export const createAntigenStockTransaction = async (vacStck_id: number, staff_id: string, qty: string = "1 dose", action: string = "Administered") => {
  const transactionPayload = {
    antt_qty: qty,
    antt_action: action,
    staff: staff_id,
    vacStck_id: vacStck_id,
  };

  try {
    const response = await api2.post("inventory/antigens_stocks/transaction/", transactionPayload);
    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error occurred while creating antigen stock transaction:", error);
    }
  }
};
