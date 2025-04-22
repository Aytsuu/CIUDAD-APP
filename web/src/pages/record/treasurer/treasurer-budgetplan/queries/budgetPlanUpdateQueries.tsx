// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { updateBudgetPlan } from "../restful-API/budgetPlanPutAPI";
// import { toast } from "sonner";
// import { CircleCheck } from "lucide-react";
// import BudgetHeaderSchema from "@/form-schema/treasurer/budgetplan-header-schema";
// import BudgetAllocationSchema from "@/form-schema/treasurer/budget-allocation-schema";
// import { EditBudgetPlanSchema } from "@/form-schema/treasurer/budgetplan-edit-schema";
// import z from "zod"
 
// const BudgetPlanSchema = BudgetHeaderSchema.merge(BudgetAllocationSchema);

// export const useupdateBudgetPlan = (plan_id: number, onSuccess?: () => void) => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: (values: z.infer<typeof BudgetPlanSchema>) => {
//             const submissionValues = {
//                 ...values
//             };
//             return updateBudgetPlan(plan_id, submissionValues);
//         },
//         onSuccess: () =>{
//             toast.success('Budget plan updated successfully', {
//                 icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
//                 duration: 2000
//             });

//             queryClient.invalidateQueries({ queryKey: ['budgetPlan'] });

//             if (onSuccess) onSuccess()
      
//         },
//         onError: (err) => {
//             console.error("Error updating budget plan:", err);
//             toast.error("Failed to update budget plan");
//         }
//     })

// }

// export const useupdateBudgetPlanDetails = (dtl_id: number, onSuccess?: () => void) => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: (values: z.infer<typeof EditBudgetPlanSchema>) => {
//             const submissionValues = {
//                 ...values
//             }
//         }
//     })
// }