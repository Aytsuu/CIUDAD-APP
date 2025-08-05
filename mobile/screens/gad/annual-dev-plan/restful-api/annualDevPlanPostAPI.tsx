import { api } from "@/api/api";

// Create a new annual development plan
export const createAnnualDevPlan = async (data: any) => {
  try {
    // Transform mobile form data to match backend expectations
    const payload = {
      dev_date: data.month ? new Date(data.month).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      dev_client: data.clientFocused,
      dev_issue: data.genderIssue,
      dev_project: data.gadProgram,
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

    console.log('Creating annual dev plan with payload:', payload);
    const res = await api.post('/gad/gad-annual-development-plan/', payload);
    return res.data;
  } catch (error) {
    console.error('Error creating annual development plan:', error);
    throw error;
  }
}; 