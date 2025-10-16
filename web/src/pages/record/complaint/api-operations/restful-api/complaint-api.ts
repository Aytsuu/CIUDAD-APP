import { api } from "@/api/api";

export const getComplaints = () => {
  return api.get("/complaint/list/");
};

export const archiveComplaint = (id: string) => {
  return api.patch(`/complaint/${id}/archive/`);
};

export const getArchivedComplaints = () => {
  return api.get("/complaint/archived/");
};

export const raiseIssue = (compId : number) => {
  return api.post(`/complaint/${compId}/raiseissue/`)
};

export const deleteComplaint = (compId : number) => {
  return api.post(`/complaint/${compId}/delete/`);
}

export const updateComplaint = (compId : number, payload: any) => {
  return api.patch(`/complaint/${compId}/update/`, payload)
}
