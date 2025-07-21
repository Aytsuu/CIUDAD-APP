import { useMutation } from "@tanstack/react-query";
import { addFile, addPersonal, addRequest, addRequestFile } from "../restful-api/signupPostAPI";

export const useAddPersonal = () => {
  return useMutation({
    mutationFn: (values: Record<string, any>) => addPersonal(values),
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
    mutationFn: ({requestId, fileId} : {
      requestId: string;
      fileId: string;
    }) => addRequestFile(requestId, fileId),
    onSuccess: () => {}
  })
}