import { useMutation } from "@tanstack/react-query";
import { addAddress, addFile, addPersonal, addPersonalAddress, addRequest, addRequestFile } from "../restful-api/signupPostAPI";

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

export const useAddFile = () => {
  return useMutation({
    mutationFn: ({name, type, path,url} : {
      name: string;
      type: string;
      path: string;
      url: string;
    }) => addFile(name, type, path, url),
    onSuccess: () => {}
  })
}

export const useAddRequestFile = () => {
  return useMutation({
    mutationFn: (data: Record<string, any>) => addRequestFile(data),
    onSuccess: () => {}
  })
}