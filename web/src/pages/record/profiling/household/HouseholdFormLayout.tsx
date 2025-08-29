import React from "react"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import HouseholdProfileForm from "./HouseholdProfileForm"
import { formatAddresses, formatResidents } from "../ProfilingFormats"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { useFieldArray, useForm } from "react-hook-form"
import { householdFormSchema } from "@/form-schema/profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { HousePlus, Plus, MoveRight, X } from "lucide-react"
import { Form } from "@/components/ui/form/form"
import { useAuth } from "@/context/AuthContext"
import { useAddHousehold } from "../queries/profilingAddQueries"
import { usePerAddressesList, useResidentsList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { FormSelect } from "@/components/ui/form/form-select"
import { Button } from "@/components/ui/button/button"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"
import { capitalize } from "@mui/material"
import { Badge } from "@/components/ui/badge"

export default function HouseholdFormLayout({ tab_params }: { tab_params?: Record<string, any> }) {
  // =============== STATE INITIALIZATION ==================
  const { user } = useAuth()
  const { safeNavigate } = useSafeNavigate()
  const { showLoading, hideLoading } = useLoading()

  const [invalidHouseHead, setInvalidHouseHead] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [addresses, setAddresses] = React.useState<any[]>([])

  const defaultValues = generateDefaultValues(householdFormSchema)
  const form = useForm<z.infer<typeof householdFormSchema>>({
    resolver: zodResolver(householdFormSchema),
    defaultValues,
  })

  const { mutateAsync: addHousehold } = useAddHousehold()
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList()
  const { data: perAddressList, isLoading: isLoadingPerAddress } = usePerAddressesList()
  const formattedAddresses = formatAddresses(addresses) || []
  const formattedResidents = formatResidents(residentsList) || []
  const isLoading = isLoadingResidents || isLoadingPerAddress
  
  const { append } = useFieldArray({
    control: tab_params?.form?.control || form?.control,
    name: "houseSchema.list"
  })

  const houseList = tab_params?.form.watch("houseSchema.list");
  console.log(houseList)

  // =================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if (isLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoading, showLoading, hideLoading])

  React.useEffect(() => {
    if(tab_params?.isRegistrationTab) return;
    const head = form.watch("householdHead")
    console.log('Selected household head:', head)
    console.log('Residents list:', residentsList)
    console.log('Per address list:', perAddressList)
    
    if (head && residentsList) {
      const resident = residentsList.find((res: any) => res.rp_id == head.split(" ")[0])
      console.log('Found resident:', resident)
      
      if (resident) {
        const filteredAddresses = perAddressList?.filter((per_add: any) => per_add?.per === resident.personal_info.per_id)
        form.resetField('address')
        console.log('Filtered addresses:', filteredAddresses)
        console.log('Looking for per_id:', resident.personal_info.per_id)
        
        setAddresses(filteredAddresses)
        
        // Debug the formatted addresses
        console.log('Formatted addresses:', formatAddresses(filteredAddresses))
      }
    } else {
      setAddresses([])
    }
  }, [form.watch("householdHead"), residentsList, perAddressList])

  React.useEffect(() => {
    const per_addresses = tab_params?.form.getValues().personalSchema.per_addresses;
    if(per_addresses?.length > 0) {
      setAddresses(per_addresses)
    }
  }, [tab_params?.form.watch("personalSchema.per_addresses")])

  // ==================== HANDLERS ========================
  const handleContinue = () => {
    const hasHouse = tab_params?.form.getValues("houseSchema.list").length > 0;
    if(!hasHouse) {
      showErrorToast("At least one owned houses is required to continue. Skip if not applicable.");
      return;
    }

    tab_params?.next(true)
  }

  const handleAddHouse = async () => {
    if (!(await tab_params?.form.trigger(["houseSchema.info"]))) {
      showErrorToast("Please fill out all required fields")
      return
    }
    
    const houseInfo = tab_params?.form.getValues("houseSchema.info");
    append(houseInfo)
    tab_params?.form.resetField("houseSchema.info")
  }

  const handleRemoveHouse = (index: number) => {
    const list = tab_params?.form.getValues("houseSchema.list");
    tab_params?.form.setValue("houseSchema.list", list.filter((_prev: any, idx: number) => 
      idx !== index
    ))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const formIsValid = await form.trigger()
      const householdHead = form.watch("householdHead")

      if (!formIsValid || !householdHead) {
        if (!householdHead) {
          setInvalidHouseHead(true)
        }
        showErrorToast("Please fill out all required fields")
        return
      }

      const householdInfo = form.getValues()
      console.log(householdInfo)

      await addHousehold({
        householdInfo: householdInfo,
        staffId: user?.staff?.staff_id,
      })

      // Show success toast
      showSuccessToast("Household registered successfully!");
      safeNavigate.back()

    } catch (error) {
      console.error("Error adding household:", error)
      showErrorToast("Failed to add household. Please try again.");
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    tab_params?.next?.(false)
  }

  // ==================== RENDER HELPERS ======================
  const residentRegistrationForm = () => {
    return (
      <div className="flex justify-center">
        <Card className="w-full max-w-7xl max-h-[700px] shadow-none rounded-lg overflow-y-auto">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <HousePlus className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">House Registration</h2>
            <p className="max-w-2xl mx-auto leading-relaxed">
              Is this resident a house owner? If yes, please add the house information below to proceed.
            </p>
          </CardHeader> 
          <CardContent>
            <div className="flex w-full gap-4">
              <Form {...tab_params?.form}>
                <form className="w-full max-w-lg grid gap-4 border p-5 rounded-lg">
                  <div className="">
                    <p className="font-semibold">House Information</p>
                    <p className="text-sm text-gray-700">
                      Fill all required fields
                    </p>
                  </div>

                  {/* NHTS Status */}
                  <div className="space-y-3">
                    <div className="max-w-xs">
                      <FormSelect
                        control={tab_params?.form.control}
                        name="houseSchema.info.nhts"
                        label="Select NHTS status"
                        options={[
                          { id: "no", name: "No - Not an NHTS household" },
                          { id: "yes", name: "Yes - NHTS household" },
                        ]}
                        readOnly={false}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      NHTS (National Household Targeting System)
                    </p>
                  </div>

                  {/* Address Selection */}
                  <div className="max-w-lg space-y-3 transition-all duration-300 opacity-100">
                    <FormSelect
                      control={tab_params?.form.control}
                      name="houseSchema.info.address"
                      label="Select household address"
                      options={formattedAddresses}
                      readOnly={false}
                    />
                    <p className="text-xs text-gray-500">
                      This reflects the addresses entered in the resident personal information.
                    </p>
                  </div>
                  
                  <div className="flex justify-end mt-5">
                    <Button onClick={handleAddHouse} type="button" variant={"secondary"}>
                      <Plus/> Add Household
                    </Button>
                  </div>
                </form>
              </Form>
              <div className="w-full flex flex-col border rounded-lg gap-4 p-5">
                <div className="">
                  <p className="font-semibold">Owned Houses</p>
                  <p className="text-sm text-gray-700">
                    This section shows the list of owned houses
                  </p>
                </div>
                <div className="grid gap-2">
                  {houseList?.map((house: any, index: number) => {
                    const sitio = house?.address.split("-")[1]
                    const street = house?.address.split("-")[2]

                    return (
                      <Card className="flex justify-between items-center py-2 px-3">
                        <div className="flex gap-4">
                          <div>House {index + 1}</div>
                          <p>Sitio {capitalize(sitio)}, {street}</p>
                          <Badge>{house.nhts == "yes" ? "NHTS" : "Not an NHTS"}</Badge>
                        </div>
                        <X 
                          size={16} 
                          className="cursor-pointer text-red-500"
                          onClick={() => handleRemoveHouse(index)}
                        />
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-8">
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="ghost"
                  className="flex-1"
                  type="button"
                  onClick={handleSkip}
                >
                  Skip for Now
                </Button>

                <Button onClick={handleContinue} type="button"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 w-32"
                >
                  Next <MoveRight/>
                </Button>
              </div>
            </div>
            {/* Help Text */}
            <div className="text-center pt-4 border-t mt-8">
              <p className="text-xs text-gray-500">
                Need help? Contact your administrator or skip this step and register the household later.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const standardForm = () => (
    <div className="w-full flex justify-center">
      <Card className="w-full max-w-2xl grid gap-4 p-10">
        <LayoutWithBack title="Household Registration Form" description="All fields are required">
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="grid gap-4"
            >
              <HouseholdProfileForm
                addresses={formattedAddresses}
                residents={formattedResidents}
                isSubmitting={isSubmitting}
                invalidHouseHead={invalidHouseHead}
                form={form}
                onSubmit={handleSubmit}
              /> 
            </form>
          </Form>
        </LayoutWithBack>
      </Card>
    </div>
  )

  // ==================== MAIN RENDER ======================
  return tab_params?.isRegistrationTab ? residentRegistrationForm() : standardForm()
}