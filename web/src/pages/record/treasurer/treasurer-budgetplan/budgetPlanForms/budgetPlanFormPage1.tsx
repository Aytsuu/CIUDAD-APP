import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { CurrentExpendituresPersonalServicesSchema } from "@/form-schema/treasurer/budgetplan-create-schema"
import { Label } from "@/components/ui/label"
import { useEffect, useState, useRef } from "react"
import { formatNumber } from "@/helpers/currencynumberformatter"
import { toast } from "sonner"

const styles = {
  fieldStyle: "flex items-center p-2",
  formfooter: "font-bold text-blue w-[16rem] justify-center flex",
}

type BudgetPlanPage1FormData = z.infer<typeof CurrentExpendituresPersonalServicesSchema>

interface CreateBudgetPlanPage1Props {
  form: UseFormReturn<BudgetPlanPage1FormData>
  updateFormData: (data: Partial<BudgetPlanPage1FormData>) => void
  personalServicesLimit: number
  actualIncome: number
  isBeyondLimit: boolean
}

function CreateBudgetPlanPage1({
  form,
  updateFormData,
  personalServicesLimit,
  actualIncome,
  isBeyondLimit,
}: CreateBudgetPlanPage1Props) {
  // Page 1 budget items
  const budgetItems = [
    { name: "honorariaOfficials", label: "Honoraria for Officials" },
    { name: "cashOfficials", label: "Cash Gift for Officials" },
    { name: "midBonusOfficials", label: "Mid-Year Bonus for Officials" },
    { name: "endBonusOfficials", label: "Year-End Bonus for Officials" },
    { name: "honorariaTanods", label: "Honoraria for Tanods" },
    { name: "honorariaLupon", label: "Honoraria for Lupon Members" },
    { name: "honorariaBarangay", label: "Honoraria for Barangay Workers" },
    { name: "prodEnhancement", label: "Productivity Enhancement Incentive" },
    { name: "leaveCredits", label: "Commutation of Leave Credits" },
  ]

  const [total, setTotal] = useState(0)
  const [Balance, setBalance] = useState(0)
  const [isOverLimit, setOverLimit] = useState(false)
  const personalServicesBudgetLimit = actualIncome * (personalServicesLimit / 100)

  // Fields Watcher
  const { watch } = form
  const formValues = watch()
  const personalServiceToast = useRef<string | number | null>(null)

  // Auto Update
  useEffect(() => {
    updateFormData(formValues)
  }, [formValues, updateFormData])

  useEffect(() => {
    const calculatedTotal = Object.values(formValues).reduce((acc, val) => acc + (Number(val) || 0), 0)
    setTotal(calculatedTotal)
  }, [formValues])

  useEffect(() => {
    let calculatedBalance = personalServicesBudgetLimit - total

    if (Math.abs(calculatedBalance) < 0.01) {
      calculatedBalance = 0
    }

    setBalance(calculatedBalance)

    if (calculatedBalance < 0) {
      setOverLimit(true)
      if (!personalServiceToast.current) {
        personalServiceToast.current = toast.error("Input exceeds the allocated budget. Please enter a lower amount.", {
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
      if (personalServiceToast.current !== null) {
        setOverLimit(false)
        toast.dismiss(personalServiceToast.current)
        personalServiceToast.current = null
      }
    }
  }, [total, personalServicesBudgetLimit])

  const onSubmit = (value: BudgetPlanPage1FormData) => {
    console.log("Submitting Page 1 Data:", value)
    updateFormData(value)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4">
          <div className="mb-5 bg-white p-5 w-full">
            {/* Title Section */}
            <div className="p-2 flex flex-col gap-1 mb-4">
              <h1 className="font-bold flex justify-center w-full">CURRENT OPERATING EXPENDITURES</h1>
              <h3 className="font-semibold text-blue flex justify-center w-full">
                Personal Services ({personalServicesLimit}%)
              </h3>
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
                name={name as keyof BudgetPlanPage1FormData}
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
                      <div className="w-[16rem]"></div>
                      <div className="w-[16rem]"></div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}

            {/* Footer with totals aligned to columns */}
            <div className="flex items-center p-2 border-t-2 border-gray-200 mt-4">
              <div className="w-[23rem]"></div>
              <Label className={styles.formfooter}>Total: {formatNumber(total)}</Label>
              <Label className={styles.formfooter}>{formatNumber(personalServicesBudgetLimit)}</Label>
              <Label className={styles.formfooter}>{formatNumber(Balance)}</Label>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateBudgetPlanPage1