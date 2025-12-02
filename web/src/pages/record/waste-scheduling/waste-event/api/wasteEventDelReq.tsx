import { api } from "@/api/api";

export const delWasteEvent = async (
  we_num: number,
  permanent: boolean = false
): Promise<any> => {
  try {
    if (permanent) {
      const res = await api.delete(`/waste/waste-event/${we_num}/?permanent=true`);
      return res.data;
    } else {
      const res = await api.delete(`/waste/waste-event/${we_num}/`);
      return res.data;
    }
  } catch (err) {
    throw err;
  }
};

export const restoreWasteEvent = async (we_num: number): Promise<any> => {
  try {
    const res = await api.put(`/waste/waste-event/${we_num}/restore/`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

