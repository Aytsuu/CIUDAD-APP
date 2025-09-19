import { api2 } from "@/api/api";

export const updateCHHistory = async (data: Record<string, any>) => {
  try {
    const response = await api2.patch(`/child-health/update/history/${data.chhist_id}/`, {
      status: data.status
    });
    console.log("Child health history updated:", response.data);
    return response.data;
  } catch (error) {
    console.error("Failed to update child health history:", error);
    throw new Error(`Failed to update child health history: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};


export async function updateSupplementStatus(
  updates: Array<{
    chssupplementstat_id: number;
    date_completed: string | null;
  }>
): Promise<any[]> {
  try {
    const response = await api2.patch(
      "/child-health/update-supplement-status/",
      updates.map((update) => ({
        chssupplementstat_id: update.chssupplementstat_id,
        date_completed: update.date_completed,
        updated_at: new Date().toISOString()
      }))
    );

    console.log("Supplement status updates successful:", {
      count: updates.length,
      response: response.data
    });

    return response.data;
  } catch (error) {
    console.error("Failed to update supplement statuses:", {
      error: error instanceof Error ? error.message : "Unknown error",
      attemptedUpdates: updates
    });
    throw error;
  }


}


// export async function updatePatientRecord(
//   patrecId: string,
//   payload: Partial<{
//     patrec_type: string;
//     pat_id: string;
//     updated_at: string;
//   }>
// ) {
//   try {
//     const response = await api2.patch(`/patientrecords/patient-record/${patrecId}/`, payload);
//     console.log("Patient record (patrec) updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Error updating patient record (patrec):", error);
//     throw new Error(`Failed to update patient record: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }

// // --- Transient Patient Operations ---

// export async function updateTransientPatient(
//   transId: string,
//   payload: Partial<{
//     mother_fname: string | null;
//     mother_lname: string | null;
//     mother_mname: string | null;
//     mother_age: string | null;
//     mother_dob: string | null;
//     father_fname: string | null;
//     father_lname: string | null;
//     father_mname: string | null;
//     father_age: string | null;
//     father_dob: string | null;
//     updated_at: string;
//   }>
// ) {
//   try {
//     const response = await api2.patch(`patientrecords/update-transient/${transId}/`, payload);
//     if (response.status !== 200) {
//       throw new Error("Failed to update transient information");
//     }
//     console.log("Transient updated successfully:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Transient update error:", error);
//     throw new Error(`Failed to update transient: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }


// }
// export async function updateChildHealthNotes(
//   chnotesId: string,
//   payload: Partial<{
//     chn_notes: string;
//     updated_at: string;
//     followv: string | null;
//     staff: string | null;
//   }>
// ) {
//   try {
//     const response = await api2.patch(`/child-health/notes/${chnotesId}/`, payload);
//     console.log("Child health notes updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Child health notes update error:", error);
//     throw new Error(`Failed to update child health notes: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }

// export async function updateChildVitalSign(
//   chvitalId: string,
//   payload: Partial<{
//     temp: number | null;
//     bm: string;
//     updated_at: string;
//     chnotes: string;
//   }>
// ) {
//   try {
//     const response = await api2.put(`/child-health/child-vitalsigns/${chvitalId}/`, payload);
//     console.log("Vital signs record updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Vital signs update error:", error);
//     throw new Error(`Failed to update vital signs record: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }

// export async function updateNutritionalStatus(
//   nutstatId: string,
//   payload: Partial<{
//     wfa: string;
//     lhfa: string;
//     wfl: string;
//     muac: string;
//     muac_status: string;
//     updated_at: string;
//     chvital: string;
//     edemaSeverity: string;
//   }>
// ) {
//   try {
//     const response = await api2.put(`/child-health/nutritional-status/${nutstatId}/`, payload);
//     console.log("Nutritional status record updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Nutritional status update error:", error);
//     throw new Error(`Failed to update nutritional status: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }

// export async function updateBodyMeasurement(
//   bmId: string,
//   payload: Partial<{
//     age: string;
//     height: number | null;
//     weight: number | null;
//     updated_at: string;
//     patrec: string;
//     staff: string | null;
//   }>
// ) {
//   try {
//     const response = await api2.put(`/patientrecords/body-measurements/${bmId}/`, payload);
//     console.log("BMI record updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("BMI record update error:", error);
//     throw new Error(`Failed to update BMI record: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }

// // --- Patient Disability Operations ---

// export async function updatePatientDisabilityStatus(
//   payload: {
//     pd_id: number;
//     disability_id?: string;
//     patrec_id?: string;
//   }[]
// ) {
//   try {
//     const updatedPayload = payload.map((item) => ({
//       ...item,
//       updated_at: new Date().toISOString()
//     }));
//     const response = await api2.patch("patientrecords/patient-disability/", updatedPayload);
//     console.log("Disabilities updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Failed to update disabilities:", error);
//     throw new Error(`Failed to update disabilities: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }
// // --- Follow-up Visit Operations ---

// export async function updateFollowUpVisit(
//   followvId: string,
//   payload: Partial<{
//     followv_date: string | null;
//     followv_description: string | null;
//     updated_at: string;
//     patrec: string;
//     followv_status: string;
//   }>
// ) {
//   try {
//     const response = await api2.patch(`/patientrecords/follow-up-visit/${followvId}/`, payload);
//     console.log("Follow-up visit updated:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Follow-up visit update error:", error);
//     throw new Error(`Failed to update follow-up visit: ${error instanceof Error ? error.message : "Unknown error"}`);
//   }
// }
// 