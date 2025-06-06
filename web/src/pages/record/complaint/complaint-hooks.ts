import { useMutation, useQuery } from "@tanstack/react-query";
import { postBlotter, getBlotters } from "./restful-api/complaint-api";

export const usePostComplaint = () => {
    return useMutation({
        mutationFn: (formData: FormData) => postBlotter(formData),
    });
};

export const useGetComplaint = () => {
    return useQuery({
        queryKey: ["blotters"],
        queryFn: () => getBlotters(),
        select: (response) => response.data
    })
}

