import { useMutation } from "@tanstack/react-query";
import { addIncidentReport } from "../rest_api/reportPOST";

export const useAddIncidentReport = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => addIncidentReport(data)
  })
}