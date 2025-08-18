// src/services/medicineRequestService.ts

import { api2 } from "@/api/api";


export const processMedicineRequest = async (formData: any, files: File[]) => {
  try {
    const data = new FormData();

    // Append JSON data
    data.append("pat_id", formData.pat_id);
    data.append("staff_id", formData.staff_id ?? "");
    data.append("signature", formData.signature ?? "");
    data.append("medicines", JSON.stringify(formData.medicines));

    // Append files
    if (files && files.length > 0) {
      files.forEach((file) => {
        data.append("files", file); // matches serializer's `files` field
      });
    }

    const response = await api2.post(`medicine/process-medicine-request/`, data);

    return response.data;
  } catch (error: any) {
    console.error("❌ Error processing medicine request:", error);
    throw error.response?.data || error.message;
  }
};
