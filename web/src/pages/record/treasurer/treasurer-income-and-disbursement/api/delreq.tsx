import { api } from "@/api/api";

export const archiveIncomeImage = async (infi_num: number) => {
  const res = await api.patch(`treasurer/income-tab/images/${infi_num}/`, { infi_is_archive: true });
  return res.data;
};

export const restoreIncomeImage = async (infi_num: number) => {
  const res = await api.patch(`treasurer/income-tab/images/${infi_num}/`, { infi_is_archive: false });
  return res.data;
};

export const deleteIncomeImage = async (infi_num: number) => {
  const res = await api.delete(`treasurer/income-tab/images/${infi_num}/`);
  return res.data;
};

export const permanentDeleteIncomeImage = async (infi_num: number) => {
  const res = await api.delete(`treasurer/income-tab/images/${infi_num}/?permanent=true`);
  return res.data;
};

// Disbursement Image Endpoints
export const archiveDisbursementImage = async (disf_num: number) => {
  const res = await api.patch(`treasurer/disbursement-tab/images/${disf_num}/`, { disf_is_archive: true });
  return res.data;
};

export const restoreDisbursementImage = async (disf_num: number) => {
  const res = await api.patch(`treasurer/disbursement-tab/images/${disf_num}/`, { disf_is_archive: false });
  return res.data;
};

export const deleteDisbursementImage = async (disf_num: number) => {
  const res = await api.delete(`treasurer/disbursement-tab/images/${disf_num}/`);
  return res.data;
};

export const permanentDeleteDisbursementImage = async (disf_num: number) => {
  const res = await api.delete(`treasurer/disbursement-tab/images/${disf_num}/?permanent=true`);
  return res.data;
};

// Folder Operations
export const permanentDeleteIncomeFolder = async (inf_num: number) => {
  const res = await api.delete(`treasurer/income-tab/folders/${inf_num}/permanent-delete/`);
  return res.data;
};

export const permanentDeleteDisbursementFolder = async (dis_num: number) => {
  const res = await api.delete(`treasurer/disbursement-tab/folders/${dis_num}/permanent-delete/`);
  return res.data;
};

export const restoreIncomeFolder = async (inf_num: number) => {
  const res = await api.patch(`treasurer/income-tab/folders/${inf_num}/restore/`);
  return res.data;
};

export const restoreDisbursementFolder = async (dis_num: number) => {
  const res = await api.patch(`treasurer/disbursement-tab/folders/${dis_num}/restore/`);
  return res.data;
};