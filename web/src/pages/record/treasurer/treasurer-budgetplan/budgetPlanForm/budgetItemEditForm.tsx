//  import { Label } from "@/components/ui/label";
//  import { Form } from "@/components/ui/form/form";
//  import { zodResolver } from "@hookform/resolvers/zod";
//  import {z} from "zod"
//  import { useForm } from "react-hook-form";
//  import { FormSelect } from "@/components/ui/form/form-select";
//  import { FormInput } from "@/components/ui/form/form-input";
//  import { BudgetItemEditSchema } from "@/form-schema/treasurer/budget-item-edit-schema";
//  import { Button } from "@/components/ui/button/button";
//  import { Plus } from "lucide-react";

//  export default function BudgetItemEditForm({planId}: {
//     planId: number
//  }){

//     const fromOptions = [
//         {id: "Test", name: "Test"}
//     ]

//     const toOptions = [
//         {id: "Test", name: "Test"}
//     ]

//     const form = useForm<z.infer<typeof BudgetItemEditSchema>>({
//         resolver: zodResolver(BudgetItemEditSchema),
//         defaultValues: {
//             to: "",
//             amount: "",
//             from: ""
//         }

//     })
//     return (
//         <div>
//             <Form {...form}>
//                 <div className="mb-3 mt-2 flex justify-end">
//                     <Button>
//                         <Plus size={16} color="#fff" />
//                         Add
//                     </Button>
//                 </div>
//                 <form>
//                     <div className="flex flex-col-3 gap-3">
//                         <FormSelect
//                             name="from"
//                             control={form.control}
//                             label="From"
//                             options={fromOptions}
//                         />

//                         <FormInput
//                             control={form.control}
//                             label="Amount"
//                             name="amount"
//                             placeholder="0.00"
//                         />

//                         <FormSelect
//                             name="to"
//                             control={form.control}
//                             label="To"
//                             options={toOptions}
//                         />
//                     </div>

//                     <div className="flex justify-end mt-3">
//                         <Button>Update</Button>
//                     </div>
//                 </form>
//             </Form>
//         </div>
//     )
//  }


import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormInput } from "@/components/ui/form/form-input";
import { BudgetItemEditSchema } from "@/form-schema/treasurer/budget-item-edit-schema";
import { Button } from "@/components/ui/button/button";
import { Plus } from "lucide-react";
import { BudgetPlanDetail } from "../budgetPlanInterfaces";

interface BudgetItemEditFormProps {
  planId: number;
  budgetItems: BudgetPlanDetail[];
}

export default function BudgetItemEditForm({ planId, budgetItems }: BudgetItemEditFormProps) {
  // Create options from budget items
  const fromOptions = budgetItems.map((item) => ({
    id: item.dtl_budget_item,
    name: `${item.dtl_budget_item} (${item.dtl_proposed_budget})`,
    value: item.dtl_id?.toString() || ""
  }));

  const toOptions = [...fromOptions];

  const form = useForm<z.infer<typeof BudgetItemEditSchema>>({
    resolver: zodResolver(BudgetItemEditSchema),
    defaultValues: {
      to: "",
      amount: "",
      from: ""
    }
  });

  const handleSubmit = (data: z.infer<typeof BudgetItemEditSchema>) => {
    console.log("Form submitted:", data);
    // Handle form submission here
  };

  return (
    <div>
      <Form {...form}>
        <div className="mb-3 mt-2 flex justify-end">
          <Button type="button">
            <Plus size={16} color="#fff" />
            Add
          </Button>
        </div>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col-3 gap-3">
            <FormSelect
              name="from"
              control={form.control}
              label="From"
              options={fromOptions}
            />

            <FormInput
              control={form.control}
              label="Amount"
              name="amount"
              placeholder="0.00"
              type="number"
            />

            <FormSelect
              name="to"
              control={form.control}
              label="To"
              options={toOptions}
            />
          </div>

          <div className="flex justify-end mt-3">
            <Button type="submit">Update</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}