// import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
// import { UseFormReturn } from "react-hook-form"
// import type { z } from "zod"
// import { Input } from "@/components/ui/input"
// import { useEffect, useState, useRef } from "react"
// import { toast } from "sonner"
// import { BudgetPlanStep3Schema } from "@/form-schema/treasurer/budgetplan-schema"
// import { Button } from "@/components/ui/button/button"
// import { ChevronLeft } from "lucide-react"
// import { BudgetItemsStep3Schema } from "@/form-schema/treasurer/budgetplan-schema"

// const styles = {
//   fieldStyle: "flex items-center p-2",
//   formfooter: "font-bold text-blue w-[16rem] justify-center flex",
// }

// interface BudgetPlanWithoutLimitProps {
//   form: UseFormReturn<z.infer<typeof BudgetPlanStep3Schema>>
//   budgetLimit: number
//   onPrevious: () => void
// }

// function CreateBudgetPlanWithoutLimits({
//   form,
//   budgetLimit,
//   onPrevious,
// }: BudgetPlanWithoutLimitProps) {
//   const budgetItems = [
//     { name: "travelingExpenses", label: "Traveling Expense" },
//     { name: "trainingExpenses", label: "Training Expenses" },
//     { name: "officeExpenses", label: "Office Supplies Expenses" },
//     { name: "accountableExpenses", label: "Accountable Forms Expenses" },
//     { name: "medExpenses", label: "Drugs and Medicine Expense" },
//     { name: "waterExpenses", label: "Water Expenses" },
//     { name: "electricityExpenses", label: "Electricity Expenses" },
//     { name: "telephoneExpenses", label: "Telephone Expenses" },
//     { name: "officeMaintenance", label: "Repair and Maintenance of Office Equipment" },
//     { name: "vehicleMaintenance", label: "Repair and Maintenance of Motor Vehicle" },
//     { name: "fidelityBond", label: "Fidelity Bond Premiums" },
//     { name: "insuranceExpense", label: "Insurance Expenses" },
//     { name: "juvJustice", label: "BCPC (Juvenile Justice System)" },
//     { name: "badacProg", label: "BADAC Program" },
//     { name: "nutritionProg", label: "Nutrition Program" },
//     { name: "aidsProg", label: "Combating AIDS Program" },
//     { name: "assemblyExpenses", label: "Barangay Assembly Expenses" },
//     { name: "capitalOutlays", label: "Total Capital Outlays"},
//   ]

//   const [total, setTotal] = useState(0)
//   const [_balance, setBalance] = useState(0)
//   const [_isOverLimit, setIsOverLimit] = useState(false)
//   const budgetToast = useRef<string | number | null>(null)

//   const { watch } = form
//   const formValues = watch()

//   useEffect(() => {
//     form.reset(form.getValues());
//   }, [form]);

//   useEffect(() => {
//     const calculatedTotal = budgetItems.reduce((acc, item) => {
//       const value = Number(formValues[item.name as keyof typeof formValues]) || 0
//       return acc + value
//     }, 0)
//     setTotal(calculatedTotal)
//   }, [formValues])

//   useEffect(() => {
//     const calculatedBalance = budgetLimit - total
//     const roundedBalance = Math.round(calculatedBalance * 100) / 100
//     setBalance(roundedBalance)

//     if (calculatedBalance < 0) {
//       setIsOverLimit(true)
//       if (!budgetToast.current) {
//         budgetToast.current = toast.error("Input exceeds the allocated budget. Please enter a lower amount.", {
//           duration: Number.POSITIVE_INFINITY,
//           style: {
//             border: "1px solid rgb(225, 193, 193)",
//             padding: "16px",
//             color: "#b91c1c",
//             background: "#fef2f2",
//           },
//         })
//       }
//     } else {
//       setIsOverLimit(false)
//       if (budgetToast.current !== null) {
//         toast.dismiss(budgetToast.current)
//         budgetToast.current = null
//       }
//     }
//   }, [total, budgetLimit])

//   return (
//     <Form {...form}>
//       <form onSubmit={(e) => e.preventDefault()}>
//         <div className="mb-4">
//           <div className="mb-5 bg-white p-5 w-full">
//             <div className="flex items-center p-2 border-b-2 border-gray-200 mb-2">
//               <div className="w-[23rem]"></div>
//               <div className="w-[16rem] text-center font-semibold">Amount</div>
//             </div>

//             {budgetItems.map(({ name, label }) => (
//               <FormField
//                 key={name}
//                 control={form.control}
//                 name={name as keyof z.infer<typeof BudgetPlanStep3Schema>}
//                 render={({ field }) => (
//                   <FormItem>
//                     <div className={styles.fieldStyle}>
//                       <FormLabel className="w-[23rem] text-black">{label}</FormLabel>
//                       <div className="w-[16rem] flex justify-center">
//                         <FormControl>
//                         <Input
//                             {...field}
//                             value={field.value || ""}
//                             onChange={(e) => {
//                               const value = e.target.value
//                               field.onChange(value)
//                             }}
//                             placeholder="0.00"
//                             type="number"
//                             className="w-full"
//                           />
//                         </FormControl>
//                       </div>
//                     </div>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             ))}

//             <div className="flex justify-between mt-4">
//               <Button type="button"  variant="outline"  onClick={onPrevious}>
//                 <ChevronLeft className="w-4 h-4" />
//                 Previous
//               </Button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </Form>
//   )
// }

// export default CreateBudgetPlanWithoutLimits

// import { Form } from "@/components/ui/form/form"
// import { FormInput } from "@/components/ui/form/form-input"
// import { BudgetItemsStep3Schema } from "@/form-schema/treasurer/budgetplan-schema"
// import {z} from "zod"
// import { UseFormReturn } from "react-hook-form"
// import { Button } from "@/components/ui/button/button"
// import { ChevronLeft, Plus, Trash2 } from "lucide-react"
// import { useFieldArray } from "react-hook-form"
// import { useEffect } from "react"

// interface BudgetPlanWithoutLimitProps {
//   form: UseFormReturn<z.infer<typeof BudgetItemsStep3Schema>>;
//   budgetLimit: number;
//   onPrevious: () => void;
// }

// export default function CreateBudgetPlanWithoutLimits({ 
//   form, 
//   budgetLimit, 
//   onPrevious 
// }: BudgetPlanWithoutLimitProps) {
  
//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "items"
//   });

//   useEffect(() => {
//     if (fields.length === 0) {
//       append({
//         dtl_budget_item: "",
//         dtl_proposed_budget: "",
//       });
//     }
//   }, [fields.length, append]);

//   const addNewBudgetItem = () => {
//     append({
//       dtl_budget_item: "",
//       dtl_proposed_budget: "",
//     });
//   };

//   const removeBudgetItem = (index: number) => {
//     remove(index);
//   };

//       // const clearAllItems = () => {
//       //   while (fields.length > 0) {
//       //     remove(0);
//       //   }
//       //   append({
//       //     dtl_budget_item: "",
//       //     dtl_proposed_budget: "",
//       //   });
//       // };

//   return(
//     <div className="p-4 md:p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-xl font-semibold text-gray-800">Budget Items Without Limits</h2>
//         <div className="flex gap-2">
//           <Button 
//             type="button" 
//             onClick={addNewBudgetItem}
//             className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
//           >
//             <Plus className="w-4 h-4" />
//             Add Item
//           </Button>
//           {/* {fields.length > 0 && (
//             <Button 
//               type="button" 
//               onClick={clearAllItems}
//               variant="outline"
//               className="text-red-600 hover:text-red-700 hover:bg-red-50"
//             >
//               Clear All
//             </Button>
//           )} */}
//         </div>
//       </div>

//       <Form {...form}>
//         <div className="space-y-4">
//           {fields.map((field, index) => (
//             <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">  
//               <div className="flex items-start gap-4">
//                 {/* Input fields container */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
//                   <FormInput
//                     name={`items.${index}.dtl_budget_item`}
//                     label="Budget Item Name"
//                     control={form.control}
//                     placeholder="Enter budget item name"
//                   />
                  
//                   <FormInput
//                     name={`items.${index}.dtl_proposed_budget`}
//                     label="Proposed Budget (₱)"
//                     control={form.control}
//                     type="number"
//                   />
//                 </div>

//                 {/* Delete button aligned to top right */}
                
//                 <Button
//                   type="button" 
//                   variant="outline"
//                   onClick={() => removeBudgetItem(index)}
//                   className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 mt-2"
//                 >
//                   <Trash2 className="w-4 h-4" />
//                 </Button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </Form>

//       {/* Navigation */}
//       <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
//         <Button 
//           variant="outline" 
//           onClick={onPrevious}
//           className="flex items-center gap-2"
//         >
//           <ChevronLeft className="w-4 h-4" />
//           Back to Previous Section
//         </Button>
//       </div>
//     </div>
//   );
// }

  import { Form } from "@/components/ui/form/form"
  import { FormInput } from "@/components/ui/form/form-input"
  import { BudgetItemsStep3Schema } from "@/form-schema/treasurer/budgetplan-schema"
  import {z} from "zod"
  import { UseFormReturn } from "react-hook-form"
  import { Button } from "@/components/ui/button/button"
  import { Plus, Trash2 } from "lucide-react"
  import { useFieldArray } from "react-hook-form"
  import { useEffect } from "react"

  interface BudgetPlanWithoutLimitProps {
    form: UseFormReturn<z.infer<typeof BudgetItemsStep3Schema>>;
  }

  export default function CreateBudgetPlanWithoutLimits({ 
    form, 
  }: BudgetPlanWithoutLimitProps) {
    
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "items"
    });

    useEffect(() => {
      if (fields.length === 0) {
        append({
          dtl_budget_item: "",
          dtl_proposed_budget: "",
        });
      }
    }, [fields.length, append]);

    const addNewBudgetItem = () => {
      append({
        dtl_budget_item: "",
        dtl_proposed_budget: "",
      });
    };

    const removeBudgetItem = (index: number) => {
      remove(index);
    };

    return(
      <div className="p-4 md:p-6">
        <div className="flex justify-end items-center mb-6">
          <div className="flex gap-2">
            <Button 
              type="button" 
              onClick={addNewBudgetItem}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors">  
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Input fields taking most of the space - similar to inspiration form layout */}
                  <div className="col-span-8 md:col-span-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormInput
                        name={`items.${index}.dtl_budget_item`}
                        label="Budget Item Name"
                        control={form.control}
                        placeholder="Enter budget item name"
                      />
                      
                      <FormInput
                        name={`items.${index}.dtl_proposed_budget`}
                        label="Proposed Budget (₱)"
                        control={form.control}
                        type="number"
                      />
                    </div>
                  </div>

                  {/* Delete button aligned to the right - only show when more than 1 field */}
                  <div className="col-span-4 md:col-span-2 flex justify-center">
                    {fields.length > 1 && (
                      <Button
                        type="button" 
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBudgetItem(index)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Form>

        {/* Navigation */}
        <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {fields.length} item{fields.length !== 1 ? 's' : ''} added
          </div>
        </div>
      </div>
    );
  }