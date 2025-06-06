import { api } from "@/api/api";

export const postBlotter = (formData: FormData) => {
  return api.post('/complaint/create/', formData, {
    headers: { "Content-Type": "multipart/form-data"},
  })
}

export const getBlotters = () => {
  return api.get("/complaint/list/");
};

export const getBlotterById = (id: string) => {
  return api.get(`/complaint/${id}/`);
};