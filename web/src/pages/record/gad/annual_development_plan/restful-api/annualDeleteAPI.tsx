import { api } from "@/api/api";

// Delete plans permanently
export const deleteAnnualDevPlans = async (devIds: number[]) => {
  const res = await api.delete(`/gad/gad-annual-development-plan/bulk-delete/`, {
    data: { dev_ids: devIds }
  });
  return res.data;
};

