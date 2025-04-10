import { useMutation, useQuery } from "@tanstack/react-query";
import { postBlotter, getBlotters } from "./restful-api/blotter-api";

export const usePostBlotter = () => {
    return useMutation({
        mutationFn: (formData: FormData) => postBlotter(formData),
    });
};

export const useGetBlotter = () => {
    return useQuery({
        queryKey: ["blotter"],
        queryFn: () => getBlotters(),
    })
}

