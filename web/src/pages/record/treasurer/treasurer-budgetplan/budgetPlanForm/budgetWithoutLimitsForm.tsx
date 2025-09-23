import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import { BudgetPlanStep3Schema } from "@/form-schema/treasurer/budgetplan-schema"
import { Button } from "@/components/ui/button/button"
import { ChevronLeft } from "lucide-react"

const styles = {
  fieldStyle: "flex items-center p-2",
  formfooter: "font-bold text-blue w-[16rem] justify-center flex",
}

interface BudgetPlanWithoutLimitProps {
  form: UseFormReturn<z.infer<typeof BudgetPlanStep3Schema>>
  budgetLimit: number
  onPrevious: () => void
}

function CreateBudgetPlanWithoutLimits({
  form,
  budgetLimit,
  onPrevious,
}: BudgetPlanWithoutLimitProps) {
  const budgetItems = [
    { name: "travelingExpenses", label: "Traveling Expense" },
    { name: "trainingExpenses", label: "Training Expenses" },
    { name: "officeExpenses", label: "Office Supplies Expenses" },
    { name: "accountableExpenses", label: "Accountable Forms Expenses" },
    { name: "medExpenses", label: "Drugs and Medicine Expense" },
    { name: "waterExpenses", label: "Water Expenses" },
    { name: "electricityExpenses", label: "Electricity Expenses" },
    { name: "telephoneExpenses", label: "Telephone Expenses" },
    { name: "officeMaintenance", label: "Repair and Maintenance of Office Equipment" },
    { name: "vehicleMaintenance", label: "Repair and Maintenance of Motor Vehicle" },
    { name: "fidelityBond", label: "Fidelity Bond Premiums" },
    { name: "insuranceExpense", label: "Insurance Expenses" },
    { name: "juvJustice", label: "BCPC (Juvenile Justice System)" },
    { name: "badacProg", label: "BADAC Program" },
    { name: "nutritionProg", label: "Nutrition Program" },
    { name: "aidsProg", label: "Combating AIDS Program" },
    { name: "assemblyExpenses", label: "Barangay Assembly Expenses" },
    { name: "capitalOutlays", label: "Total Capital Outlays"},
  ]

  const [total, setTotal] = useState(0)
  const [_balance, setBalance] = useState(0)
  const [_isOverLimit, setIsOverLimit] = useState(false)
  const budgetToast = useRef<string | number | null>(null)

  const { watch } = form
  const formValues = watch()

  useEffect(() => {
    form.reset(form.getValues());
  }, [form]);

  useEffect(() => {
    const calculatedTotal = budgetItems.reduce((acc, item) => {
      const value = Number(formValues[item.name as keyof typeof formValues]) || 0
      return acc + value
    }, 0)
    setTotal(calculatedTotal)
  }, [formValues])

  useEffect(() => {
    const calculatedBalance = budgetLimit - total
    const roundedBalance = Math.round(calculatedBalance * 100) / 100
    setBalance(roundedBalance)

    if (calculatedBalance < 0) {
      setIsOverLimit(true)
      if (!budgetToast.current) {
        budgetToast.current = toast.error("Input exceeds the allocated budget. Please enter a lower amount.", {
          duration: Number.POSITIVE_INFINITY,
          style: {
            border: "1px solid rgb(225, 193, 193)",
            padding: "16px",
            color: "#b91c1c",
            background: "#fef2f2",
          },
        })
      }
    } else {
      setIsOverLimit(false)
      if (budgetToast.current !== null) {
        toast.dismiss(budgetToast.current)
        budgetToast.current = null
      }
    }
  }, [total, budgetLimit])

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="mb-4">
          <div className="mb-5 bg-white p-5 w-full">
            <div className="flex items-center p-2 border-b-2 border-gray-200 mb-2">
              <div className="w-[23rem]"></div>
              <div className="w-[16rem] text-center font-semibold">Amount</div>
            </div>

            {budgetItems.map(({ name, label }) => (
              <FormField
                key={name}
                control={form.control}
                name={name as keyof z.infer<typeof BudgetPlanStep3Schema>}
                render={({ field }) => (
                  <FormItem>
                    <div className={styles.fieldStyle}>
                      <FormLabel className="w-[23rem] text-black">{label}</FormLabel>
                      <div className="w-[16rem] flex justify-center">
                        <FormControl>
                        <Input
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value
                              field.onChange(value)
                            }}
                            placeholder="0.00"
                            type="number"
                            className="w-full"
                          />
                        </FormControl>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            <div className="flex justify-between mt-4">
              <Button type="button"  variant="outline"  onClick={onPrevious}>
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateBudgetPlanWithoutLimits