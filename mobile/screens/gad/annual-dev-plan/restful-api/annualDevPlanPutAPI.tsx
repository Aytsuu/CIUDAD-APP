import { api } from "@/api/api";

// Update an existing annual development plan
export const updateAnnualDevPlan = async (planId: string | number, data: any) => {
  try {
    // Transform mobile form data to match backend expectations
    const payload = {
      dev_date: data.month ? new Date(data.month).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dev_client: data.clientFocused,
      dev_issue: data.genderIssue,
      dev_project: data.gadProgram,
      dev_activity: data.gadActivity ? JSON.stringify(data.gadActivity) : null,
      dev_res_person: data.responsiblePerson,
      dev_indicator: data.performanceIndicator,
      dev_gad_budget: data.price ? parseFloat(data.price) : 0,
      staff: data.staff || null,
      budgets: data.budgetName && data.pax && data.price ? [{
        gdb_name: data.budgetName,
        gdb_pax: parseFloat(data.pax),
        gdb_price: parseFloat(data.price)
      }] : []
    };

    console.log('Updating annual dev plan with payload:', payload);
    const res = await api.put(`/gad/gad-annual-development-plan/${planId}/`, payload);
    return res.data;
  } catch (error) {
    console.error('Error updating annual development plan:', error);
    throw error;
  }
}; 