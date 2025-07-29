import { Form } from "@/components/ui/form/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormInput } from "@/components/ui/form/form-input";
import { BudgetItemsSchema } from "@/form-schema/treasurer/budget-item-edit-schema";
import { Button } from "@/components/ui/button/button";
import { Plus, Trash2 } from "lucide-react";
import { BudgetPlanDetail } from "../budgetPlanInterfaces";
import { useFieldArray } from "react-hook-form";


export default function BudgetItemEditForm({ planId, budgetItems }: {
    planId: number;
    budgetItems: BudgetPlanDetail[]
}) {
  // Create options from budget items
  const fromOptions = budgetItems.map((item) => ({
    id: item.dtl_budget_item,
    name: `${item.dtl_budget_item} (${item.dtl_proposed_budget})`,
    value: item.dtl_id?.toString() || ""
  }));

  const toOptions = [...fromOptions];

  const form = useForm<z.infer<typeof BudgetItemsSchema>>({
    resolver: zodResolver(BudgetItemsSchema),
    defaultValues: {
      items: [{
        to: "",
        amount: "",
        from: ""
      }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  const handleSubmit = (data: z.infer<typeof BudgetItemsSchema>) => {
    console.log("Form submitted:", data);
    // Handle form submission here
  };

  const handleAddItem = () => {
    append({
      to: "",
      amount: "",
      from: ""
    });
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
              
              {/* Scrollable container */}
              <div className="flex-1 overflow-y-auto max-h-[calc(100vh-300px)] pr-2">
                  <form onSubmit={form.handleSubmit(handleSubmit)}>
                      {fields.map((field, index) => (
                          <div key={field.id} className="mb-4">
                              <div className="flex flex-wrap gap-3 items-end"> 
                                  <div className="flex-1 min-w-[250px]"> 
                                      <FormSelect
                                          name={`items.${index}.from`}
                                          control={form.control}
                                          label="From"
                                          options={fromOptions}
                                          className="w-full"  
                                      />
                                  </div>

                                  <div className="flex-1 min-w-[150px]"> 
                                      <FormInput
                                          control={form.control}
                                          label="Amount"
                                          name={`items.${index}.amount`}
                                          placeholder="0.00"
                                          type="number"
                                          className="w-full"
                                      />
                                  </div>

                                  <div className="flex-1 min-w-[250px]">  
                                      <FormSelect
                                          name={`items.${index}.to`}
                                          control={form.control}
                                          label="To"
                                          options={toOptions}
                                          className="w-full"
                                      />
                                  </div>

                                  {fields.length > 1 && (
                                      <Button
                                          type="button"
                                          variant="ghost"
                                          onClick={() => remove(index)}
                                          className="text-red-500 hover:text-red-700"
                                      >
                                          <Trash2 size={16} />
                                      </Button>
                                  )}
                              </div>
                          </div>
                      ))}
                  </form>
              </div>

              {/* Submit button stays fixed at the bottom */}
              <div className="flex justify-end mt-3 pt-2 border-t">
                  <Button type="submit">Update</Button>
              </div>
          </Form>
      </div>
  );
}