import { api } from "@/api/api";

// Get all years with data (with search support)
export const getAnnualDevPlanYears = async (search?: string) => {
  const params = new URLSearchParams();
  if (search) {
    params.append('search', search);
  }
  const res = await api.get(`/gad/gad-annual-development-plan/years?${params.toString()}`);
  return res.data;
};

// Get all plans for a specific year (with search and pagination support)
export const getAnnualDevPlansByYear = async (year: string | number, search?: string, page?: number, pageSize?: number) => {
  const params = new URLSearchParams();
  params.append('year', year.toString());
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
export const getAnnualDevPlans = async (search?: string, page?: number, pageSize?: number) => {
  const params = new URLSearchParams();
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