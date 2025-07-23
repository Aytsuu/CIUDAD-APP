import { api } from "@/api/api";

export const archiveProjectProposal = async (gprId: number) => {
  try {
    const res = await api.patch(`gad/project-proposals/${gprId}/archive/`);
    return res.data;
  } catch (err) {
    console.error("Error archiving project proposal:", err);
    throw err;
  }
};

export const restoreProjectProposal = async (gprId: number) => {
  try {
    const res = await api.patch(`gad/project-proposals/${gprId}/restore/`);
    return res.data;
  } catch (err) {
    console.error("Error restoring project proposal:", err);
    throw err;
  }
};

export const permanentDeleteProjectProposal = async (gprId: number) => {
  try {
    const res = await api.delete(`gad/project-proposals/${gprId}/?permanent=true`);
    return res.data;
  } catch (err) {
    console.error("Error permanently deleting project proposal:", err);
    throw err;
  }
};

// export const delProjectProposal = async (gprId: number) => {
//   try {
//     console.log("Deleting project proposal with gprId:", gprId);
//     const res = await api.delete(`gad/project-proposals/${gprId}/`);
//     console.log("Delete response:", res.data);
//     return res.data;
//   } catch (err) {
//     console.error("Error deleting project proposal:", err);
//     throw err;
//   }
// };

export const deleteSupportDocument = async (gprId: number, psdId: number) => {
  if (!gprId || !psdId) {
    throw new Error("Project ID and Document ID are required");
  }
  
  try {
    const res = await api.delete(`gad/support-docs/${psdId}/`);
    return res.data;
  } catch (error) {
    console.error("Error deleting support document:", error);
    throw error;
  }
};

export const archiveSupportDocument = async (gprId: number, psdId: number) => {
  if (!gprId || !psdId) {
    throw new Error("Project ID and Document ID are required");
  }
  
  try {
    const res = await api.patch(`gad/support-docs/${psdId}/`, {
      psd_is_archive: true
    });
    return res.data;
  } catch (error) {
    console.error("Error archiving support document:", error);
    throw error;
  }
};

export const restoreSupportDocument = async (gprId: number, psdId: number) => {
  if (!gprId || !psdId) {
    throw new Error("Project ID and Document ID are required");
  }
  
  try {
    const res = await api.patch(`gad/support-docs/${psdId}/`, {
      psd_is_archive: false
    });
    return res.data;
  } catch (error) {
    console.error("Error restoring support document:", error);
    throw error;
  }
};