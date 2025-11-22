import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { BudgetItemsStep3Schema } from "@/form-schema/treasurer/budgetplan-schema"
import { z } from "zod"
import { UseFormReturn, useFieldArray } from "react-hook-form"
import { Button } from "@/components/ui/button/button"
import { Plus, Trash2 } from "lucide-react"

interface BudgetPlanWithoutLimitProps {
  form: UseFormReturn<z.infer<typeof BudgetItemsStep3Schema>>;
}

export default function CreateBudgetPlanWithoutLimits({
  form,
}: BudgetPlanWithoutLimitProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const addNewBudgetItem = () => {
    append({
      dtl_budget_item: "",
      dtl_proposed_budget: "",
    })
  }

  const removeBudgetItem = (index: number) => {
    remove(index)
  }

  return (
    <div className="p-4 md:p-6">
      {/* Add button */}
      <div className="flex justify-end items-center mb-6">
        <Button
          type="button"
          onClick={addNewBudgetItem}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      <Form {...form}>
        <div className="space-y-4">
          {fields.length === 0 && (
            <div className="text-center text-gray-500 italic py-6 border rounded-lg bg-gray-50">
              No budget items added yet. Click <strong>Add Item</strong> to start.
            </div>
          )}

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
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

                <div className="col-span-4 md:col-span-2 flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBudgetItem(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Form>

      {/* Footer count */}
      <div className="flex justify-end items-center mt-8 pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {fields.length} item{fields.length !== 1 ? "s" : ""} added
        </div>
      </div>
    </div>
  )
}
