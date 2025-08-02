import { api } from "@/api/api";
import { IncomeImage, DisbursementImage } from "./queries";

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

// folder operations
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

// export const deleteIncomeFolder = async (inf_num: number, permanent: boolean = false) => {
//   const res = await api.delete(`treasurer/income-tab/folders/${inf_num}/`, {
//     params: { permanent: permanent.toString() }
//   });
//   return res.data;
// };

// export const deleteDisbursementFolder = async (dis_num: number, permanent: boolean = false) => {
//   const res = await api.delete(`treasurer/disbursement-tab/folders/${dis_num}/`, {
//     params: { permanent: permanent.toString() }
//   });
//   return res.data;
// };

export const getIncomeImages = async (archive: boolean = false, folderId?: number) => {
  try {
    const params: Record<string, string> = { archive: archive.toString() }
    if (folderId) params.folder = folderId.toString()
    const res = await api.get('treasurer/income-tab/images/', { params })
    const data = res.data?.data ?? res.data ?? []
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error("API Error:", err)
    return []
  }
}

export const getDisbursementImages = async (archive: boolean = false, folderId?: number) => {
  try {
    const params: Record<string, string> = { archive: archive.toString() }
    if (folderId) params.folder = folderId.toString()
    const res = await api.get('treasurer/disbursement-tab/images/', { params })
    const data = res.data?.data ?? res.data ?? []
    return Array.isArray(data) ? data : []
  } catch (err) {
    console.error("API Error:", err)
    return []
  }
}

export const createIncomeImage = async (data: {
  upload_date: string
  type: string
  name: string
  path: string
  url: string
  inf_num: number
}) => {
  const res = await api.post(`treasurer/income-tab/images/`, data)
  return res.data
}

export const createDisbursementImage = async (data: {
  upload_date: string
  type: string
  name: string
  path: string
  url: string
  dis_num: number
}) => {
  const res = await api.post(`treasurer/disbursement-tab/images/`, data)
  return res.data
}

export const createFolder = async (data: { type: "income" | "disbursement"; name: string; year: string, desc?: string }) => {
  const endpoint = data.type === "income" 
    ? "treasurer/income-tab/folders/" 
    : "treasurer/disbursement-tab/folders/";
  
  // Construct payload explicitly
  const payload = data.type === "income"
    ? {
        inf_name: data.name,
        inf_year: data.year,
        inf_desc: data.desc,
        inf_is_archive: false,
      }
    : {
        dis_name: data.name,
        dis_year: data.year,
        dis_desc: data.desc,
        dis_is_archive: false,
      };

  console.log("Creating folder at endpoint:", endpoint);
  console.log("Payload:", payload);

  const res = await api.post(endpoint, payload);
  return res.data;
}

export const updateIncomeFolder = async (inf_num: number, data: { inf_name: string; inf_year: string , inf_desc?: string}) => {
  const res = await api.patch(`treasurer/income-tab/folders/${inf_num}/`, data)
  return res.data
}

export const updateDisbursementFolder = async (dis_num: number, data: { dis_name: string; dis_year: string; dis_desc?: string }) => {
  const res = await api.patch(`treasurer/disbursement-tab/folders/${dis_num}/`, data)
  return res.data
}

export const updateIncomeImage = async (infi_num: number, data: Partial<IncomeImage>) => {
  const res = await api.patch(`treasurer/income-tab/images/${infi_num}/`, data)
  return res.data
}

export const updateDisbursementImage = async (disf_num: number, data: Partial<DisbursementImage>) => {
  const res = await api.patch(`treasurer/disbursement-tab/images/${disf_num}/`, data)
  return res.data
}