import { api } from "@/api/api";

// Create a new annual development plan
export const createAnnualDevPlan = async (data: any) => {
  const res = await api.post('/gad/gad-annual-development-plan/', data);
  return res.data;
};
