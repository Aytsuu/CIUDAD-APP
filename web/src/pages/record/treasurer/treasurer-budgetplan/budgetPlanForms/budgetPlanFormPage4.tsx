import { Form, FormItem, FormField, FormLabel, FormMessage, FormControl } from "@/components/ui/form/form"
import { UseFormReturn } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Input } from "@/components/ui/input"
import { CapitalOutlaysAndNonOfficeSchema } from "@/form-schema/treasurer/budgetplan-create-schema"
import { Label } from "@/components/ui/label"
import { useEffect, useRef, useState } from "react"
import { formatNumber } from "@/helpers/currencynumberformatter"
import { toast } from "sonner"

const styles = {
  fieldStyle: "flex items-center p-2",
  tabledata: "w-[16rem] flex justify-center items-center",
  formfooter: "font-bold text-blue w-[16rem] justify-center flex",
}

type BudgetPlanPage4FormData = z.infer<typeof CapitalOutlaysAndNonOfficeSchema>

interface CreateBudgetPlanPage4Props {
  form: UseFormReturn<BudgetPlanPage4FormData>
  updateFormData: (data: Partial<BudgetPlanPage4FormData>) => void
  balance: string
  realtyTaxShare: string
  taxAllotment: string
  clearanceAndCertFees: string
  otherSpecificIncome: string
  localDevLimit: string
  skFundLimit: string
  calamityFundLimit: string
  isBeyondLimit: boolean
}

function CreateBudgetPlanPage4({
  form,
  updateFormData,
  balance,
  realtyTaxShare,
  taxAllotment,
  clearanceAndCertFees,
  otherSpecificIncome,
  localDevLimit,
  skFundLimit,
  calamityFundLimit,
  isBeyondLimit,
}: CreateBudgetPlanPage4Props) {
  // page 4 budget items
  const budgetItems = [
    { name: "capitalOutlays", label: "Total Capital Outlays" },
    { name: "cleanAndGreen", label: "Clean & Green Environmental" },
    { name: "streetLighting", label: "Street Lighting Project" },
    { name: "rehabMultPurpose", label: "Rehabilitation of Multi-Purpose" },
    { name: "skFund", label: "Subsidy to Sangguniang Kabataan (SK) Fund" },
    { name: "qrfFund", label: "Quick Response Fund (QRF)" },
    { name: "disasterTraining", label: "Disaster Training" },
    { name: "disasterSupplies", label: "Disaster Supplies" },
  ]

  const availableResources =
    Number.parseFloat(balance) +
    Number.parseFloat(realtyTaxShare) +
    Number.parseFloat(taxAllotment) +
    Number.parseFloat(clearanceAndCertFees) +
    Number.parseFloat(otherSpecificIncome)

  const [totalOutlays, setTotalOutlays] = useState(0.0)
  const [totalDevFund, settotalDevFund] = useState(0.0)
  const [totalCalamityFund, settotalCalamityFund] = useState(0.0)
  const [skFundBalance, setskFundBalance] = useState(0.0)
  const [calamityFundBalance, setcalamityFundBalance] = useState(0.0)
  const [localDevBalance, setlocalDevBalance] = useState(0.0)
  const [isOverLimit, setOverLimit] = useState(false)

  const capitalAndNonOfficeToast = useRef<string | number | null>(null)
  const localDevBudgetLimit = Number.parseFloat(taxAllotment) * (Number.parseFloat(localDevLimit) / 100)
  const skBudgetLimit = availableResources * (Number.parseFloat(skFundLimit) / 100)
  const calamityFundBudgetLimit = availableResources * (Number.parseFloat(calamityFundLimit) / 100)

  // Use the form passed from parent
  const { watch } = form
  const formValues = watch()
  const capitalOutlaysVal = watch("capitalOutlays")
  const localDevVal = watch(["cleanAndGreen", "streetLighting", "rehabMultPurpose"])
  const calamityFundVal = watch(["qrfFund", "disasterTraining", "disasterSupplies"])
  const skVal = watch("skFund")

  useEffect(() => {
    updateFormData(formValues)
  }, [formValues, updateFormData])

  // localDev
  useEffect(() => {
    const calculatedTotal = Object.values(localDevVal).reduce((acc, val) => acc + (Number(val) || 0), 0)
    const remainingBal = localDevBudgetLimit - calculatedTotal
    const normalizedBal = Math.abs(remainingBal) < 0.01 ? 0 : remainingBal
    settotalDevFund(calculatedTotal)
    setlocalDevBalance(normalizedBal)
    displayToast()
  }, [localDevVal, localDevBudgetLimit])

  // Calamity Fund
  useEffect(() => {
    const calculatedTotal = Object.values(calamityFundVal).reduce((acc, val) => acc + (Number(val) || 0), 0)
    const remainingBal = calamityFundBudgetLimit - calculatedTotal
    const normalizedBal = Math.abs(remainingBal) < 0.01 ? 0 : remainingBal
    settotalCalamityFund(calculatedTotal)
    setcalamityFundBalance(normalizedBal)
    displayToast()
  }, [calamityFundVal, calamityFundBudgetLimit])

  // SkFund
  useEffect(() => {
    const remainingBal = skBudgetLimit - (Number(skVal) || 0)
    const normalizedBal = Math.abs(remainingBal) < 0.01 ? 0 : remainingBal
    setskFundBalance(normalizedBal)
    displayToast()
  }, [skVal, skBudgetLimit])

  // Capital Outlays
  useEffect(() => {
    const calculatedTotal = Number(capitalOutlaysVal) || 0
    setTotalOutlays(calculatedTotal)
  }, [capitalOutlaysVal])

  const handleSubmit = (value: BudgetPlanPage4FormData) => {
    console.log("Submitting data for page 4:", value)
    updateFormData(value)
  }

  function displayToast() {
    const currentlyExceeded = isAnyBudgetExceeded()

    if (currentlyExceeded) {
      setOverLimit(true)
      if (!capitalAndNonOfficeToast.current) {
        capitalAndNonOfficeToast.current = toast.error(
          "Input exceeds the allocated budget. Please enter a lower amount.",
          {
            duration: Number.POSITIVE_INFINITY,
            style: {
              border: "1px solid #f87171",
              padding: "16px",
              color: "#b91c1c",
              background: "#fef2f2",
            },
          },
        )
      }
    } else {
      setOverLimit(false)
      if (capitalAndNonOfficeToast.current) {
        toast.dismiss(capitalAndNonOfficeToast.current)
        capitalAndNonOfficeToast.current = null
      }
    }
  }

  function isAnyBudgetExceeded(): boolean {
    return localDevBalance < 0 || skFundBalance < 0 || calamityFundBalance < 0 ? true : false
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mb-4">
          <div className="mb-5 bg-white p-5 w-full">
            {/* Title Section */}
            <div className="p-2 flex flex-col gap-3 mb-4">
              <h1 className="font-bold flex justify-center w-full">CAPITAL OUTLAYS</h1>
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
                  name={name as keyof BudgetPlanPage4FormData}
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
                          {name === "skFund" && <Label className="font-normal">{formatNumber(skBudgetLimit)}</Label>}
                        </div>
                        <div className="w-[16rem] flex justify-center">
                          {name === "skFund" && <Label className="font-normal">{formatNumber(skFundBalance)}</Label>}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Subtotal rows for Local Dev Fund and Calamity Fund */}
                {["rehabMultPurpose", "disasterSupplies"].includes(name) && (
                  <div className="flex items-center p-2 border-t border-gray-100">
                    <div className="w-[23rem]"></div>
                    <Label className={styles.formfooter}>
                      Total:{" "}
                      {name === "rehabMultPurpose" ? formatNumber(totalDevFund) : formatNumber(totalCalamityFund)}
                    </Label>
                    <Label className={styles.formfooter}>
                      {name === "rehabMultPurpose"
                        ? formatNumber(localDevBudgetLimit)
                        : formatNumber(calamityFundBudgetLimit)}
                    </Label>
                    <Label className={styles.formfooter}>
                      {name === "rehabMultPurpose" ? formatNumber(localDevBalance) : formatNumber(calamityFundBalance)}
                    </Label>
                  </div>
                )}

                {/* Capital Outlays Total and NON-OFFICE section header */}
                {name === "capitalOutlays" && (
                  <div>
                    <div className="flex items-center p-2 border-t border-gray-100">
                      <div className="w-[23rem]"></div>
                      <Label className={styles.formfooter}>Total: {formatNumber(totalOutlays)}</Label>
                      <div className="w-[16rem]"></div>
                      <div className="w-[16rem]"></div>
                    </div>
                    <div className="p-2 flex flex-col gap-1 mt-4">
                      <h1 className="font-bold flex justify-center w-full">NON-OFFICE</h1>
                      <h3 className="font-semibold text-blue flex justify-center w-full">
                        Local Development Fund ({localDevLimit}%)
                      </h3>
                    </div>
                  </div>
                )}

                {/* Section headers */}
                {name === "rehabMultPurpose" && (
                  <div className="p-2 flex flex-col gap-1">
                    <h3 className="font-semibold text-blue flex justify-center w-full">
                      Sangguniang Kabataan Fund ({skFundLimit}%)
                    </h3>
                  </div>
                )}

                {name === "skFund" && (
                  <div className="p-2 flex flex-col gap-1">
                    <h3 className="font-semibold text-blue flex justify-center w-full">
                      LDRRM Fund / Calamity Fund ({calamityFundLimit}%)
                    </h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </Form>
  )
}

export default CreateBudgetPlanPage4