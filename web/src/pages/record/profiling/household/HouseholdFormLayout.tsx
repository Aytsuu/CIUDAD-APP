import React from "react"
import type { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import HouseholdProfileForm from "./HouseholdProfileForm"
import { formatAddresses, formatResidents } from "../ProfilingFormats"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { useForm } from "react-hook-form"
import { householdFormSchema } from "@/form-schema/profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { MapPin, Users, HousePlus, Plus } from "lucide-react"
import { Form } from "@/components/ui/form/form"
import { useAuth } from "@/context/AuthContext"
import { useAddHousehold } from "../queries/profilingAddQueries"
import { usePerAddressesList, useResidentsList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { FormSelect } from "@/components/ui/form/form-select"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Button } from "@/components/ui/button/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"

export default function HouseholdFormLayout({ tab_params }: { tab_params?: Record<string, any> }) {
  // =============== STATE INITIALIZATION ==================
  const { user } = useAuth()
  const { safeNavigate } = useSafeNavigate()
  const { showLoading, hideLoading } = useLoading()

  const [invalidHouseHead, setInvalidHouseHead] = React.useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [addresses, setAddresses] = React.useState<any[]>([])
  const [showAddressField, setShowAddressField] = React.useState<boolean>(false)

  const defaultValues = generateDefaultValues(householdFormSchema)
  const form = useForm<z.infer<typeof householdFormSchema>>({
    resolver: zodResolver(householdFormSchema),
    defaultValues,
  })

  // =============== QUERIES ==================
  const { mutateAsync: addHousehold } = useAddHousehold()
  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList()
  const { data: perAddressList, isLoading: isLoadingPerAddress } = usePerAddressesList()

  // =============== MEMOIZED VALUES ==================
  const formattedAddresses = React.useMemo(
    () => formatAddresses(tab_params?.isRegistrationTab ? tab_params.addresses : addresses) || [],
    [tab_params?.addresses, addresses],
  )

  const formattedResidents = React.useMemo(() => formatResidents(residentsList) || [], [residentsList])

  const isLoading = isLoadingResidents || isLoadingPerAddress

  // =================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if (isLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoading, showLoading, hideLoading])

  React.useEffect(() => {
    if (tab_params?.residentId) {
      form.setValue("householdHead", tab_params.residentId)
    }
  }, [tab_params?.residentId, form])

  React.useEffect(() => {
    const head = form.watch("householdHead")
    console.log('Selected household head:', head)
    console.log('Residents list:', residentsList)
    console.log('Per address list:', perAddressList)
    
    if (head && residentsList) {
      const resident = residentsList.find((res: any) => res.rp_id == head.split(" ")[0])
      console.log('Found resident:', resident)
      
      if (resident) {
        const filteredAddresses = perAddressList.filter((per_add: any) => per_add?.per === resident.personal_info.per_id)
        form.resetField('address')
        console.log('Filtered addresses:', filteredAddresses)
        console.log('Looking for per_id:', resident.personal_info.per_id)
        
        setAddresses(filteredAddresses)
        setShowAddressField(filteredAddresses.length > 0)
        
        // Debug the formatted addresses
        console.log('Formatted addresses:', formatAddresses(filteredAddresses))
      }
    } else {
      setAddresses([])
      setShowAddressField(false)
    }
  }, [form.watch("householdHead"), residentsList, perAddressList])

  // ==================== HANDLERS ========================
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

      // Add to main household database and health household database
      await addHousehold({
        householdInfo: householdInfo,
        staffId: user?.staff?.staff_id,
      })

      // Show success toast
      showSuccessToast("Household registered successfully!");

      // Navigate based on context
      if (tab_params?.isRegistrationTab) {
        tab_params.next?.()
      } else {
        safeNavigate.back()
      }
    } catch (error) {
      console.error("Error adding household:", error)
      showErrorToast("Failed to add household. Please try again.");
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    tab_params?.next?.()
  }

  // ==================== RENDER HELPERS ======================
  const residentRegistrationForm = () => (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full max-w-2xl shadow-none">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <HousePlus className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Household Registration</h2>
          <p className="max-w-md mx-auto leading-relaxed">
            Is this resident a house owner? If yes, please complete the household information below to proceed.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              This step is optional. You can skip if the resident is not a house owner or if you prefer to register the
              household later.
            </AlertDescription>
          </Alert>
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="space-y-6"
            >
              {/* NHTS Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">NHTS Household Status</label>
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                </div>
                <FormSelect
                  control={form.control}
                  name="nhts"
                  label="Select NHTS status"
                  options={[
                    { id: "no", name: "No - Not an NHTS household" },
                    { id: "yes", name: "Yes - NHTS household" },
                  ]}
                  readOnly={false}
                />
                <p className="text-xs text-gray-500">
                  NHTS (National Household Targeting System) identifies poor households for social protection
                  programs.
                </p>
              </div>

              <Separator />

              {/* Address Selection */}
              <div
                className={cn(
                  "space-y-3 transition-all duration-300",
                  showAddressField ? "opacity-100" : "opacity-50",
                )}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700">Household Address</label>
                  {formattedAddresses.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>

                {formattedAddresses.length > 0 ? (
                  <>
                    <FormSelect
                      control={form.control}
                      name="address"
                      label="Select household address"
                      options={formattedAddresses}
                      readOnly={false}
                    />
                    <p className="text-xs text-gray-500">Select the primary address for this household.</p>
                  </>
                ) : (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertDescription className="text-amber-800">
                      No addresses found for the selected resident. Please ensure the resident has a registered
                      address.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button
                  variant="ghost"
                  className="flex-1 h-11"
                  type="button"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                >
                  Skip for Now
                </Button>

                <ConfirmationModal
                  trigger={
                    <Button
                      className="flex-1 h-11 bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting || formattedAddresses.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Register Household
                        </>
                      )}
                    </Button>
                  }
                  title="Confirm Household Registration"
                  description="Are you sure you want to register this household? This action will create a new household record in the system."
                  actionLabel="Yes, Register"
                  onClick={handleSubmit}
                />
              </div>

              {/* Help Text */}
              <div className="text-center pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Need help? Contact your administrator or skip this step and register the household later.
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )

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