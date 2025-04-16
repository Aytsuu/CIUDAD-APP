import { useMutation } from "@tanstack/react-query"
import { deleteRequest } from "../restful-api/profilingDeleteAPI"

export const useDeleteRequest = () => {
  return useMutation({
    mutationFn: ({requestId} : {requestId: string}) => deleteRequest(requestId)
  })
}