import api from "@/api/api";

export const raiseIssue = (compId : number) => {
  return api.post(`/complaint/${compId}/raiseissue/`)
};