// import { Form } from "@/components/ui/form/form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import type { z } from "zod"
// import { useForm } from "react-hook-form"
// import { FormSelect } from "@/components/ui/form/form-select"
// import { FormInput } from "@/components/ui/form/form-input"
// import { BudgetItemsSchema } from "@/form-schema/treasurer/budget-item-edit-schema"
// import { Button } from "@/components/ui/button/button"
// import { Plus, Trash2 } from "lucide-react"
// import type { BudgetPlanDetail } from "../budgetPlanInterfaces"
// import { useFieldArray } from "react-hook-form"
// import { useEffect } from "react"
// import { useUpdateBudgetItem } from "../queries/budgetPlanUpdateQueries"

// export default function BudgetItemEditForm({planId, budgetItems, balanceUnappropriated, budgetaryObligations, onSuccess}: {
//   planId: number;
//   budgetItems: BudgetPlanDetail[];
//   balanceUnappropriated: number;
//   budgetaryObligations: number
//   onSuccess: () => void;
// }) {
//   const {mutate: updateItems, isPending} = useUpdateBudgetItem(onSuccess);
//   const fromOptions = [
//     ...(Number(balanceUnappropriated) !== 0 ? [{
//       id: "unappropriated",
//       name: "Balance Unappropriated",
//       value: "unappropriated",
//       amount: balanceUnappropriated,
//     }] : []),
//     ...budgetItems.map((item) => ({
//       id: item.dtl_id?.toString() || "",
//       name: item.dtl_budget_item,
//       value: item.dtl_id?.toString() || "",
//       amount: item.dtl_proposed_budget,
//     }))
//   ];

//   const toOptions = [...fromOptions]

//   const form = useForm<z.infer<typeof BudgetItemsSchema>>({
//     resolver: zodResolver(BudgetItemsSchema),
//     defaultValues: {
//       items: [
//         {
//           to: "",
//           amount: "",
//           from: "",
//         },
//       ],
//     },
//   })

//   const { fields, append, remove } = useFieldArray({
//     control: form.control,
//     name: "items",
//   })

//   const formValues = form.watch()

//   useEffect(() => {
//     fields.forEach((_, index) => {
//       const fromValue = formValues.items?.[index]?.from;
//       const amountValue = formValues.items?.[index]?.amount;

//       if (fromValue && amountValue) {
//         const fromAmount = getAmountFromSelection(fromValue);
//         const enteredAmount = Number.parseFloat(amountValue) || 0;

//         if (enteredAmount > fromAmount) {
//           form.setError(`items.${index}.amount`, {
//             type: "manual",
//             message: `Amount cannot exceed available $${fromAmount.toFixed(2)}`,
//           });
//         } else {
//           form.clearErrors(`items.${index}.amount`);
//         }
//       }
//     });
//   }, [formValues.items, form, fields, budgetItems, balanceUnappropriated]);

//   const handleSubmit = (data: z.infer<typeof BudgetItemsSchema>) => {
//     const updatedItemData = data.items.flatMap(item => {
//       if (!item.from || !item.to || !item.amount) return [];
      
//       const amount = Number.parseFloat(item.amount) || 0;
//       const toItem = budgetItems.find(bi => bi.dtl_id?.toString() === item.to);
      
//       if (!toItem?.dtl_id) return [];

//       // Handle unappropriated balance case
//       if (item.from === "unappropriated") {
//         return [
//           {
//             // To item
//             dtl_id: toItem.dtl_id,
//             dtl_proposed_budget: Number(toItem.dtl_proposed_budget) + amount,
//           },
//           {
//             // Special marker for unappropriated balance update
//             dtl_id: -1, // Using -1 as a special ID for unappropriated balance
//             dtl_proposed_budget: Number(balanceUnappropriated) - amount,
//             plan_budgetaryObligations: Number(budgetaryObligations) + amount
//           }
//         ];
//       } else {
//         // Normal case (transfer between budget items)
//         const fromItem = budgetItems.find(bi => bi.dtl_id?.toString() === item.from);
//         if (!fromItem?.dtl_id) return [];

//         return [
//           {
//             // From or Source Item
//             dtl_id: fromItem.dtl_id,
//             dtl_proposed_budget: Number(fromItem.dtl_proposed_budget) - amount,                  
//           },
//           {
//             // To item
//             dtl_id: toItem.dtl_id,
//             dtl_proposed_budget: Number(toItem.dtl_proposed_budget) + amount,
//           }
//         ];
//       }
//     });

//     // Prepare history records
//     const historyRecords = data.items.flatMap(item => {
//       if (!item.from || !item.to || !item.amount) return [];
      
//       const amount = Number.parseFloat(item.amount) || 0;
//       const toItem = budgetItems.find(bi => bi.dtl_id?.toString() === item.to);
      
//       if (!toItem) return [];

//       if (item.from === "unappropriated") {
//         return {
//           bph_source_item: "Balance Unappropriated",
//           bph_to_item: toItem.dtl_budget_item,
//           bph_from_new_balance: balanceUnappropriated - amount,
//           bph_to_new_balance: Number(toItem.dtl_proposed_budget) + amount,
//           bph_to_prev_balance: Number(toItem.dtl_proposed_budget),
//           bph_from_prev_balance: balanceUnappropriated,
//           bph_transfer_amount: amount,
//           plan: planId, 
//         };
//       } else {
//         const fromItem = budgetItems.find(bi => bi.dtl_id?.toString() === item.from);
//         if (!fromItem) return [];

//         return {
//           bph_source_item: fromItem.dtl_budget_item,
//           bph_to_item: toItem.dtl_budget_item,
//           bph_from_new_balance: Number(fromItem.dtl_proposed_budget) - amount,
//           bph_to_new_balance: Number(toItem.dtl_proposed_budget) + amount,
//           bph_to_prev_balance: Number(toItem.dtl_proposed_budget),
//           bph_from_prev_balance: Number(fromItem.dtl_proposed_budget),
//           bph_transfer_amount: amount,
//           plan: planId, 
//         };
//       }
//     });

//     if (updatedItemData.length > 0) {
//       console.log("Prepared submission data:", {
//         budgetUpdates: updatedItemData,
//         historyRecords: historyRecords
//       });
//       updateItems({
//         updatedItemData: updatedItemData,
//         historyRecords: historyRecords
//       });
//     }
//   };

//   const handleAddItem = () => {
//     append({
//       to: "",
//       amount: "",
//       from: "",
//     })
//   }

//   const getAmountFromSelection = (id: string) => {
//     if (id === "unappropriated") {
//       return balanceUnappropriated;
//     }
//     const item = budgetItems.find((item) => item.dtl_id?.toString() === id);
//     return item ? item.dtl_proposed_budget : 0;
//   };

//   const calculateAvailableAmount = (index: number) => {
//     const fromValue = formValues.items?.[index]?.from
//     const amountValue = formValues.items?.[index]?.amount
//     const fromAmount = fromValue ? Number(getAmountFromSelection(fromValue)) : 0
//     const enteredAmount = Number.parseFloat(amountValue) || 0
//     return (fromAmount - enteredAmount).toFixed(2)
//   }

//   return (
//     <div className="h-full flex flex-col">
//       <Form {...form}>
//         <div className="mb-3 mt-2 flex justify-end">
//           <Button type="button" onClick={handleAddItem}>
//             <Plus size={16} color="#fff" />
//             Add
//           </Button>
//         </div>

//         {/* Header Row - Fixed above scrollable content */}
//         <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-medium text-gray-600">
//           <div className="col-span-3">Source Item</div>
//           <div className="col-span-2 text-center">Available</div>
//           <div className="col-span-3">To Budget Item</div>
//           <div className="col-span-2">Transfer Amount</div>
//           <div className="col-span-2">New Total</div>
//         </div>

//         {/* Scrollable container */}
//         <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
//           <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
//             {fields.map((field, index) => {
//               const toValue = formValues.items?.[index]?.to
//               const amountValue = formValues.items?.[index]?.amount

//               const toAmount = toValue ? Number(getAmountFromSelection(toValue)) : 0
//               const enteredAmount = Number.parseFloat(amountValue) || 0
//               const updatedToValue = toAmount + enteredAmount
//               const availableAmount = calculateAvailableAmount(index)
//               const hasError = form.formState.errors.items?.[index]?.amount

//               return (
//                 <div key={field.id} className="grid grid-cols-12 gap-4 items-center p-2 rounded-lg hover:bg-gray-50">
//                   {/* Source Budget Item */}
//                   <div className="col-span-3">
//                     <FormSelect
//                       name={`items.${index}.from`}
//                       control={form.control}
//                       options={fromOptions}
//                     />
//                   </div>

//                   {/* Available Amount */}
//                   <div className="col-span-2 text-center">
//                     <div className={`flex items-center justify-center gap-1 text-sm font-semibold ${
//                       Number(availableAmount) < 0 ? 'text-red-600' : 'text-gray-800'
//                     }`}>
//                       {availableAmount}
//                     </div>
//                   </div>

//                   {/* Destination Budget Item */}
//                   <div className="col-span-3">
//                     <FormSelect
//                       name={`items.${index}.to`}
//                       control={form.control}
//                       options={toOptions}
//                     />
//                   </div>

//                   {/* Transfer Amount */}
//                   <div className="col-span-2">
//                     <FormInput
//                       control={form.control}
//                       name={`items.${index}.amount`}
//                       placeholder="0.00"
//                       type="number"
//                     />
//                     {hasError && (
//                       <p className="text-xs text-red-600 mt-1">{hasError.message}</p>
//                     )}
//                   </div>

//                   {/* New Total & Actions */}
//                   <div className="col-span-2 flex items-center justify-between">
//                     <div className="flex items-center justify-center gap-1 text-sm font-semibold text-green-600">
//                       {updatedToValue.toFixed(2)}
//                     </div>

//                     {fields.length > 1 && (
//                       <Button
//                         type="button"
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => remove(index)}
//                         className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-2"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </Button>
//                     )}
//                   </div>
//                 </div>
//               )
//             })}
//           </form>
//         </div>

//         {/* Fixed submit button at bottom */}
//         <div className="flex justify-end mt-3 pt-2 border-t">
//           <Button type="submit" disabled={isPending} onClick={form.handleSubmit(handleSubmit)}>
//             {isPending? "Updating...": "Update"}
//           </Button>
//         </div>
//       </Form>
//     </div>
//   )
// }

import { Form } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormInput } from "@/components/ui/form/form-input";
import { BudgetItemsSchema } from "@/form-schema/treasurer/budget-item-edit-schema";
import { Button } from "@/components/ui/button/button";
import { Plus, Trash2 } from "lucide-react";
import type { BudgetPlanDetail } from "../budgetPlanInterfaces";
import { useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { useUpdateBudgetItem } from "../queries/budgetPlanUpdateQueries";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";

export default function BudgetItemEditForm({
  planId,
  budgetItems,
  balanceUnappropriated,
  budgetaryObligations,
  onSuccess,
}: {
  planId: number;
  budgetItems: BudgetPlanDetail[];
  balanceUnappropriated: number;
  budgetaryObligations: number;
  onSuccess: () => void;
}) {
  const { mutate: updateItems, isPending } = useUpdateBudgetItem(onSuccess);
  
    const fromOptions = [
    ...(Number(balanceUnappropriated) !== 0 ? [{
      id: "unappropriated",
      name: "Balance Unappropriated",
      value: "unappropriated",
      amount: balanceUnappropriated,
    }] : []),
    ...budgetItems.map((item) => ({
      id: item.dtl_id?.toString() || "",
      name: item.dtl_budget_item,
      value: item.dtl_id?.toString() || "",
      amount: item.dtl_proposed_budget,
    }))
  ];

  const toOptions = budgetItems.map((item) => ({
    id: item.dtl_id?.toString() || "",
    name: item.dtl_budget_item,
    value: item.dtl_id?.toString() || "",
    amount: item.dtl_proposed_budget,
  }));

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
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const formValues = form.watch();

  // Get all selected items except current row
  const getSelectedItems = (currentIndex: number) => {
    return formValues.items
      .filter((_, idx) => idx !== currentIndex)
      .flatMap((item) => [item.from, item.to])
      .filter(Boolean);
  };

  // Get available from options for current row
  const getAvailableFromOptions = (currentIndex: number) => {
    const selectedItems = getSelectedItems(currentIndex);
    return fromOptions.filter((option) => !selectedItems.includes(option.value));
  };

  // Get available to options for current row
  const getAvailableToOptions = (currentIndex: number) => {
    const selectedItems = getSelectedItems(currentIndex);
    return toOptions.filter((option) => !selectedItems.includes(option.value));
  };

  useEffect(() => {
    fields.forEach((_, index) => {
      const fromValue = formValues.items?.[index]?.from;
      const toValue = formValues.items?.[index]?.to;
      const amountValue = formValues.items?.[index]?.amount;

      // Validate same item selection
      if (fromValue && toValue && fromValue === toValue) {
        form.setError(`items.${index}.to`, {
          type: "manual",
          message: "Cannot transfer to the same item",
        });
      } else {
        form.clearErrors(`items.${index}.to`);
      }

      // Validate amount
      if (fromValue && amountValue) {
        const fromAmount = getAmountFromSelection(fromValue);
        const enteredAmount = Number.parseFloat(amountValue) || 0;

        if (enteredAmount > fromAmount) {
          form.setError(`items.${index}.amount`, {
            type: "manual",
            message: `Amount cannot exceed available $${fromAmount.toFixed(2)}`,
          });
        } else {
          form.clearErrors(`items.${index}.amount`);
        }
      }
    });
  }, [formValues.items, form, fields, budgetItems, balanceUnappropriated]);

  const handleSubmit = (data: z.infer<typeof BudgetItemsSchema>) => {
    const updatedItemData = data.items.flatMap((item) => {
      if (!item.from || !item.to || !item.amount) return [];

      const amount = Number.parseFloat(item.amount) || 0;
      const toItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.to);

      if (!toItem?.dtl_id) return [];

      if (item.from === "unappropriated") {
        return [
          {
            dtl_id: toItem.dtl_id,
            dtl_proposed_budget: Number(toItem.dtl_proposed_budget) + amount,
          },
          {
            dtl_id: -1,
            dtl_proposed_budget: Number(balanceUnappropriated) - amount,
            plan_budgetaryObligations: Number(budgetaryObligations) + amount,
          },
        ];
      } else {
        const fromItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.from);
        if (!fromItem?.dtl_id) return [];

        return [
          {
            dtl_id: fromItem.dtl_id,
            dtl_proposed_budget: Number(fromItem.dtl_proposed_budget) - amount,
          },
          {
            dtl_id: toItem.dtl_id,
            dtl_proposed_budget: Number(toItem.dtl_proposed_budget) + amount,
          },
        ];
      }
    });

    const historyRecords = data.items.flatMap((item) => {
      if (!item.from || !item.to || !item.amount) return [];

      const amount = Number.parseFloat(item.amount) || 0;
      const toItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.to);

      if (!toItem) return [];

      if (item.from === "unappropriated") {
        return {
          bph_source_item: "Balance Unappropriated",
          bph_to_item: toItem.dtl_budget_item,
          bph_from_new_balance: balanceUnappropriated - amount,
          bph_to_new_balance: Number(toItem.dtl_proposed_budget) + amount,
          bph_to_prev_balance: Number(toItem.dtl_proposed_budget),
          bph_from_prev_balance: balanceUnappropriated,
          bph_transfer_amount: amount,
          plan: planId,
        };
      } else {
        const fromItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.from);
        if (!fromItem) return [];

        return {
          bph_source_item: fromItem.dtl_budget_item,
          bph_to_item: toItem.dtl_budget_item,
          bph_from_new_balance: Number(fromItem.dtl_proposed_budget) - amount,
          bph_to_new_balance: Number(toItem.dtl_proposed_budget) + amount,
          bph_to_prev_balance: Number(toItem.dtl_proposed_budget),
          bph_from_prev_balance: Number(fromItem.dtl_proposed_budget),
          bph_transfer_amount: amount,
          plan: planId,
        };
      }
    });

    if (updatedItemData.length > 0) {
      updateItems({
        updatedItemData: updatedItemData,
        historyRecords: historyRecords,
      });
    }
  };

  const handleAddItem = () => {
    append({
      to: "",
      amount: "",
      from: "",
    });
    form.clearErrors();
  };

  const getAmountFromSelection = (id: string) => {
    if (id === "unappropriated") {
      return balanceUnappropriated;
    }
    const item = budgetItems.find((item) => item.dtl_id?.toString() === id);
    return item ? item.dtl_proposed_budget : 0;
  };

  const calculateAvailableAmount = (index: number) => {
    const fromValue = formValues.items?.[index]?.from;
    const amountValue = formValues.items?.[index]?.amount;
    const fromAmount = fromValue ? Number(getAmountFromSelection(fromValue)) : 0;
    const enteredAmount = Number.parseFloat(amountValue) || 0;
    return (fromAmount - enteredAmount).toFixed(2);
  };

  return (
    <div className="h-full flex flex-col">
      <Form {...form}>
        <div className="mb-3 mt-2 flex justify-end">
          <Button type="button" onClick={handleAddItem}>
            <Plus size={16} color="#fff" />
            Add
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-4 mb-2 px-2 text-xs font-medium text-gray-600">
          <div className="col-span-3">Source Item</div>
          <div className="col-span-2 text-center">Available</div>
          <div className="col-span-3">To Budget Item</div>
          <div className="col-span-2">Transfer Amount</div>
          <div className="col-span-2">New Total</div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {fields.map((field, index) => {
              const toValue = formValues.items?.[index]?.to;
              const amountValue = formValues.items?.[index]?.amount;
              const toAmount = toValue ? Number(getAmountFromSelection(toValue)) : 0;
              const enteredAmount = Number.parseFloat(amountValue) || 0;
              const updatedToValue = toAmount + enteredAmount;
              const availableAmount = calculateAvailableAmount(index);
              const hasError = form.formState.errors.items?.[index]?.amount;

              return (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-4 items-center p-2 rounded-lg hover:bg-gray-50"
                >
                  <div className="col-span-3">
                    <Controller
                      control={form.control}
                      name={`items.${index}.from`}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableFromOptions(index).map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="col-span-2 text-center">
                    <div
                      className={`flex items-center justify-center gap-1 text-sm font-semibold ${
                        Number(availableAmount) < 0 ? "text-red-600" : "text-gray-800"
                      }`}
                    >
                      {availableAmount}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <Controller
                      control={form.control}
                      name={`items.${index}.to`}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            {getAvailableToOptions(index).map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                disabled={
                                  formValues.items[index]?.from === option.value
                                }
                              >
                                {option.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {form.formState.errors.items?.[index]?.to && (
                      <p className="text-xs text-red-600 mt-1">
                        {form.formState.errors.items[index].to.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <FormInput
                      control={form.control}
                      name={`items.${index}.amount`}
                      placeholder="0.00"
                      type="number"
                    />
                    {hasError && (
                      <p className="text-xs text-red-600 mt-1">
                        {hasError.message}
                      </p>
                    )}
                  </div>

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
              );
            })}
          </form>
        </div>

        <div className="flex justify-end mt-3 pt-2 border-t">
          <Button
            type="submit"
            disabled={isPending}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </Form>
    </div>
  );
}