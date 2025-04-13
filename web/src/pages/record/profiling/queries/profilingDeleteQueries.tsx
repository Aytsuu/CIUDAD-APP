import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteFamilyComposition, deleteRequest } from "../restful-api/profilingDeleteAPI"

export const useDeleteRequest = () => {
  return useMutation({
    mutationFn: ({requestId} : {
      requestId: string
    }) => deleteRequest(requestId)
  })
}

export const useDeleteFamilyComposition = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({familyId, residentId} : {
      familyId: string
      residentId: string
    }) => deleteFamilyComposition(familyId, residentId),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['families']});
    }
  })
}