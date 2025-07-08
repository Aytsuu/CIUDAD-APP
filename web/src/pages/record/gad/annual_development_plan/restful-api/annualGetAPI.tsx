import { api } from "@/api/api";

// Get all years with data
export const getAnnualDevPlanYears = async () => {
  const res = await api.get('/gad/gad-annual-development-plan/years');
  return res.data;
};

// Get all plans for a specific year
export const getAnnualDevPlansByYear = async (year: string | number) => {
  const res = await api.get(`/gad/gad-annual-development-plan/?year=${year}`);
  return res.data;
};
