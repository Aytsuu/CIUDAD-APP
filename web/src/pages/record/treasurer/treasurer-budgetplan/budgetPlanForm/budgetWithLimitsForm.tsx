// import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
// import { UseFormReturn } from "react-hook-form"
// import type { z } from "zod"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { useEffect, useState, useRef } from "react"
// import { formatNumber } from "@/helpers/currencynumberformatter"
// import { toast } from "sonner"
// import { BudgetPlanStep2Schema } from "@/form-schema/treasurer/budgetplan-schema"
// import { Button } from "@/components/ui/button/button"

// const styles = {
//   fieldStyle: "flex items-center p-2",
//   formfooter: "font-bold text-blue w-[16rem] justify-center flex",
// }

// interface budgetPlanWithLimitsProps {
//   form: UseFormReturn<z.infer<typeof BudgetPlanStep2Schema>>
//   updateFormData: (data: Partial<z.infer<typeof BudgetPlanStep2Schema>>) => void
//   budgetLimit: number
//   onNext: () => void
// }

// function CreateBudgetWithLimits({
//   form,
//   updateFormData,
//   budgetLimit,
//   onNext,
// }: budgetPlanWithLimitsProps) {
//   // Budget items
//   const budgetItems = [
//     { name: "honorariaOfficials", label: "Honoraria for Officials" },
//     { name: "cashOfficials", label: "Cash Gift for Officials" },
//     { name: "midBonusOfficials", label: "Mid-Year Bonus for Officials" },
//     { name: "endBonusOfficials", label: "Year-End Bonus for Officials" },
//     { name: "honorariaTanods", label: "Honoraria for Tanods" },
//     { name: "honorariaLupon", label: "Honoraria for Lupon Members" },
//     { name: "honorariaBarangay", label: "Honoraria for Barangay Workers" },
//     { name: "prodEnhancement", label: "Productivity Enhancement Incentive" },
//     { name: "leaveCredits", label: "Commutation of Leave Credits" },
//     { name: "memDues", label: "Membership Dues/Contribution to Organization" },
//     { name: "miscExpense", label: "Extraordinary and Miscellaneous Expense" },
//     { name: "cleanAndGreen", label: "Clean & Green Environmental" },
//     { name: "streetLighting", label: "Street Lighting Project" },
//     { name: "rehabMultPurpose", label: "Rehabilitation of Multi-Purpose" },
//     { name: "skFund", label: "Subsidy to Sangguniang Kabataan (SK) Fund" },
//     { name: "qrfFund", label: "Quick Response Fund (QRF)" },
//     { name: "disasterTraining", label: "Disaster Training" },
//     { name: "disasterSupplies", label: "Disaster Supplies" },
//   ]

//   const [total, setTotal] = useState(0)
//   const [balance, setBalance] = useState(0)
//   const [isOverLimit, setIsOverLimit] = useState(false)
//   const budgetToast = useRef<string | number | null>(null)

//   // Fields Watcher
//   const { watch } = form
//   const formValues = watch()

//   // Auto Update
//   useEffect(() => {
//     updateFormData(formValues)
//   }, [formValues, updateFormData])

//   // Calculate total whenever form values change
//   useEffect(() => {
//     const calculatedTotal = budgetItems.reduce((acc, item) => {
//       const value = Number(formValues[item.name as keyof typeof formValues]) || 0
//       return acc + value
//     }, 0)
//     setTotal(calculatedTotal)
//   }, [formValues])

//   // Calculate balance and check if over limit
//   useEffect(() => {
//     const calculatedBalance = budgetLimit - total

//     // Handle floating point precision issues
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
//       <form>
//         <div className="mb-4">
//           <div className="mb-5 bg-white p-5 w-full">
//             {/* Title Section */}
//             {/* <div className="p-2 flex flex-col gap-1 mb-4">
//               <h1 className="font-bold flex justify-center w-full">BUDGET PLAN</h1>
//               <h3 className="font-semibold text-blue flex justify-center w-full">
//                 Budget Allocation
//               </h3>
//             </div> */}

//             {/* Column Headers */}
//             <div className="flex items-center p-2 border-b-2 border-gray-200 mb-2">
//               <div className="w-[23rem]"></div>
//               <div className="w-[16rem] text-center font-semibold">Amount</div>
//             </div>

//             {/* Form Fields */}
//             {budgetItems.map(({ name, label }) => (
//               <FormField
//                 key={name}
//                 control={form.control}
//                 name={name as keyof z.infer<typeof BudgetPlanStep2Schema>}
//                 render={({ field }) => (
//                   <FormItem>
//                     <div className={styles.fieldStyle}>
//                       <FormLabel className="w-[23rem] text-black">{label}</FormLabel>
//                       <div className="w-[16rem] flex justify-center">
//                         <FormControl>
//                          <Input
//                             {...field}
//                             value={field.value || ""}
//                             onChange={(e) => {
//                               const value = e.target.value
//                               field.onChange(value === "" ? undefined : Number(value))
//                             }}
//                             placeholder="0.00"
//                             type="number"
//                             className="w-full"
//                             min="0"
//                             step="0.01"
//                           />
//                         </FormControl>
//                       </div>
//                       {/* <div className="w-[16rem] text-center">
//                         {name === "honorariaOfficials" ? formatNumber(budgetLimit) : ""}
//                       </div>
//                       <div className="w-[16rem] text-center">
//                         {name === "honorariaOfficials" ? formatNumber(balance) : ""}
//                       </div> */}
//                     </div>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             ))}

//             {/* Footer with totals */}
//             {/* <div className="flex items-center p-2 border-t-2 border-gray-200 mt-4">
//               <div className="w-[23rem] font-bold">Total</div>
//               <Label className={styles.formfooter}>{formatNumber(total)}</Label>
//               <Label className={styles.formfooter}>{formatNumber(budgetLimit)}</Label>
//               <Label className={`${styles.formfooter} ${isOverLimit ? "text-red-500" : ""}`}>
//                 {formatNumber(balance)}
//               </Label>
//             </div> */}
//             <div className="flex justify-end mt-4">
//               <Button  onClick={onNext}>
//                 Next
//               </Button>
//             </div>
//           </div>
//         </div>
//       </form>
//     </Form>
//   )
// }

// export default CreateBudgetWithLimits

import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { UseFormReturn } from "react-hook-form"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState, useRef } from "react"
import { formatNumber } from "@/helpers/currencynumberformatter"
import { toast } from "sonner"
import { BudgetPlanStep2Schema } from "@/form-schema/treasurer/budgetplan-schema"
import { Button } from "@/components/ui/button/button"
import { ChevronRightIcon } from "lucide-react"

const styles = {
  fieldStyle: "flex items-center p-2",
  formfooter: "font-bold text-blue w-[16rem] justify-center flex",
}

interface budgetPlanWithLimitsProps {
  form: UseFormReturn<z.infer<typeof BudgetPlanStep2Schema>>
  updateFormData: (data: Partial<z.infer<typeof BudgetPlanStep2Schema>>) => void
  budgetLimit: number
  onNext: () => void
}

function CreateBudgetWithLimits({
  form,
  updateFormData,
  budgetLimit,
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
  ]

  const [total, setTotal] = useState(0)
  const [balance, setBalance] = useState(0)
  const [isOverLimit, setIsOverLimit] = useState(false)
  const budgetToast = useRef<string | number | null>(null)

  const { watch, trigger } = form
  const formValues = watch()

  useEffect(() => {
    // Reset form with latest values whenever they change
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

  const handleNextClick = async () => {
    const isValid = await trigger()
    if (isValid) {
      updateFormData(formValues)
      onNext()
    }
  }

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

            <div className="flex justify-end mt-4">
              <Button  onClick={handleNextClick} disabled={isOverLimit} className="flex items-center gap-2" >
                Next <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateBudgetWithLimits