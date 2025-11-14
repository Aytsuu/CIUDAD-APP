import { Form } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { FormInput } from "@/components/ui/form/form-input";
import { BudgetItemsSchema } from "@/form-schema/treasurer/budget-item-edit-schema";
import { Button } from "@/components/ui/button/button";
import { Plus, X } from "lucide-react";
import type { BudgetPlanDetail } from "../budgetPlanInterfaces";
import { useFieldArray } from "react-hook-form";
import { useEffect } from "react";
import { useUpdateBudgetItem } from "../queries/budgetPlanUpdateQueries";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetExpenseParticulars } from "../queries/budgetplanFetchQueries";
import { useGetGADBudgetYear } from "../queries/budgetplanFetchQueries";

export default function BudgetItemEditForm({ planId, budgetItems, balanceUnappropriated, budgetaryObligations, plan_year, onSuccess,
}: {
  planId: number;
  budgetItems: BudgetPlanDetail[];
  balanceUnappropriated: number;
  budgetaryObligations: number;
  plan_year: string;
  onSuccess: () => void;
}) {
  const { mutate: updateItems, isPending } = useUpdateBudgetItem(onSuccess);
  const { data: expenseData,  isLoading: isExpenseLoading,  refetch: refetchExpenseParticulars} = useGetExpenseParticulars(Number(plan_year))
  const { data: gadData, isLoading: isGADLoading, refetch: refetchGAD } = useGetGADBudgetYear(Number(plan_year))

  // Refetch when component mounts
  useEffect(() => {
    refetchExpenseParticulars();
    refetchGAD()
  }, [refetchExpenseParticulars, refetchGAD]);

  const gadTransferrableAmt = (gadData?.gbudy_budget ?? 0 ) - (gadData?.gbudy_expenses ?? 0)
  
  // Helper function to get available amount from budget plan (original)
  // Helper function to get available amount from budget plan (original)
  const getAvailableBudgetAmount = (dtl_id: string) => {
    if (dtl_id === "unappropriated") {
      return Number(balanceUnappropriated); // Convert to number
    }
    
    const budgetItem = budgetItems.find(item => item.dtl_id?.toString() === dtl_id);
    return budgetItem ? Number(budgetItem.dtl_proposed_budget) : 0;
  };

  // Helper function to get transferrable amount from expense particulars
  const getTransferrableAmount = (dtl_id: string) => {
    if (dtl_id === "unappropriated") {
      return Number(balanceUnappropriated); // Convert to number
    }
    
    const budgetItem = budgetItems.find(item => item.dtl_id?.toString() === dtl_id);
    if (!budgetItem) return 0;
    
    // If it's GAD Program, use the GAD transferrable amount
    if (budgetItem.dtl_budget_item === 'GAD Program') {
      return gadTransferrableAmt;
    }
    
    // Find corresponding expense particular by budget item name
    const expenseParticular = expenseData?.find(exp => 
      exp.name === budgetItem.dtl_budget_item
    );
    
    return expenseParticular ? Number(expenseParticular.proposedBudget) : 0;
  };

  // Source items (from) - exclude items with 0 allocated budget amount (including unappropriated if 0)
  const fromOptions = [
    ...(Number(balanceUnappropriated) > 0 ? [{
      id: "unappropriated",
      name: "Balance Unappropriated",
      value: "unappropriated",
      amount: balanceUnappropriated,
      availableAmount: balanceUnappropriated,
      transferrableAmount: balanceUnappropriated,
    }] : []),
    ...budgetItems
      .filter(item => {
        const availableAmount = getAvailableBudgetAmount(item.dtl_id?.toString() || "");
        return Number(availableAmount) > 0;
      })
      .map((item) => {
        const availableAmount = getAvailableBudgetAmount(item.dtl_id?.toString() || "");
        const transferrableAmount = getTransferrableAmount(item.dtl_id?.toString() || "");
        return {
          id: item.dtl_id?.toString() || "",
          name: item.dtl_budget_item,
          value: item.dtl_id?.toString() || "",
          amount: item.dtl_proposed_budget,
          availableAmount: availableAmount,
          transferrableAmount: transferrableAmount,
        }
      })
  ];

  // Destination items (to) - always include unappropriated regardless of amount
  const toOptions = [
    {
      id: "unappropriated",
      name: "Balance Unappropriated",
      value: "unappropriated",
      amount: balanceUnappropriated,
      availableAmount: balanceUnappropriated,
      transferrableAmount: balanceUnappropriated,
    },
    ...budgetItems.map((item) => {
      const availableAmount = getAvailableBudgetAmount(item.dtl_id?.toString() || "");
      const transferrableAmount = getTransferrableAmount(item.dtl_id?.toString() || "");
      return {
        id: item.dtl_id?.toString() || "",
        name: item.dtl_budget_item,
        value: item.dtl_id?.toString() || "",
        amount: item.dtl_proposed_budget,
        availableAmount: availableAmount,
        transferrableAmount: transferrableAmount,
      }
    })
  ];

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

  const hasSameFromAndTo = () => {
    return formValues.items.some(item => item.from && item.to && item.from === item.to);
  };

  const hasNegativeAvailableAmount = () => {
    return formValues.items.some((item) => {
      const fromValue = item.from;
      const amountValue = item.amount;
      const availableAmount = fromValue ? Number(getAvailableBudgetAmount(fromValue)) : 0;
      const enteredAmount = Number.parseFloat(amountValue) || 0;
      return (availableAmount - enteredAmount) < 0;
    });
  };

  const getSelectedItems = (currentIndex: number) => {
    return formValues.items
      .filter((_, idx) => idx !== currentIndex)
      .flatMap((item) => [item.from, item.to])
      .filter(Boolean);
  };

  const getAvailableFromOptions = (currentIndex: number) => {
    const selectedItems = getSelectedItems(currentIndex);
    return fromOptions.map((option) => ({
      ...option,
      disabled: selectedItems.includes(option.value)
    }));
  };

  const getAvailableToOptions = (currentIndex: number) => {
    const selectedItems = getSelectedItems(currentIndex);
    return toOptions.map((option) => ({
      ...option,
      disabled: selectedItems.includes(option.value) || 
               formValues.items[currentIndex]?.from === option.value
    }));
  };

  useEffect(() => {
    fields.forEach((_, index) => {
      const fromValue = formValues.items?.[index]?.from;
      const toValue = formValues.items?.[index]?.to;
      const amountValue = formValues.items?.[index]?.amount;

      if (fromValue && toValue && fromValue === toValue) {
        form.setError(`items.${index}.to`, {
          type: "manual",
          message: "Cannot transfer to the same item",
        });
      } else {
        form.clearErrors(`items.${index}.to`);
      }

      if (fromValue && amountValue) {
        const availableAmount = getAvailableBudgetAmount(fromValue);
        const enteredAmount = Number.parseFloat(amountValue) || 0;

        if (enteredAmount > availableAmount) {
          form.setError(`items.${index}.amount`, {
            type: "manual",
            message: `Amount cannot exceed allocated budget ₱${availableAmount.toFixed(2)}`,
          });
        } else {
          form.clearErrors(`items.${index}.amount`);
        }
      }
    });
  }, [formValues.items, form, fields, budgetItems, balanceUnappropriated, expenseData]);

  const handleSubmit = (data: z.infer<typeof BudgetItemsSchema>) => {
    const updatedItemData = data.items.flatMap((item) => {
      if (!item.from || !item.to || !item.amount) return [];

      const amount = Number.parseFloat(item.amount) || 0;
      
      if (item.to === "unappropriated") {
        const fromItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.from);
        if (!fromItem?.dtl_id) return [];

        return [
          {
            dtl_id: fromItem.dtl_id,
            dtl_proposed_budget: Number(fromItem.dtl_proposed_budget) - amount,
          },
          {
            dtl_id: -1,   
            dtl_proposed_budget: Number(balanceUnappropriated) + amount,
            plan_budgetaryObligations: Number(budgetaryObligations) - amount,
          },
        ];
      }
      
      if (item.from === "unappropriated") {
        const toItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.to);
        if (!toItem?.dtl_id) return [];

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
      }
      
      const fromItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.from);
      const toItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.to);
      if (!fromItem?.dtl_id || !toItem?.dtl_id) return [];

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
    });

    const historyRecords = data.items.flatMap((item) => {
      if (!item.from || !item.to || !item.amount) return [];

      const amount = Number.parseFloat(item.amount) || 0;

      if (item.to === "unappropriated") {
        const fromItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.from);
        if (!fromItem) return [];

        return {
          bph_source_item: fromItem.dtl_budget_item,
          bph_to_item: "Balance Unappropriated",
          bph_from_new_balance: Number(fromItem.dtl_proposed_budget) - amount,
          bph_to_new_balance: Number(balanceUnappropriated) + amount,
          bph_to_prev_balance: balanceUnappropriated,
          bph_from_prev_balance: Number(fromItem.dtl_proposed_budget),
          bph_transfer_amount: amount,
          plan: planId,
        };
      }

      const toItem = budgetItems.find((bi) => bi.dtl_id?.toString() === item.to);
      if (!toItem) return [];

      if (item.from === "unappropriated") {
        return {
          bph_source_item: "Balance Unappropriated",
          bph_to_item: toItem.dtl_budget_item,
          bph_from_new_balance: Number(balanceUnappropriated) - amount,
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

  // Helper to display available amount (from budget plan)
  const getAvailableAmountDisplay = (index: number) => {
    const fromValue = formValues.items?.[index]?.from;
    if (!fromValue) return { display: "0.00", original: "0.00" };
    
    const availableAmount = getAvailableBudgetAmount(fromValue);
    const amountValue = formValues.items?.[index]?.amount;
    const enteredAmount = Number.parseFloat(amountValue) || 0;
    const calculatedAvailable = (availableAmount - enteredAmount).toFixed(2);
    
    return {
      display: calculatedAvailable,
      original: availableAmount.toFixed(2)
    };
  };

  // Helper to display transferrable amount (from expense logs)
  const getTransferrableAmountDisplay = (index: number) => {
    const fromValue = formValues.items?.[index]?.from;
    if (!fromValue) return "0.00";
    
    const transferrableAmount = getTransferrableAmount(fromValue);
    const amountValue = formValues.items?.[index]?.amount;
    const enteredAmount = Number.parseFloat(amountValue) || 0;
    return (transferrableAmount - enteredAmount).toFixed(2);
  };

  if (isExpenseLoading || isGADLoading) {
      return (
          <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex justify-end">
                  <Skeleton className="h-10 w-24" />
              </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col">
      <Form {...form}>
        <div className="mb-3 mt-2 flex justify-end">
          <Button type="button" onClick={handleAddItem} disabled={isPending}>
            <Plus size={16} color="#fff" />
            Add
          </Button>
        </div>

        <div className="grid grid-cols-[2fr_1fr_1fr_2fr_1.5fr_1fr_0.5fr] gap-3 mb-2 px-2 text-xs font-medium text-gray-600">
          <div>Source Item</div>
          <div className="text-center">Allocated Budget</div>
          <div className="text-center">Transferrable</div>
          <div>To Budget Item</div>
          <div className="text-center">Transfer Amount</div>
          <div className="text-center">New Total</div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
          {fields.map((field, index) => {
            const toValue = formValues.items?.[index]?.to;
            const amountValue = formValues.items?.[index]?.amount;
            const fromValue = formValues.items?.[index]?.from;
            const toAmount = toValue ? Number(getAvailableBudgetAmount(toValue)) : 0;
            const enteredAmount = Number.parseFloat(amountValue) || 0;
            const updatedToValue = toAmount + enteredAmount;
            const availableInfo = getAvailableAmountDisplay(index);
            const transferrableDisplay = getTransferrableAmountDisplay(index);
            const isSourceSelected = !!fromValue;
            const hasSameValues = fromValue && toValue && fromValue === toValue;
            const isOverTransferLimit = Number(availableInfo.display) < 0; // Now watching allocated budget instead of transferrable

            return (
              <div
                key={field.id}
                className={`
                  grid grid-cols-[2fr_1fr_1fr_2fr_1.5fr_1fr_0.5fr] gap-3 items-start p-2 rounded-lg mb-5
                  ${isOverTransferLimit || hasSameValues ? "bg-red-50" : "hover:bg-gray-50"}
                `}
              >
                {/* 1. Source Item */}
                <div className="flex flex-col gap-1">
                  <Controller
                    control={form.control}
                    name={`items.${index}.from`}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select Item" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableFromOptions(index).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled} className="text-sm">
                              <span className="truncate">{opt.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {/* 2. Allocated Budget (Original from budget plan) */}
                <div className="text-center flex flex-col gap-1 mt-2">
                  <div
                    className={`text-sm font-semibold ${
                      isOverTransferLimit ? "text-red-600" : "text-gray-800"
                    }`}
                  >
                    ₱{availableInfo.display}
                  </div>
                </div>

                {/* 3. Transferrable (From expense logs) */}
                <div className="text-center flex flex-col gap-1 mt-2">
                  <div className="text-sm font-semibold text-blue-600">
                    ₱{transferrableDisplay}
                  </div>
                </div>

                {/* 4. To Budget Item */}
                <div className="flex flex-col gap-1">
                  <Controller
                    control={form.control}
                    name={`items.${index}.to`}
                    render={({ field }) => (
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                        disabled={!isSourceSelected}
                      >
                        <SelectTrigger className={`h-9 text-sm ${!isSourceSelected ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <SelectValue placeholder="Select Item" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableToOptions(index).map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled} className="text-sm">
                              <span className="truncate">{opt.name}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.items?.[index]?.to && (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {form.formState.errors.items[index].to.message}
                    </p>
                  )}
                </div>

                {/* 5. Transfer Amount */}
                <div className="flex flex-col gap-1">
                  <FormInput
                    control={form.control}
                    name={`items.${index}.amount`}
                    placeholder="0.00"
                    type="number"
                    readOnly={!isSourceSelected}
                    className={`h-9 text-sm ${!isSourceSelected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                </div>

                {/* 6. New Total */}
                <div className="text-center flex flex-col gap-1 mt-2">
                  <span className="text-sm font-semibold text-green-600">
                    ₱{updatedToValue.toFixed(2)}
                  </span>
                </div>

                {/* 7. Delete Action */}
                <div className="flex items-center justify-center">
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end mt-3 pt-2 border-t">
          <Button
            type="submit"
            disabled={isPending || hasNegativeAvailableAmount() || hasSameFromAndTo()}
            onClick={form.handleSubmit(handleSubmit)}
          >
            {isPending ? "Updating..." : "Update"}
          </Button>
        </div>
      </Form>
    </div>
  );
}