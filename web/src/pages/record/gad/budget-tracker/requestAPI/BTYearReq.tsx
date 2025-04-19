// budget-tracker/requestAPI/BTYearReq.tsx
import api from "@/api/api";
import { useMutation } from "@tanstack/react-query";

export const fetchBudgetYears = async () => {
  try {
    const res = await api.get('gad/gad-budget-tracker-main/');
    return res.data;
  } catch (err) {
    console.error('Error fetching budget years:', err);
    throw err;
  }
};

export const useCreateCurrentYearBudget = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const res = await api.post('gad/gad-budget-tracker-table');
        return res.data;
      } catch (err) {
        console.error('Error creating current year budget:', err);
        throw err;
      }
    }
  });
};