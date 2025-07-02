import { useMutation } from "@tanstack/react-query";
import { addAccount, addAddress, addPersonal, addPersonalAddress, addRequest, addRequestFile } from "../restful-api/signupPostAPI";
import { api } from "@/api/api";
import { useRouter } from "expo-router";
import { useToastContext } from "@/components/ui/toast";

export const useAddAddress = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addAddress(data)
  })
}

export const useAddPerAddress = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addPersonalAddress(data)
  })
}

export const useAddPersonal = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => addPersonal(data),
    onSuccess: () => {}
  })
}

export const useAddRequest = () => {
  return useMutation({
    mutationFn: (personalId: string) => addRequest(personalId),
    onSuccess: () => {}
  })
}

export const useAddRequestFile = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>[]) => addRequestFile(data),
    onSuccess: () => {}
  })
}

export const useValidateResidentId = () => {
  const { toast } = useToastContext();
  return useMutation({
    mutationFn: async (residentId: string) => {
      const res = await api.post('profiling/request/link/registration/', {
        resident_id: residentId
      });
      return res;
    },
    onError: (error: any) => {
      if(error?.response?.status === 404) {
        toast.error("Resident ID not found.");
      }

      if(error?.response?.status === 403) {
        toast.error("Your age is not eligible for registration.");
      }

      if(error?.response?.status === 409) {
        toast.error("An account already exists for this resident.")
      }
    }
  })
}

export const useAddAccount = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: ({accountInfo, residentId} : {
      accountInfo: Record<string, any>;
      residentId: string;
    }) => addAccount(accountInfo, residentId),
    onSuccess: () => {
      router.push('/(auth)')
    }
  })
}