// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { CircleCheck } from "lucide-react";
// import { deleteBudgetPlan } from "../restful-API/budgetPlanDeleteAPI";

// export const useDeleteBudgetPlan = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: (plan_id: number) => deleteBudgetPlan(plan_id),
//         onMutate: async (plan_id) => {
//             await queryClient.cancelQueries({queryKey: ['budgetPlan']});
//             toast.loading("Deleting budget plan...", {id: 'deleteBudgetplan'});

//             return {plan_id}
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({queryKey: ['budgetPlan']});
//             toast.success("Budget Plan deleted successfully", {
//                 id: "deleteBudgetplan",
//                 icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//                 duration: 2000
//                 });
//         },
//         onError: (err) => {
//             toast.error("Failed to delete budget plan", {
//             id: "deleteBudgetplan",
//             duration: 1000
//             });
//             console.error("Failed to delete entry:", err);
//         }
//     })
// }

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CircleCheck } from "lucide-react";
import { deleteBudgetPlan } from "../restful-API/budgetPlanDeleteAPI";

export const useDeleteBudgetPlan = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBudgetPlan,
        onMutate: async (plan_id) => {
            await queryClient.cancelQueries({ queryKey: ['budgetPlan'] });
            toast.loading("Deleting budget plan...", { id: 'deleteBudgetplan' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });
            toast.success("Budget Plan deleted successfully", {
                id: "deleteBudgetplan",
                icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
                duration: 2000
            });
        },
        onError: (err) => {
            toast.error("Failed to delete budget plan", {
                id: "deleteBudgetplan",
                duration: 1000
            });
            console.error("Failed to delete entry:", err);
        }
    });
};