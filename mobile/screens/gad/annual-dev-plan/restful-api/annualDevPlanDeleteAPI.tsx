import { api } from "@/api/api";

// Delete plans permanently
export const deleteAnnualDevPlans = async (devIds: number[]) => {
  try {
    const res = await api.delete(`/gad/gad-annual-development-plan/bulk-delete/`, {
      data: { dev_ids: devIds }
    });
    return res.data;
  } catch (error) {
    console.error('Error deleting annual dev plans:', error);
    throw error;
  }
};

