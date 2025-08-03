import { api } from "@/api/api";

// Get all years with data
export const getAnnualDevPlanYears = async () => {
  try {
    const res = await api.get('/gad/gad-annual-development-plan/years/');
    return res.data;
  } catch (error) {
    console.error('Error fetching annual dev plan years:', error);
    throw error;
  }
};

// Get all plans for a specific year
export const getAnnualDevPlansByYear = async (year: string | number) => {
  try {
    const res = await api.get(`/gad/gad-annual-development-plan/?year=${year}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching annual dev plans by year:', error);
    throw error;
  }
};

// Get a specific plan by ID
export const getAnnualDevPlanById = async (planId: string | number) => {
  try {
    const res = await api.get(`/gad/gad-annual-development-plan/${planId}/`);
    return res.data;
  } catch (error) {
    console.error('Error fetching annual dev plan by ID:', error);
    throw error;
  }
}; 