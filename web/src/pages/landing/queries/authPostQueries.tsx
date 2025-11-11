import { useMutation } from "@tanstack/react-query"
import {api} from "@/api/api"

export const useSendOTP = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post("account/phone-verification/", data)
        return res.data
      } catch (err) {
        console.error(err);
        throw err
      }
    }
  })
}