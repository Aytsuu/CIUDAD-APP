// import { useMutation, useQueryClient } from "@tanstack/react-query"
// import { string } from "zod";
// import { risk_vaw } from "../request-db/PostRequest";

// export const useAddRiskVaw = () => {
//     const queryClient = useQueryClient();
//     return useMutation({
//         mutationFn: ({riskvaw_data}: (
//         riskvaw_data: Record<string, string>;
//     }) => risk_vaw(riskvaw_data),
//         onSuccess: async (newData) => {
//             queryClient.setQueryData({"famplanning"}, (old: any) => {
//             ...old,
//             newData,
//         });

//         queryClient.invalidateQueries({ queryKey: ["famplanning"] });
//         }
//     })
// }