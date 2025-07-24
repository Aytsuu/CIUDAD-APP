// src/services/medicineRequestService.ts
import { api } from "@/api/api";
import axios from "axios";
import { getMedicineInventory } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicineGetAPI";
import {
  updateMedicineStocks,
  updateInventoryTimestamp,
} from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePutAPI";
import { addMedicineTransaction } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePostAPI";
import {
  createMedicineRecord,
  createPatientRecord,
} from "../restful-api/postAPI";

export interface MedicineRequestData {
  pat_id: string;
  medicines: {
    minv_id: string;
    medrec_qty: number;
    reason: string;
  }[];
}


export const processMedicineRequest = async (data: MedicineRequestData) => {
  const results = [];

  for (const med of data.medicines) {
    try {
      // 1. Create patient record
      const patientRecord = await createPatientRecord(data.pat_id);
      if (!patientRecord?.patrec_id) {
        throw new Error(
          "Failed to create patient record: No patrec_id returned"
        );
      }

      // 2. Verify medicine exists
      const inventoryList = await getMedicineInventory();
      const existingMedicine = inventoryList.find(
        (medicine: any) =>
          parseInt(medicine.minv_id, 10) === parseInt(med.minv_id, 10)
      );

      if (!existingMedicine) {
        throw new Error(`Medicine ID ${med.minv_id} not found in inventory`);
      }

      // 3. Check stock availability
      if (existingMedicine.minv_qty_avail < med.medrec_qty) {
        throw new Error(`Insufficient stock for medicine ID ${med.minv_id}`);
      }

      // 4. Update stock
      const inv_id = existingMedicine.inv_detail?.inv_id;
      const newQty = existingMedicine.minv_qty_avail - med.medrec_qty;
      let unit = existingMedicine.minv_qty_unit;
      if (unit === "boxes") {
        unit = "pc/s";
      }

      await updateMedicineStocks(parseInt(med.minv_id, 10), {
        minv_qty_avail: newQty,
      });

      // Update inventory timestamp if exists
      if (inv_id) {
        await updateInventoryTimestamp(inv_id);
      }

      const transactionPayload = {
        mdt_qty: `${med.medrec_qty} ${unit}`,
        mdt_action: "Deducted (Medicine Request)",
        mdt_staff: 1, // You might want to get this from auth/session
        minv_id: parseInt(med.minv_id, 10),
      };

      await addMedicineTransaction(transactionPayload);

      // 5. Create medicine record
      const submissionData = {
        pat_id: data.pat_id,
        patrec_id: patientRecord.patrec_id,
        minv_id: med.minv_id,
        medrec_qty: med.medrec_qty,
        reason: med.reason || null,
        requested_at: new Date().toISOString(),
        fulfilled_at: new Date().toISOString(),
        // req_type: "WALK IN",
        // status: "RECORDED",
      };

      const response = await createMedicineRecord(submissionData);
      results.push({ success: true, data: response.data });
    } catch (error) {
      results.push({
        success: false,
        medicineId: med.minv_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error; // Re-throw to exit the loop
    }
  }

  return results;
};
