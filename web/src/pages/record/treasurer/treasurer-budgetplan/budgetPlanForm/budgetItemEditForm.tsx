// import { Form } from "@/components/ui/form/form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { FormSelect } from "@/components/ui/form/form-select";
// import { FormInput } from "@/components/ui/form/form-input";
// import { BudgetItemsSchema } from "@/form-schema/treasurer/budget-item-edit-schema";
// import { Button } from "@/components/ui/button/button";
// import { Plus, Trash2 } from "lucide-react";
// import { BudgetPlanDetail } from "../budgetPlanInterfaces";
// import { useFieldArray } from "react-hook-form";
// import { useEffect } from "react";

// export default function BudgetItemEditForm({ planId, budgetItems }: {
//     planId: number;
//     budgetItems: BudgetPlanDetail[]
// }) {
//     // Create options from budget items with amount information
//     const fromOptions = budgetItems.map((item) => ({
//         id: item.dtl_id?.toString() || "",
//         name: item.dtl_budget_item,
//         value: item.dtl_id?.toString() || "",
//         amount: item.dtl_proposed_budget
//     }));

//     const toOptions = [...fromOptions];

//     const form = useForm<z.infer<typeof BudgetItemsSchema>>({
//         resolver: zodResolver(BudgetItemsSchema),
//         defaultValues: {
//             items: [{
//                 to: "",
//                 amount: "",
//                 from: ""
//             }]
//         }
//     });

//     const { fields, append, remove } = useFieldArray({
//         control: form.control,
//         name: "items"
//     });

//     // Watch all form values
//     const formValues = form.watch();

//     // Add useEffect to handle validation
//     useEffect(() => {
//         fields.forEach((_, index) => {
//             const fromValue = formValues.items?.[index]?.from;
//             const amountValue = formValues.items?.[index]?.amount;
            
//             if (fromValue && amountValue) {
//                 const fromItem = budgetItems.find(item => item.dtl_id?.toString() === fromValue);
//                 const fromAmount = fromItem?.dtl_proposed_budget || 0;
//                 const enteredAmount = parseFloat(amountValue) || 0;
                
//                 if (enteredAmount > fromAmount) {
//                     form.setError(`items.${index}.amount`, {
//                         type: "manual",
//                         message: `Amount cannot exceed available ${fromAmount}`
//                     });
//                 } else {
//                     form.clearErrors(`items.${index}.amount`);
//                 }
//             }
//         });
//     }, [formValues.items, form, fields, budgetItems]);

//     const handleSubmit = (data: z.infer<typeof BudgetItemsSchema>) => {
//         console.log("Form submitted:", data);
//         // Handle form submission here
//     };

//     const handleAddItem = () => {
//         append({
//             to: "",
//             amount: "",
//             from: ""
//         });
//     };

//     // Helper function to get amount from selected option
//     const getAmountFromSelection = (id: string) => {
//         const item = budgetItems.find(item => item.dtl_id?.toString() === id);
//         return item ? item.dtl_proposed_budget : 0;
//     };

//     return (
//         <div className="h-full flex flex-col">
//             <Form {...form}>
//                 <div className="mb-3 mt-2 flex justify-end">
//                     <Button type="button" onClick={handleAddItem}>
//                         <Plus size={16} color="#fff" />
//                         Add
//                     </Button>
//                 </div>
                
//                 {/* Scrollable container */}
//                 <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
//                     <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//                         {fields.map((field, index) => {
//                             const fromValue = formValues.items?.[index]?.from;
//                             const toValue = formValues.items?.[index]?.to;
//                             const amountValue = formValues.items?.[index]?.amount;
                            
//                             const fromAmount = fromValue ? getAmountFromSelection(fromValue) : 0;
//                             const toAmount = toValue ? getAmountFromSelection(toValue) : 0;
//                             const enteredAmount = parseFloat(amountValue) || 0;
                            
//                             return (
//                                 <div key={field.id} className="mb-4 border p-4 rounded-lg">
//                                     <div className="flex flex-wrap gap-3 items-end"> 
//                                         <div className="flex-1 min-w-[250px]"> 
//                                             <FormSelect
//                                                 name={`items.${index}.from`}
//                                                 control={form.control}
//                                                 label="From"
//                                                 options={fromOptions}
//                                                 className="w-full"  
//                                             />
//                                             {fromValue && (
//                                                 <p className="text-sm text-gray-500 mt-1">
//                                                     Available: {fromAmount}
//                                                 </p>
//                                             )}
//                                         </div>

//                                         <div className="flex-1 min-w-[250px]">  
//                                             <FormSelect
//                                                 name={`items.${index}.to`}
//                                                 control={form.control}
//                                                 label="To"
//                                                 options={toOptions}
//                                                 className="w-full"
//                                             />
//                                             {toValue && (
//                                                 <p className="text-sm text-gray-500 mt-1">
//                                                     <span>Current: {toAmount}</span><br />
//                                                     <span>New: {toAmount + enteredAmount}</span>
//                                                 </p>
//                                             )}
//                                         </div>

//                                         <div className="flex-1 min-w-[150px]"> 
//                                             <FormInput
//                                                 control={form.control}
//                                                 label="Amount"
//                                                 name={`items.${index}.amount`}
//                                                 placeholder="0.00"
//                                                 type="number"
//                                                 className="w-full"
//                                             />
//                                         </div>

//                                         {fields.length > 1 && (
//                                             <Button
//                                                 type="button"
//                                                 variant="ghost"
//                                                 onClick={() => remove(index)}
//                                                 className="text-red-500 hover:text-red-700"
//                                             >
//                                                 <Trash2 size={16} />
//                                             </Button>
//                                         )}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </form>
//                 </div>

//                 {/* Submit button stays fixed at the bottom */}
//                 <div className="flex justify-end mt-3 pt-2 border-t">
//                     <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
//                         Update
//                     </Button>
//                 </div>
//             </Form>
//         </div>
//     );
// }


import { Form } from "@/components/ui/form/form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useForm } from "react-hook-form"
import { FormSelect } from "@/components/ui/form/form-select"
import { FormInput } from "@/components/ui/form/form-input"
import { BudgetItemsSchema } from "@/form-schema/treasurer/budget-item-edit-schema"
import { Button } from "@/components/ui/button/button"
import { Plus, Trash2 } from "lucide-react"
import type { BudgetPlanDetail } from "../budgetPlanInterfaces"
import { useFieldArray } from "react-hook-form"
import { useEffect } from "react"

export default function BudgetItemEditForm({ planId, budgetItems }: {
  planId: number
  budgetItems: BudgetPlanDetail[]
}) {
  const fromOptions = budgetItems.map((item) => ({
    id: item.dtl_id?.toString() || "",
    name: item.dtl_budget_item,
    value: item.dtl_id?.toString() || "",
    amount: item.dtl_proposed_budget,
  }))

  const toOptions = [...fromOptions]

  const form = useForm<z.infer<typeof BudgetItemsSchema>>({
    resolver: zodResolver(BudgetItemsSchema),
    defaultValues: {
      items: [
        {
          to: "",
          amount: "",
          from: "",
        },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const formValues = form.watch()

  useEffect(() => {
    fields.forEach((_, index) => {
      const fromValue = formValues.items?.[index]?.from
      const amountValue = formValues.items?.[index]?.amount

      if (fromValue && amountValue) {
        const fromItem = budgetItems.find((item) => item.dtl_id?.toString() === fromValue)
        const fromAmount = fromItem?.dtl_proposed_budget || 0
        const enteredAmount = Number.parseFloat(amountValue) || 0

        if (enteredAmount > fromAmount) {
          form.setError(`items.${index}.amount`, {
            type: "manual",
            message: `Amount cannot exceed available $${fromAmount.toFixed(2)}`,
          })
        } else {
          form.clearErrors(`items.${index}.amount`)
        }
      }
    })
  }, [formValues.items, form, fields, budgetItems])

  const handleSubmit = (data: z.infer<typeof BudgetItemsSchema>) => {
    console.log("Form submitted:", data)
  }

  const handleAddItem = () => {
    append({
      to: "",
      amount: "",
      from: "",
    })
  }

  const getAmountFromSelection = (id: string) => {
    const item = budgetItems.find((item) => item.dtl_id?.toString() === id)
    return item ? item.dtl_proposed_budget : 0
  }

  const calculateAvailableAmount = (index: number) => {
    const fromValue = formValues.items?.[index]?.from
    const amountValue = formValues.items?.[index]?.amount
    const fromAmount = fromValue ? Number(getAmountFromSelection(fromValue)) : 0
    const enteredAmount = Number.parseFloat(amountValue) || 0
    return (fromAmount - enteredAmount).toFixed(2)
  }

  return (
    <div className="h-full flex flex-col">
      <Form {...form}>
        <div className="mb-3 mt-2 flex justify-end">
          <Button type="button" onClick={handleAddItem}>
            <Plus size={16} color="#fff" />
            Add
          </Button>
        </div>

        {/* Header Row - Fixed above scrollable content */}
        <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-medium text-gray-600">
          <div className="col-span-3">Source Item</div>
          <div className="col-span-2 text-center">Available</div>
          <div className="col-span-3">To Budget Item</div>
          <div className="col-span-2">Transfer Amount</div>
          <div className="col-span-2">New Total</div>
        </div>

        {/* Scrollable container */}
        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {fields.map((field, index) => {
              const toValue = formValues.items?.[index]?.to
              const amountValue = formValues.items?.[index]?.amount

              const toAmount = toValue ? Number(getAmountFromSelection(toValue)) : 0
              const enteredAmount = Number.parseFloat(amountValue) || 0
              const updatedToValue = toAmount + enteredAmount
              const availableAmount = calculateAvailableAmount(index)
              const hasError = form.formState.errors.items?.[index]?.amount

              return (
                <div key={field.id} className="grid grid-cols-12 gap-4 items-center p-2 rounded-lg hover:bg-gray-50">
                  {/* Source Budget Item */}
                  <div className="col-span-3">
                    <FormSelect
                      name={`items.${index}.from`}
                      control={form.control}
                      options={fromOptions}
                    />
                  </div>

                  {/* Available Amount */}
                  <div className="col-span-2 text-center">
                    <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${
                      Number(availableAmount) < 0 ? 'text-red-600' : 'text-gray-800'
                    }`}>
                      {availableAmount}
                    </div>
                  </div>

                  {/* Destination Budget Item */}
                  <div className="col-span-3">
                    <FormSelect
                      name={`items.${index}.to`}
                      control={form.control}
                      options={toOptions}
                    />
                  </div>

                  {/* Transfer Amount */}
                  <div className="col-span-2">
                    <FormInput
                      control={form.control}
                      name={`items.${index}.amount`}
                      placeholder="0.00"
                      type="number"
                    />
                    {hasError && (
                      <p className="text-xs text-red-600 mt-1">{hasError.message}</p>
                    )}
                  </div>

                  {/* New Total & Actions */}
                  <div className="col-span-2 flex items-center justify-between">
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold text-green-600">
                      {updatedToValue.toFixed(2)}
                    </div>

                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </form>
        </div>

        {/* Fixed submit button at bottom */}
        <div className="flex justify-end mt-3 pt-2 border-t">
          <Button type="submit" onClick={form.handleSubmit(handleSubmit)}>
            Update
          </Button>
        </div>
      </Form>
    </div>
  )
}