import api from "@/api/api";
import { useMutation } from "@tanstack/react-query";

export const useUpdateAccount = () => {
  return useMutation({
    mutationFn: async ({ data, accId } : {
      data: Record<string, any>
      accId: number
    }) => {
      try {
        const res = await api.patch(`account/${accId}/`, data)
      } catch (err) {
        throw err
      }
    }, 
    onSuccess: () => {
      
    }
  })
} 