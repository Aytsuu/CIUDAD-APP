// src/services/medicineRequestService.ts
import { api } from "@/api/api";
import axios from "axios";
import { getFirstAidStocks } from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidGetAPI";
import {
  updateFirstAidStock,
  updateInventoryTimestamp,
} from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidPutAPI";
import { addFirstAidTransaction } from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidPostAPI";
import { createFirstaidRecord } from "../restful-api/postAPI";
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";

export interface FirstaidRequest {
  pat_id: string;
  firstaid: {
    finv_id: string;
    qty: number;
    reason: string;
  }[];
}

interface PatientRecord {
  patrec_id: string;
}

interface InventoryItem {
  finv_id: string;
  finv_qty_avail: number;
  finv_qty_unit: string;
  inv_detail?: {
    inv_id: string;
  };
}

interface SubmissionData {
  patrec: string;
  finv: string;
  qty: string;
  reason: string | null;
  created_at: string;
}

interface ProcessResult {
  success: boolean;
  data?: any;
  firstaidID?: string;
  error?: string;
}
export const processFirstRequest = async (
  data: FirstaidRequest,
  staff_id: string
): Promise<ProcessResult[]> => {
  const results: ProcessResult[] = [];

  try {
    // Create patient record once for the entire request
    let patientRecord: PatientRecord;
    try {
      patientRecord = await createPatientRecord(
        data.pat_id,
        "First Aid Record"
      );
      
      if (!patientRecord?.patrec_id) {
        throw new Error("Failed to create patient record: No patrec_id returned");
      }
    } catch (error) {
      console.error("Patient record creation failed:", error);
      throw new Error(`Failed to create patient record: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    // Process each first aid item
    for (const fa of data.firstaid) {
      try {
        if (fa.qty === 0) {
          // Create record for zero quantity items
          const submissionData: SubmissionData = {
            patrec: patientRecord.patrec_id,
            finv: fa.finv_id,
            qty: `0 pc/s`,
            reason: fa.reason || null,
            created_at: new Date().toISOString(),
          };

          const response = await createFirstaidRecord(submissionData);
          results.push({
            success: true,
            data: {
              ...response.data,
              message: `Recorded zero quantity item (FirstAid ID: ${fa.finv_id})`,
            },
          });
          continue;
        }

        // Process non-zero quantity items
        const inventoryList: InventoryItem[] = await getFirstAidStocks();
        const existingFirstaid = inventoryList.find(
          (firstaid: InventoryItem) =>
            parseInt(firstaid.finv_id, 10) === parseInt(fa.finv_id, 10)
        );

        if (!existingFirstaid) {
          throw new Error(`FirstAid ID ${fa.finv_id} not found in inventory`);
        }

        if (existingFirstaid.finv_qty_avail < fa.qty) {
          throw new Error(`Insufficient stock for FirstAid ID ${fa.finv_id}`);
        }

        const inv_id = existingFirstaid.inv_detail?.inv_id;
        const newQty = existingFirstaid.finv_qty_avail - fa.qty;
        let unit = existingFirstaid.finv_qty_unit;
        if (unit === "boxes") {
          unit = "pc/s";
        }

        await updateFirstAidStock(parseInt(fa.finv_id, 10), {
          finv_qty_avail: newQty,
        });

        if (inv_id) {
          await updateInventoryTimestamp(inv_id);
        }

        const fat_qty = `${fa.qty} ${unit}`;
        const fat_action = "Deducted (FirstAid Request)";
        const fat_staff = staff_id;

        await addFirstAidTransaction(
          parseInt(fa.finv_id, 10),
          fat_qty,
          fat_action,
          fat_staff
        );

        const submissionData: SubmissionData = {
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
        throw error;
      }
    }
  } catch (error) {
    console.error("Error in processFirstRequest:", error);
    throw error;
  }

  return results;
};