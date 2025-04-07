import api from "@/api/api";

// Request deletion on approve
export const deleteRequest = async (requestId: string) => {
  try {
    const res = await api.delete(`profiling/request/${requestId}/`);
    return res.status;
  } catch (err) {
    console.error(err);
  }
};
