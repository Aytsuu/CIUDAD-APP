// src/services/medicineRequestService.ts
import { getFirstAidStocks } from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidGetAPI";
import {
  updateFirstAidStock,
  updateInventoryTimestamp,
} from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidPutAPI";
import { addFirstAidTransaction } from "@/pages/healthInventory/inventoryStocks/REQUEST/FirstAid/restful-api/FirstAidPostAPI";
import { createFirstaidRecord } from "../restful-api/postAPI";
import { createPatientRecord } from "@/pages/healthServices/restful-api-patient/createPatientRecord";

export const processFirstRequest = async (data: any): Promise<any[]> => {
  const results: any[] = [];
  
  // Validate required fields
  if (!data.pat_id || !data.firstaid || !Array.isArray(data.firstaid)) {
    throw new Error("Invalid request data: missing patient ID or firstaid items");
  }

  // Process each first aid item
  for (const fa of data.firstaid) {
    try {
      if (!fa.finv_id || fa.qty === undefined) {
        throw new Error(`Invalid firstaid item: missing finv_id or quantity`);
      }

      // Create patient record for this item
      const patientRecord = await createPatientRecord({
        pat_id: data.pat_id,
        patrec_type: "First Aid Record",
        staff: data.staff_id || null,
      });


      // Get inventory and verify item exists
      const inventoryList = await getFirstAidStocks();
      const existingFirstaid = inventoryList.find(
        (item: any) => parseInt(item.finv_id, 10) === parseInt(fa.finv_id, 10)
      );

      if (!existingFirstaid) {
        throw new Error(`FirstAid ID ${fa.finv_id} not found in inventory`);
      }

      // Prepare common record data including signature
      const baseRecordData = {
        patrec: patientRecord.patrec_id,
        finv: fa.finv_id,
        reason: fa.reason || null,
        created_at: new Date().toISOString(),
        signature: data.signature || null, // Include signature in all cases
      };

      // Handle unit conversion
      let unit = existingFirstaid.finv_qty_unit;
      if (unit === "boxes") {
        unit = "pc/s";
      }

      // Handle zero quantity case
      if (fa.qty === 0) {
        const response = await createFirstaidRecord({
          ...baseRecordData,
          qty: `0 ${unit}`,
        });
        results.push({
          success: true,
          data: {
            ...response.data,
            message: `Recorded zero quantity item (FirstAid ID: ${fa.finv_id})`,
          },
        });
        continue;
      }

      // Check stock for non-zero quantities
      if (existingFirstaid.finv_qty_avail < fa.qty) {
        throw new Error(`Insufficient stock for FirstAid ID ${fa.finv_id}`);
      }

      // Update stock
      await updateFirstAidStock(parseInt(fa.finv_id, 10), {
        finv_qty_avail: existingFirstaid.finv_qty_avail - fa.qty,
      });

      // Update inventory timestamp if available
      const inv_id = existingFirstaid.inv_detail?.inv_id;
      if (inv_id) {
        await updateInventoryTimestamp(inv_id);
      }

      // Record transaction
      await addFirstAidTransaction({
        finv_id: parseInt(fa.finv_id, 10),
        fat_qty: `${fa.qty} ${unit}`,
        fat_action: "Deducted (FirstAid Request)",
        staff: data.staff_id || null,
      });

      // Create final record
      const response = await createFirstaidRecord({
        ...baseRecordData,
        qty: `${fa.qty} ${unit}`,
      });

      results.push({ 
        success: true, 
        data: response.data 
      });
    } catch (error) {
      results.push({
        success: false,
        firstaidID: fa.finv_id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw new Error(`Failed to process FirstAid ID ${fa.finv_id}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }
  
  return results;
};