import axios from "axios";
import { useMutation } from "@tanstack/react-query";

export const usePostBlotter = () => {
  return useMutation({
    mutationFn: (formData: FormData) =>
      axios.post("blotter/create/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
  });
};