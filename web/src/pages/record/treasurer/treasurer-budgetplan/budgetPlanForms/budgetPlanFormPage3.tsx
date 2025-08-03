import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { CurrentExpenditureMaintandOtherExpensesSchema2 } from "@/form-schema/treasurer/budgetplan-create-schema"
import { Label } from "@/components/ui/label"
import { useEffect, useState, useRef } from "react"
import { formatNumber } from "@/helpers/currencynumberformatter"
import { toast } from "sonner"

const styles = {
  fieldStyle: "flex items-center p-2",
  tabledata: "w-[16rem] flex justify-center items-center",
  formfooter: "font-bold text-blue w-[16rem] justify-center flex",
}

type BudgetPlanPage3FormData = z.infer<typeof CurrentExpenditureMaintandOtherExpensesSchema2>

interface CreateBudgetPlanPage3Props {
  form: UseFormReturn<BudgetPlanPage3FormData>
  updateFormData: (data: Partial<BudgetPlanPage3FormData>) => void
  actualRPT: number
  miscExpenseLimit: number
  isBeyondLimit: boolean
}

function CreateBudgetPlanPage3({
  form,
  updateFormData,
  actualRPT,
  miscExpenseLimit,
  isBeyondLimit,
}: CreateBudgetPlanPage3Props) {
  // page 3 budget items
  const budgetItems = [
    { name: "fidelityBond", label: "Fidelity Bond Premiums" },
    { name: "insuranceExpense", label: "Insurance Expenses" },
    { name: "gadProg", label: "GAD Program" },
    { name: "seniorProg", label: "Senior Citizen/ PWD Program" },
    { name: "juvJustice", label: "BCPC (Juvenile Justice System)" },
    { name: "badacProg", label: "BADAC Program" },
    { name: "nutritionProg", label: "Nutrition Program" },
    { name: "aidsProg", label: "Combating AIDS Program" },
    { name: "assemblyExpenses", label: "Barangay Assembly Expenses" },
    { name: "disasterProg", label: "Disaster Response Program" },
    { name: "miscExpense", label: `Extraordinary & Miscellaneous Expense (${miscExpenseLimit}%)` },
  ]

  const [total, setTotal] = useState(0.0)
  const [balance, setBalance] = useState(0)
  const [isOverLimit, setOverLimit] = useState(false)

  const budgetLimitValue = actualRPT * (miscExpenseLimit / 100)

  // Use the form passed from parent
  const { watch } = form
  const formValues = watch()
  const miscExpenseVal = watch("miscExpense")
  const miscExpenseToast = useRef<string | number | null>(null)

  useEffect(() => {
    updateFormData(formValues)
  }, [formValues, updateFormData])

  useEffect(() => {
    const calculatedTotal = Object.values(formValues).reduce((acc, val) => acc + (Number(val) || 0), 0)
    setTotal(calculatedTotal)
  }, [formValues])

  useEffect(() => {
    const MiscExpenseNum = Number(miscExpenseVal) || 0
    let remainingBal = budgetLimitValue - MiscExpenseNum

    if (Math.abs(remainingBal) < 0.01) {
      remainingBal = 0
    }

    setBalance(remainingBal)
    if (remainingBal < 0) {
      setOverLimit(true)
      if (!miscExpenseToast.current) {
        miscExpenseToast.current = toast.error("Input exceeds the allocated budget. Please enter a lower amount.", {
          duration: Number.POSITIVE_INFINITY,
          style: {
            border: "1px solid #f87171",
            padding: "16px",
            color: "#b91c1c",
            background: "#fef2f2",
          },
        })
      }
    } else {
      if (miscExpenseToast.current !== null) {
        setOverLimit(false)
        toast.dismiss(miscExpenseToast.current)
        miscExpenseToast.current = null
      }
    }
  }, [miscExpenseVal, budgetLimitValue])

  const onSubmit = (value: BudgetPlanPage3FormData) => {
    console.log("Submitting data for page 3:", value)
    updateFormData(value)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4">
          <div className="mb-5 bg-white p-5 w-full">
            {/* Title Section */}
            <div className="p-2 mb-4">
              <h3 className="font-semibold text-blue w-full flex justify-center">Maint. & Other Operating Expenses</h3>
            </div>

            {/* Column Headers */}
            <div className="flex items-center p-2 border-b-2 border-gray-200 mb-2">
              <div className="w-[23rem]"></div>
              <div className="w-[16rem] text-center font-semibold">Per Proposed Budget</div>
              <div className="w-[16rem] text-center font-semibold">Budgetary Limitation</div>
              <div className="w-[16rem] text-center font-semibold">Balance</div>
            </div>

            {/* Form Fields */}
            {budgetItems.map(({ name, label }) => (
              <div key={name}>
                <FormField
                  control={form.control}
                  name={name as keyof BudgetPlanPage3FormData}
                  render={({ field }) => (
                    <FormItem>
                      <div className={styles.fieldStyle}>
                        <FormLabel
                          className={
                            name.startsWith("gadProg") ||
                            name.startsWith("seniorProg") ||
                            name.startsWith("juvJustice") ||
                            name.startsWith("badacProg") ||
                            name.startsWith("nutritionProg") ||
                            name.startsWith("aidsProg") ||
                            name.startsWith("assemblyExpenses") ||
                            name.startsWith("disasterProg")
                              ? "w-[23rem] ml-7 text-black"
                              : "w-[23rem] text-black"
                          }
                        >
                          {label}
                        </FormLabel>
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
                        <div className="w-[16rem] flex justify-center">
                          {name === "miscExpense" && (
                            <Label className="font-normal">{formatNumber(budgetLimitValue)}</Label>
                          )}
                        </div>
                        <div className="w-[16rem] flex justify-center">
                          {name === "miscExpense" && <Label className="font-normal">{formatNumber(balance)}</Label>}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {name === "insuranceExpense" && (
                  <div className="p-2">
                    <Label className="font-semibold">Other Maint. & Operating Expenses</Label>
                  </div>
                )}
              </div>
            ))}

            {/* Footer with total aligned to Proposed Budget column only */}
            <div className="flex items-center p-2 border-t-2 border-gray-200 mt-4">
              <div className="w-[23rem]"></div>
              <Label className={styles.formfooter}>Total: {formatNumber(total)}</Label>
              <div className="w-[16rem]"></div>
              <div className="w-[16rem]"></div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateBudgetPlanPage3