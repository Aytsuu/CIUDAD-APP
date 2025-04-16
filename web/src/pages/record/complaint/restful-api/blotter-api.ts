import api from "@/api/api";

export const postBlotter = (formData: FormData) => {
  return api.post('/blotter/create/', formData, {
    headers: { "Content-Type": "multipart/form-data"},
  })
}

export const getBlotters = () => {
  return api.get("/blotter/list/");
};

export const getBlotterById = (id: string) => {
  return api.get(`/blotter/${id}/`);
};