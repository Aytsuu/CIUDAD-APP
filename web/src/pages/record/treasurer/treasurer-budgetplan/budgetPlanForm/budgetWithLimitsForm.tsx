import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { useEffect, useState, useRef } from "react"
import { BudgetPlanStep2Schema } from "@/form-schema/treasurer/budgetplan-schema"

const styles = {
  fieldStyle: "flex items-center p-2",
  formfooter: "font-bold text-blue w-[16rem] justify-center flex",
}

interface budgetPlanWithLimitsProps {
  form: UseFormReturn<z.infer<typeof BudgetPlanStep2Schema>>
  updateFormData: (data: Partial<z.infer<typeof BudgetPlanStep2Schema>>) => void
  onNext: () => void
}

function CreateBudgetWithLimits({
  form,
  updateFormData,
  onNext,
}: budgetPlanWithLimitsProps) {
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
    { name: "memDues", label: "Membership Dues/Contribution to Organization" },
    { name: "miscExpense", label: "Extraordinary and Miscellaneous Expense" },
    { name: "cleanAndGreen", label: "Clean & Green Environmental" },
    { name: "streetLighting", label: "Street Lighting Project" },
    { name: "rehabMultPurpose", label: "Rehabilitation of Multi-Purpose" },
    { name: "skFund", label: "Subsidy to Sangguniang Kabataan (SK) Fund" },
    { name: "qrfFund", label: "Quick Response Fund (QRF)" },
    { name: "disasterTraining", label: "Disaster Training" },
    { name: "disasterSupplies", label: "Disaster Supplies" },
    { name: "gadProg", label: "GAD Program" },
    { name: "disasterProg", label: "Disaster Response Program" },
    { name: "seniorProg", label: "Senior Citizen/ PWD Program" },
  ]

  const [_total, setTotal] = useState(0)
  const { watch, trigger } = form
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
                name={name as keyof z.infer<typeof BudgetPlanStep2Schema>}
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
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateBudgetWithLimits