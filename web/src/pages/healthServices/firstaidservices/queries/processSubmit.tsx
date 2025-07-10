// src/services/medicineRequestService.ts
import { api } from "@/api/api";
import axios from "axios";
import { getFirstAidStocks } from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidGetAPI";
import {
  updateFirstAidStock,
  updateInventoryTimestamp,
} from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidPutAPI";
import { addFirstAidTransaction } from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidPostAPI";
import {
  createFirstaidRecord,
} from "../restful-api/postAPI";
import {createPatientRecord} from  "@/pages/healthServices/restful-api-patient/createPatientRecord"

export interface FirstaidRequest {
  pat_id: string;
  firstaid: {
    finv_id: string;
    qty: number;
    reason: string;
  }[];
}

export const processFirstRequest = async (data: FirstaidRequest) => {
  const results = [];

  for (const fa of data.firstaid) {
    try {
      // 1. Create patient record
      const patientRecord = await createPatientRecord(data.pat_id,"First Aid Record");
      if (!patientRecord?.patrec_id) {
        throw new Error(
          "Failed to create patient record: No patrec_id returned"
        );
      }

      // 2. Verify medicine exists
      const inventoryList = await getFirstAidStocks();
      const existingFirstaid = inventoryList.find(
        (firstaid: any) =>
          parseInt(firstaid.finv_id, 10) === parseInt(fa.finv_id, 10)
      );

      if (!existingFirstaid) {
        throw new Error(`Medicine ID ${fa.finv_id} not found in inventory`);
      }

      // 3. Check stock availability
      if (existingFirstaid.finv_qty_avail < fa.qty) {
        throw new Error(`Insufficient stock for medicine ID ${fa.finv_id}`);
      }

      // 4. Update stock
      const inv_id = existingFirstaid.inv_detail?.inv_id;
      const newQty = existingFirstaid.finv_qty_avail - fa.qty;
      let unit = existingFirstaid.finv_qty_unit;
      if (unit === "boxes") {
        unit = "pc/s";
      }

      await updateFirstAidStock(parseInt(fa.finv_id, 10), {
        finv_qty_avail: newQty,
      });

      // Update inventory timestamp if exists
      if (inv_id) {
        await updateInventoryTimestamp(inv_id);
      }

      const fat_qty = `${fa.qty} ${unit}`;
      const fat_action = "Deducted (FirstAid Request)";
      const fat_staff = 1; // TODO: Replace with getStaffIdFromSession()

      await addFirstAidTransaction(
        parseInt(fa.finv_id, 10),
        fat_qty,
        fat_action,
        fat_staff
      );
      // await addFirstAidTransaction(transactionPayload);

      // 5. Create medicine record
      const submissionData = {
        patrec: patientRecord.patrec_id,
        finv: fa.finv_id,
        qty: `${fa.qty} ${unit}`,
        reason: fa.reason || null,
        created_at: new Date().toISOString(),
       
      };

      const response = await createFirstaidRecord(submissionData);
      results.push({ success: true, data: response.data });
    } catch (error) {
      results.push({
        success: false,
        firstaidID: fa.finv_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error; // Re-throw to exit the loop
    }
  }

  return results;
};
