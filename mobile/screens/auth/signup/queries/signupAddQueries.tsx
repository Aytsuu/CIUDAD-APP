import { useMutation } from "@tanstack/react-query";
import { addAddress, addPersonal, addPersonalAddress, addRequest, addRequestFile } from "../restful-api/signupPostAPI";
import { api } from "@/api/api";

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
  return useMutation({
    mutationFn: async (residentId: string) => {
      try {
        const res = await api.post('profiling/request/link/registration/', {
          resident_id: residentId
        });
        return res;
      } catch (err) {
        throw err;
      }
    }
  })
}