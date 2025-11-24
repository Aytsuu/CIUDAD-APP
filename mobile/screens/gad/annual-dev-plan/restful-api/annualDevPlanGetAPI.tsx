import { api } from "@/api/api";

// Get all years with data (only non-archived plans)
export const getAnnualDevPlanYears = async () => {
  try {
    const params = new URLSearchParams();
    params.append('dev_archived', 'false'); // Only get years with non-archived plans
    const res = await api.get(`/gad/gad-annual-development-plan/years/?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Get all plans for a specific year (only non-archived plans)
export const getAnnualDevPlansByYear = async (year: string | number) => {
  try {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('dev_archived', 'false'); // Only get non-archived plans
    const res = await api.get(`/gad/gad-annual-development-plan/?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Get a specific plan by ID
export const getAnnualDevPlanById = async (planId: string | number) => {
  try {
    const res = await api.get(`/gad/gad-annual-development-plan/${planId}/`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Get archived plans with search and pagination support
export const getArchivedAnnualDevPlans = async (search?: string, page?: number, pageSize?: number, ordering?: string) => {
  try {
    const params = new URLSearchParams();
    params.append('dev_archived', 'true');
    if (search) {
      params.append('search', search);
    }
    if (page) {
      params.append('page', page.toString());
    }
    if (pageSize) {
      params.append('page_size', pageSize.toString());
    }
    if (ordering) {
      params.append('ordering', ordering);
    }
    const res = await api.get(`/gad/gad-annual-development-plan/?${params.toString()}`);
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Archive plans (bulk operation)
export const archiveAnnualDevPlans = async (devIds: number[]) => {
  try {
    const res = await api.patch(`/gad/gad-annual-development-plan/bulk-update/`, {
      dev_ids: devIds,
      dev_archived: true
    });
    return res.data;
  } catch (error) {
    throw error;
  }
};

// Restore archived plans (bulk operation)
export const restoreAnnualDevPlans = async (devIds: number[]) => {
  try {
    const res = await api.patch(`/gad/gad-annual-development-plan/bulk-update/`, {
      dev_ids: devIds,
      dev_archived: false
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}; 