// api.ts
import { api2 } from "@/api/api";

export const getPESections = async () => {
  try {
    const res = await api2.get("patientrecords/pe-section/");
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching PE sections:", err);
    }
    return null;
  }
};

export const getPEOptions = async () => {
  try {
    const res = await api2.get("patientrecords/pe-option/");
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error fetching PE options:", err);
    }
    return null;
  }
};

export const updatePEOption = async (pe_option_id: number, text: string) => {
  try {
    const res = await api2.patch(`patientrecords/update-pe-option/${pe_option_id}/`, { text });
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error updating PE option:", err);
    }
    return null;
  }
};

export const createPEOption = async (pe_section_id: number, text: string) => {
  try {
    const res = await api2.post(`patientrecords/pe-option/`, {
      pe_section: pe_section_id,
      text
    });
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error creating PE option:", err);
    }
    return null;
  }
};
// api.ts
export const createPEResults = async (selectedOptionIds: number[], find: number) => {
  try {
    // Send the IDs directly as an array
    const res = await api2.post("patientrecords/pe-result/", {
      pe_option: selectedOptionIds,
      find: find
    });
    if (res.data.error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(res.data.error);
      }
      return null;
    }
    return res.data;
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error saving physical exam results:", err);
    }
    return null;
  }
};

export const deletePEResults = async (findingId: string) => {
  try {
    await api2.delete(`patientrecords/physical-exam-results/${findingId}/`);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error deleting PE results:", error);
    }
    return null;
  }
};
