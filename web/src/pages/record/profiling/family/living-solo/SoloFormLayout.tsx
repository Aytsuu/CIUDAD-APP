import React from "react"
import type { z } from "zod"
import { demographicInfoSchema } from "@/form-schema/profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { zodResolver } from "@hookform/resolvers/zod"
import LivingSoloForm from "./LivingSoloForm"
import { formatHouseholds, formatResidents } from "../../profilingFormats"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { toast } from "sonner"
import {
  User,
  Home,
  Users,
  UserCheck,
  MoveRight,
  UsersRound,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form/form"
import { useAuth } from "@/context/AuthContext"
import { useAddFamily, useAddFamilyComposition } from "../../queries/profilingAddQueries"
import { useHouseholdsList, useResidentsList } from "../../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"
import { Card, CardContent, CardHeader } from "@/components/ui/card/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button/button"
import { showErrorToast, showSuccessToast } from "@/components/ui/toast"

export default function SoloFormLayout({ tab_params }: { tab_params?: Record<string, any> }) {
  // ================= STATE INITIALIZATION ==================
  const defaultValues = generateDefaultValues(demographicInfoSchema)
  const form = useForm<z.infer<typeof demographicInfoSchema>>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues,
    mode: "onChange",
  })

  const { user } = useAuth()
  const { safeNavigate } = useSafeNavigate()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: addFamily } = useAddFamily()
  const { mutateAsync: addFamilyComposition } = useAddFamilyComposition()

  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList(
    false, // is_staff
    true, // exclude_independent
  )

  const { data: householdsList, isLoading: isLoadingHouseholds } = useHouseholdsList()

  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [invalidResident, setInvalidResident] = React.useState<boolean>(false)
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false)
  const [buildingReadOnly, setBuildingReadOnly] = React.useState<boolean>(false)

  const formattedResidents = React.useMemo(() => formatResidents(residentsList), [residentsList])
  const formattedHouseholds = React.useMemo(() => formatHouseholds(householdsList), [householdsList])

  const isLoading = isLoadingHouseholds || isLoadingResidents

  // ==================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if (isLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoading, showLoading, hideLoading])

  React.useEffect(() => {
    if (tab_params?.residentId) {
      form.setValue("id", tab_params?.residentId)
    }
  }, [tab_params, form])

  React.useEffect(() => {
    const householdNo = form.watch("householdNo")?.split(" ")[0]
    const residentId = form.watch("id")?.split(" ")[0]
    let building = ""

    if (householdNo && residentId && householdsList) {
      const ownedHouseholds = householdsList.filter((household: any) => {
        if (household.head_id === residentId) {
          return household.hh_id
        }
      })

      building = ownedHouseholds.some((household: any) => household.hh_id === householdNo) ? "owner" : ""

      if (building === "owner") {
        setBuildingReadOnly(true)
        form.setValue("building", building)
      } else {
        setBuildingReadOnly(false)
      }
    }
  }, [form.watch("householdNo"), form.watch("id"), householdsList, form])

  // ==================== HANDLERS ======================
  const submit = async () => {
    setIsSubmitting(true)
    setInvalidResident(false)
    setInvalidHousehold(false)

    try {
      const formIsValid = await form.trigger()
      const residentId = form.getValues("id")?.split(" ")[0]
      const householdId = form.getValues("householdNo")

      if (!formIsValid || !residentId || !householdId) {
        if (!residentId) setInvalidResident(true)
        if (!householdId) setInvalidHousehold(true)

        showErrorToast("Please fill out all required fields to continue")
        return
      }

      const family = await addFamily({
        demographicInfo: form.getValues(),
        staffId: user?.staff?.staff_id || "",
      })

      await addFamilyComposition([
        {
          fam: family.fam_id,
          fc_role: "Independent",
          rp: residentId,
        },
      ])

      showSuccessToast("Family registration completed successfully!")

      // Navigate based on context
      if (tab_params?.isRegistrationTab) {
        tab_params.next?.()
      } else {
        safeNavigate.back()
      }
    } catch (error) {
      console.error("Error registering family:", error)
      showErrorToast("Failed to register family. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ==================== RENDER HELPERS ======================
  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )

  const MainContent = (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-6"
      >
        {isLoading && !tab_params?.isRegistrationTab ? (
          renderLoadingSkeleton()
        ) : (
          <LivingSoloForm
            isRegistrationTab={tab_params?.isRegistrationTab}
            buildingReadOnly={buildingReadOnly}
            residents={formattedResidents}
            households={formattedHouseholds}
            isSubmitting={isSubmitting}
            invalidResident={invalidResident}
            invalidHousehold={invalidHousehold}
            form={form}
            onSubmit={submit}
          />
        )}
      </form>
    </Form>
  )

  // ==================== RENDER ======================
  const residentRegistrationForm = () => (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full max-w-4xl shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        {/* Navigation Button */}
        <div className="flex justify-end p-4 pb-0">
          <Button
            variant="ghost"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
            onClick={() => tab_params?.setHasFamily(true)}
          >
            Already Has A Family
            <MoveRight className="ml-2 w-4 h-4" />
          </Button>
        </div>

        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <UsersRound className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Independent Living Registration</h2>
          <p className="max-w-2xl mx-auto leading-relaxed">
            Register individuals who live independently within a household. This creates a family record for residents
            who maintain their own living arrangements.
          </p>
        </CardHeader>

        {/* Rest of the component remains the same */}
        <CardContent className="space-y-6">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Independent Living:</strong> This registration is for individuals who live separately within a
              household structure, maintaining their own family unit while sharing the same address.
            </AlertDescription>
          </Alert>

          <Separator />

          {/* Form Content */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">{MainContent}</div>

          {/* Help Section */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">
              Need assistance with this form? Contact your administrator for help.
            </p>
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                Resident Selection
              </span>
              <span className="flex items-center gap-1">
                <Home className="w-3 h-3" />
                Household Assignment
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                Family Creation
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const standardForm = () => (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full max-w-2xl p-10">
        <CardContent className="p-0">
          <LayoutWithBack
            title="Family Registration Form"
            description="Family registration form for individuals living independently. Please fill out all required fields."
          >
            {MainContent}
          </LayoutWithBack>
        </CardContent>
      </Card>
    </div>
  )

  // ==================== MAIN RENDER ======================
  return tab_params?.isRegistrationTab ? residentRegistrationForm() : standardForm()
}
