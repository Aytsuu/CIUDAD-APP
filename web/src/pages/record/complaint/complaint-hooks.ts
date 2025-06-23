import { useMutation, useQuery } from "@tanstack/react-query";
import { getComplaints } from "./restful-api/complaint-api";

// export const usePostComplaint = () => {
//     return useMutation({
//         mutationFn: (formData: FormData) => postComplaint(formData),
//     });
// };

export const useGetComplaint = () => {
    return useQuery({
        queryKey: ["blotters"],
        queryFn: () => getComplaints(),
        select: (response) => response.data
    })
}

