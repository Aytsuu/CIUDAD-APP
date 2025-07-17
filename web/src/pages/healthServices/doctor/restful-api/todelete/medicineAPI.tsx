import { MedicineRequestArrayType } from "@/form-schema/medicineRequest";
import { api2 } from "@/api/api";

// export const createMedicineRequest  = async (data: {
//   pat_id?: string;
//   medicines: Array<{
//     minv_id: string;
//     medrec_qty: number;
//     reason?: string;
//   }>;
// }) => {
//   try {
//     // Validate at least one ID is provided
//     if (!data.pat_id) {
//       throw new Error("Either patient ID or resident ID must be provided");
//     }

//     // Validate medicines exist
//     if (!data.medicines || data.medicines.length === 0) {
//       throw new Error("At least one medicine is required");
//     }

//     const response = await api2.post("medicine/medicine-request/", {
//       pat_id: data.pat_id,
//       rp_id: null,
//       medicines: data.medicines.map((med) => ({
//         minv_id: med.minv_id,
//         medreqitem_qty: med.medrec_qty,
//         reason: med.reason || "No reason provided",
//       })),
//     });

//     return response.data;
//   } catch (error) {
//     console.error("Detailed error:", {
//       message: (error as any).message,
//       response: (error as any).response?.data,
//       config: (error as any).config,
//     });
//     throw error;
//   }
// };



// export const deleteMedicineRequest = async (medRequestId: number) => {
//   try {
//     await api2.delete(`medicine/medicine-request/${medRequestId}/`);
//   } catch (error) {
//     console.error("Error deleting medicine request:", error);
//     throw error;
//   }
// };
