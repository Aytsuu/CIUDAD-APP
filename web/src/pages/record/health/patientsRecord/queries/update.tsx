import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updatePatient } from "../restful-api/update";

// query keys
export const patientQueryKey = {
  allPatients: ["patients"],
  lists: () => [...patientQueryKey.allPatients, "list"],
  list: (filters: any) => [...patientQueryKey.lists(), { filters }],
  details: () => [...patientQueryKey.allPatients, "detail"],
  detail: (id: any) => [patientQueryKey.details(), id],
  search: (params: any) => [...patientQueryKey.allPatients, "search", params]
};

export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, patientData }: { patientId: string; patientData: any }) => 
      updatePatient(patientId, patientData),
    onSuccess: (data, variables) => {
      // Invalidate and update queries
      queryClient.invalidateQueries({ queryKey: patientQueryKey.lists() });
      queryClient.invalidateQueries({ queryKey: patientQueryKey.detail(variables.patientId) });
      
      // Set updated data in cache
      if (data && data.pat_id) {
        queryClient.setQueryData(patientQueryKey.detail(data.pat_id), data);
        console.log("Patient updated successfully:", data.pat_id);
      } else {
        console.error("Invalid response data:", data);
      }
    },
    onError: (error: unknown) => {
      console.error("Error updating patient:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const err = error as { response?: { status?: number } };
        if (err.response?.status === 500) {
          console.log("Refreshing patient list due to potential update despite error");
          queryClient.invalidateQueries({ queryKey: patientQueryKey.lists() });
        }
      }
    }
  });
};
