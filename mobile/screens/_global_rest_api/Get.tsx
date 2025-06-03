import { api } from "@/api/api";

export const getSitio = async () => {
  try {
    const res = await api.get('profiling/sitio/list/');
    return res.data;
  } catch (err) {
    throw err;
  }
}