import { api2 } from "@/api/api"
import {
  updateMedicineStocks,
  updateInventoryTimestamp,
} from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePutAPI"
import { addMedicineTransaction } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicinePostAPI"
import { getMedicineInventory } from "@/pages/healthInventory/inventoryStocks/REQUEST/Medicine/restful-api/MedicineGetAPI" // Assuming this path is correct
import { createPatientRecord, createMedicineRecord } from "../../../medicineservices/restful-api/postAPI" // Assuming this path is correct

// --- Medicine Record Operations ---



// export async function deleteMedicineRecord(medrecId: string) {
//   try {
//     await api2.delete(`/healthservices/medicine-record/${medrecId}/`)
//     console.log("Medicine record deleted.")
//   } catch (error) {
//     console.error("Error deleting medicine record:", error)
//     throw new Error(`Failed to delete medicine record: ${error instanceof Error ? error.message : "Unknown error"}`)
//   }
// }

// --- Combined Medicine Transaction and Inventory Update ---

export async function processMedicineTransaction(
  med: { minv_id: string; medrec_qty: number; reason: string | null },
  patId: string,
  patrecId: string,
  staffId: string | null,
  chhistId: string,
) {
  try {
    // 1. Create MedicineRecord
    const submissionData = {
      pat_id: patId,
      patrec_id: patrecId,
      minv_id: med.minv_id,
      medrec_qty: med.medrec_qty,
      reason: med.reason || null,
      requested_at: new Date().toISOString(),
      fulfilled_at: new Date().toISOString(),
      medreq_id: null,
    }
    const medRecordResponse = await createMedicineRecord(submissionData)
    const medrecId = medRecordResponse.medrec_id

    // 2. Verify medicine exists and check stock availability
    const inventoryList = await getMedicineInventory()
    const existingMedicine = inventoryList.find(
      (medicine: any) => Number.parseInt(medicine.minv_id, 10) === Number.parseInt(med.minv_id, 10),
    )
    if (!existingMedicine) {
      throw new Error(`Medicine ID ${med.minv_id} not found in inventory`)
    }
    if (existingMedicine.minv_qty_avail < med.medrec_qty) {
      throw new Error(`Insufficient stock for medicine ID ${med.minv_id}`)
    }

    // 3. Update stock
    const inv_id = existingMedicine.inv_detail?.inv_id
    const newQty = existingMedicine.minv_qty_avail - med.medrec_qty
    let unit = existingMedicine.minv_qty_unit
    if (unit === "boxes") unit = "pc/s"

    await updateMedicineStocks(Number.parseInt(med.minv_id, 10), { minv_qty_avail: newQty })
    if (inv_id) await updateInventoryTimestamp(inv_id)

    // 4. Add Medicine Transaction
    const transactionPayload = {
      mdt_qty: `${med.medrec_qty} ${unit}`,
      mdt_action: "Deducted (Medicine Child)",
      mdt_staff: staffId || null,
      minv_id: Number.parseInt(med.minv_id, 10),
    }
    await addMedicineTransaction(transactionPayload)

    // 5. Create ChildHealthSupplements record
    const chsupplementPayload = {
      chhist: chhistId,
      medrec: medrecId,
    }
    const chsupplementRes = await api2.post("child-health/supplements/", chsupplementPayload)
    if (!chsupplementRes.data.chsupplement_id) {
      throw new Error("Failed to create supplement record for medicine: No ID returned")
    }
    console.log(`Supplement record created for medicine ${med.minv_id}:`, chsupplementRes.data)

    return { medrecId, chsupplementId: chsupplementRes.data.chsupplement_id }
  } catch (error) {
    console.error(`Error processing medicine transaction for ${med.minv_id}:`, error)
    throw new Error(
      `Failed to process medicine transaction for ${med.minv_id}: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}
