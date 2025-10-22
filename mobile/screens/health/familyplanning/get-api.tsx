import { api2 } from "@/api/api";


const handleApiError = (err: any, operation: string) => {
  if (err.response) {
    console.error(`❌ ${operation} API Error:`, err.response.data || err.message)
  } else {
    console.error(`❌ Unexpected ${operation} Error:`, err)
  }
  throw new Error(err.response?.data?.detail || `Failed to ${operation.toLowerCase()}`)
}

export const getFPRecordsByPatientId = async (pat_id: string) => {
  try {
    console.log(`🔍 Fetching FP records by patient ID: ${pat_id}...`);
    const res = await api2.get(`familyplanning/fp-records-by-patient/${pat_id}/`);
    console.log("✅ FP records fetched successfully:", res.data);
    return res.data; // Array of FP records
  } catch (error) {
    handleApiError(error, `Fetch FP Records by Patient ID: ${pat_id}`);
    return [];
  }
};