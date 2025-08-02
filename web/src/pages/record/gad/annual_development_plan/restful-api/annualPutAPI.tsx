import { api } from "@/api/api";

// Update an existing annual development plan
export const updateAnnualDevPlan = async (devId: number, data: any) => {
  const res = await api.put(`/gad/gad-annual-development-plan/${devId}/`, data);
  return res.data;
}; 