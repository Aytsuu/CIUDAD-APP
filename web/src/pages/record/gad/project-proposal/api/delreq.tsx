import api from "@/pages/api/api";

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

export const deleteSupportDocument = async (psdId: number) => {
  try {
    const res = await api.delete(`gad/support-docs/${psdId}/`);
    return res.data;
  } catch (err) {
    console.error(`Error deleting support document ${psdId}:`, err);
    throw err;
  }
};