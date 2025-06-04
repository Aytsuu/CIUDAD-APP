import { api } from "@/api/api";

export const addIncidentReport = async (data: Record<string, any>) => {
  try {
    console.log(data);
    const res = await api.post('report/ir/create/', data);
    return res.data;
  } catch (err) {
    throw err;
  }
}