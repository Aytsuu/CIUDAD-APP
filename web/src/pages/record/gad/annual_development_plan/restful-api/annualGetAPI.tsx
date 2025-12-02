import { api } from "@/api/api";

// Get all years with data (with search support)
export const getAnnualDevPlanYears = async (search?: string) => {
  const params = new URLSearchParams();
  params.append('dev_archived', 'false'); // Only get years with non-archived plans
  if (search) {
    params.append('search', search);
  }
  const res = await api.get(`/gad/gad-annual-development-plan/years?${params.toString()}`);
  return res.data;
};

// Get all plans for a specific year (with search and pagination support)
export const getAnnualDevPlansByYear = async (year: string | number, search?: string, page?: number, pageSize?: number, includeArchived: boolean = true) => {
  const params = new URLSearchParams();
  params.append('year', year.toString());
  // Only filter archived if explicitly requested (for calendar, we want all plans)
  if (!includeArchived) {
    params.append('dev_archived', 'false');
  }
  if (search) {
    params.append('search', search);
  }
  if (page) {
    params.append('page', page.toString());
  }
  if (pageSize) {
    params.append('page_size', pageSize.toString());
  }
  const res = await api.get(`/gad/gad-annual-development-plan/?${params.toString()}`);
  return res.data;
};

// Get all plans with search and pagination support
export const getAnnualDevPlans = async (search?: string, page?: number, pageSize?: number, includeArchived: boolean = true) => {
  const params = new URLSearchParams();
  // Only filter archived if explicitly requested (for calendar, we want all plans)
  if (!includeArchived) {
    params.append('dev_archived', 'false');
  }
  if (search) {
    params.append('search', search);
  }
  if (page) {
    params.append('page', page.toString());
  }
  if (pageSize) {
    params.append('page_size', pageSize.toString());
  }
  const res = await api.get(`/gad/gad-annual-development-plan/?${params.toString()}`);
  return res.data;
};

// Fetch staff list for responsible person picker
export const getStaffList = async () => {
  const res = await api.get('/gad/api/staff/');
  return res.data;
};

// Get single plan by ID
export const getAnnualDevPlanById = async (devId: number | string) => {
  const res = await api.get(`/gad/gad-annual-development-plan/${devId}/`);
  return res.data;
};

// Get archived plans with search and pagination support
export const getArchivedAnnualDevPlans = async (search?: string, page?: number, pageSize?: number, ordering?: string) => {
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
};

// Archive plans (bulk operation)
export const archiveAnnualDevPlans = async (devIds: number[], staffId?: string) => {
  const res = await api.patch(`/gad/gad-annual-development-plan/bulk-update/`, {
    dev_ids: devIds,
    dev_archived: true,
    staff_id: staffId
  });
  return res.data;
};

// Restore archived plans (bulk operation)
export const restoreAnnualDevPlans = async (devIds: number[], staffId?: string) => {
  const res = await api.patch(`/gad/gad-annual-development-plan/bulk-update/`, {
    dev_ids: devIds,
    dev_archived: false,
    staff_id: staffId
  });
  return res.data;
};