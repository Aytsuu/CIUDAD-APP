import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { CurrentExpenditureMaintandOtherExpensesSchema1 } from "@/form-schema/treasurer/budgetplan-create-schema"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { formatNumber } from "@/helpers/currencynumberformatter"

const styles = {
  fieldStyle: "flex items-center p-2",
  tabledata: "w-[16rem] flex justify-center items-center",
  formfooter: "font-bold text-blue w-[16rem] justify-center flex",
}

type BudgetPlanPage2FormData = z.infer<typeof CurrentExpenditureMaintandOtherExpensesSchema1>

interface CreateBudgetPlanPage2Props {
  form: UseFormReturn<BudgetPlanPage2FormData>
  updateFormData: (data: Partial<BudgetPlanPage2FormData>) => void
  isBeyondLimit: boolean
}

function CreateBudgetPlanPage2({
  form,
  updateFormData,
  isBeyondLimit,
}: CreateBudgetPlanPage2Props) {
  const budgetItems = [
    { name: "travelingExpenses", label: "Traveling Expense" },
    { name: "trainingExpenses", label: "Training Expenses" },
    { name: "officeExpenses", label: "Office Supplies Expenses" },
    { name: "accountableExpenses", label: "Accountable Forms Expenses" },
    { name: "medExpenses", label: "Drugs and Medicine Expense" },
    { name: "waterExpenses", label: "Water Expenses" },
    { name: "electricityExpenses", label: "Electricity Expenses" },
    { name: "telephoneExpenses", label: "Telephone Expenses" },
    { name: "memDues", label: "Membership Dues/Contribution to Organization" },
    { name: "officeMaintenance", label: "Repair and Maintenance of Office Equipment" },
    { name: "vehicleMaintenance", label: "Repair and Maintenance of Motor Vehicle" },
  ]

  const [total, setTotal] = useState(0)
  const [budgetLimit, setBudgetLimit] = useState(0.0)

  // Use the form passed from parent
  const { watch } = form
  const formValues = watch()
  const memDueVal = watch("memDues")

  useEffect(() => {
    updateFormData(formValues)
  }, [formValues, updateFormData])

  useEffect(() => {
    const limit = Number(memDueVal) || 0
    setBudgetLimit(limit)
  }, [memDueVal])

  useEffect(() => {
    const calculatedTotal = Object.values(formValues).reduce((acc, val) => acc + (Number(val) || 0), 0)
    setTotal(calculatedTotal)
  }, [formValues])

  const onSubmit = (value: BudgetPlanPage2FormData) => {
    console.log("Submitting Page 2 Data:", value)
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
              <FormField
                key={name}
                control={form.control}
                name={name as keyof BudgetPlanPage2FormData}
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
                      <div className="w-[16rem] flex justify-center">
                        {name === "memDues" && (
                          <Label className="font-normal">{formatNumber(budgetLimit.toString())}</Label>
                        )}
                      </div>
                      <div className="w-[16rem]"></div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {/* Footer with total aligned to Proposed Budget column only */}
            <div className="flex items-center p-2 border-t-2 border-gray-200 mt-4">
              <div className="w-[23rem]"></div>
              <Label className={styles.formfooter}>Total: {formatNumber(total.toString())}</Label>
              <div className="w-[16rem]"></div>
              <div className="w-[16rem]"></div>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateBudgetPlanPage2