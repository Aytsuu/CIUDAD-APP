import React from "react"
import type { z } from "zod"
import { demographicInfoSchema } from "@/form-schema/profiling-schema"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { zodResolver } from "@hookform/resolvers/zod"
import LivingSoloForm from "./LivingSoloForm"
import { formatHouseholds, formatOwnedHouses, formatResidents } from "../../ProfilingFormats"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import {
  User,
  Home,
  Users,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [invalidResident, setInvalidResident] = React.useState<boolean>(false)
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false)
  const [buildingReadOnly, setBuildingReadOnly] = React.useState<boolean>(false)
  const [selectOwnedHouses, setSelectOwnedHouses] = React.useState<boolean>(false);
  const [residentSearch, setResidentSearch] = React.useState<string>("");
  const [houseSearch, setHouseSearch] = React.useState<string>("");

  const { data: residentsList, isLoading: isLoadingResidents } = useResidentsList(
    false, // is_staff
    true, // exclude_independent
    true, // is search only
    residentSearch, //search
    false // disable query
  )

  const { data: householdsList, isLoading: isLoadingHouseholds } = useHouseholdsList(
    houseSearch
  )
  const formattedResidents = formatResidents(residentsList)
  const formattedHouseholds = formatHouseholds(householdsList)

  const isLoading = isLoadingHouseholds || isLoadingResidents

  // ==================== SIDE EFFECTS ======================
  React.useEffect(() => {
    if(selectOwnedHouses) {
      tab_params?.form.setValue("livingSoloSchema.building", "Owner")
      setBuildingReadOnly(true);
    } else {
      tab_params?.form.resetField("livingSoloSchema.building")
      setBuildingReadOnly(false);
    }
  }, [selectOwnedHouses])
  
  React.useEffect(() => {
    if (isLoading) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoading, showLoading, hideLoading])

  React.useEffect(() => {
    const householdNo = tab_params?.isRegistrationTab ? tab_params?.form.watch("livingSoloSchema.householdNo") : form.watch("householdNo")?.split(" ")[0]
    const residentId = form.watch("id")?.split(" ")[0]
    let building = ""

    if (householdNo && residentId && householdsList) {
      const ownedHouseholds = householdsList.filter((household: any) => {
        if (household.head.split("-")[0] == residentId) {
          return household.hh_id
        }
      })

      console.log(ownedHouseholds)

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
  const handleContinue = async () => {
    const householdId = tab_params?.form.getValues("livingSoloSchema.householdNo")
    if (!(await tab_params?.form.trigger(["livingSoloSchema"]))) {
      if (!householdId) setInvalidHousehold(true)
      showErrorToast("Please fill out all required fields to continue.")
      return
    }

    if (!householdId) {
      showErrorToast("Please fill out all required fields to continue.")
      setInvalidHousehold(true)
      return
    }

    tab_params?.next(true)
  }

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
        tab_params.next?.(true)
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
  const MainContent = (
    <Form {...(tab_params?.isRegistrationTab ? tab_params?.form : form)}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        className="space-y-6"
      >
        <LivingSoloForm
          isRegistrationTab={tab_params?.isRegistrationTab}
          prefix={tab_params?.isRegistrationTab ? "livingSoloSchema." : ""}
          buildingReadOnly={buildingReadOnly}
          residents={formattedResidents}
          households={formattedHouseholds}
          isSubmitting={isSubmitting}
          invalidResident={invalidResident}
          invalidHousehold={invalidHousehold}
          form={tab_params?.isRegistrationTab ? tab_params?.form : form}
          ownedHouses={formatOwnedHouses(tab_params?.form.getValues("houseSchema.list"))}
          selectOwnedHouses={selectOwnedHouses}
          setSelectOwnedHouses={setSelectOwnedHouses}
          onSubmit={submit}
          setResidentSearch={setResidentSearch}
          setHouseSearch={setHouseSearch}
        />
      </form>
    </Form>
  )

  // ==================== RENDER ======================
  const residentRegistrationForm = () => (
    <div className="w-full flex justify-center px-4">
      <Card className="w-full max-w-4xl max-h-[700px] shadow-none overflow-y-auto">
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
          <h2 className="text-xl font-semibold mb-2">Independent Living Registration</h2>
          <p className="max-w-2xl mx-auto leading-relaxed">
            Register individuals who live independently within a household. This creates a family record for residents
            who maintain their own living arrangements.
          </p>
        </CardHeader>

        {/* Rest of the component remains the same */}
        <CardContent className="space-y-6">
          {/* Info Alert */}
          {/* <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Independent Living:</strong> This registration is for individuals who live separately within a
              household structure, maintaining their own family unit while sharing the same address.
            </AlertDescription>
          </Alert> */}

          <Separator />

          {/* Form Content */}
          <div className="bg-white rounded-lg p-6">
            {MainContent}
            <div className="flex justify-end mt-8">
              <Button onClick={handleContinue}>
                Next <MoveRight/>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Help Section */}
          <div className="text-center pt-4">
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
