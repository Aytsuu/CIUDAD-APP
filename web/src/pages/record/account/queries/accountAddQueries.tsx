import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/api";

export const useAddAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({accountInfo, residentId} : {
      accountInfo: Record<string, any>
      residentId: string
    }) => {
      try {
          const response = await api.post('authentication/signup/', {
            username: accountInfo.username,
            email: accountInfo.email,
            phone: accountInfo.phone,
            password: accountInfo.password,
            resident_id: residentId 
          });
      
          return response.data;
        } catch (err: any) {
          throw err;
        }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["residents"]});
    }
  })
}

export const useVerifyAccountReg = () => {
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      try {
        const res = await api.post("authentication/verify/web-registration/", data);
        return res.data;
      } catch (err) { 
        throw err;
      }
    }
  })
}
