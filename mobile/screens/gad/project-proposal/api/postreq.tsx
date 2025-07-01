import api from "@/api/api";

export const addSupportDocument = async (gprId: number, fileData: {
  psd_url: string;
  psd_path: string;
  psd_name: string;
  psd_type: string;
}) => {
  if (!gprId) {
    throw new Error("Project ID is required");
  }
  
  try {
    const res = await api.post(`gad/project-proposals/${gprId}/support-docs/`, {
      ...fileData,
      psd_is_archive: false,
      gpr_id: gprId 
    });
    return res.data;
  } catch (error) {
    console.error("Error adding support document:", error);
    throw error;
  }
};