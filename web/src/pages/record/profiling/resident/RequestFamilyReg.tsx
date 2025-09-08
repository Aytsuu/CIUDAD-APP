import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Check, Info } from "lucide-react"
import React from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button/button"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Label } from "@/components/ui/label"
import { formatDate } from "@/helpers/dateHelper"
import { showSuccessToast, showErrorToast } from "@/components/ui/toast"
import { useAddFamily, useAddFamilyComposition, useAddResidentAndPersonal } from "../queries/profilingAddQueries"
import { useDeleteRequest } from "../queries/profilingDeleteQueries"
import { useUpdateAccount } from "../queries/profilingUpdateQueries"
import { useAuth } from "@/context/AuthContext"
import { useSafeNavigate } from "@/hooks/use-safe-navigate"
import { Form } from "@/components/ui/form/form"
import { useForm } from "react-hook-form"
import type { z } from "zod"
import { generateDefaultValues } from "@/helpers/generateDefaultValues"
import { zodResolver } from "@hookform/resolvers/zod"
import { Combobox } from "@/components/ui/combobox"
import { useHouseholdsList } from "../queries/profilingFetchQueries"
import { useLoading } from "@/context/LoadingContext"
import { formatHouseholds } from "../ProfilingFormats"
import { FormSelect } from "@/components/ui/form/form-select"
import { demographicInfoSchema } from "@/form-schema/profiling-schema"
import { capitalize } from "@/helpers/capitalize"
import { LoadButton } from "@/components/ui/button/load-button"

export default function RequestFamilyReg() {
  // ----------------- STATE INITIALIZATION --------------------
  const location = useLocation()
  const params = React.useMemo(() => location.state?.params, [location.state])
  const registrationData = React.useMemo(() => params?.data, [params])
  const { user } = useAuth()
  const { safeNavigate } = useSafeNavigate()
  const { showLoading, hideLoading } = useLoading()
  const { mutateAsync: addResidentAndPersonal } = useAddResidentAndPersonal()
  const { mutateAsync: deleteRequest } = useDeleteRequest()
  const { mutateAsync: updateAccount } = useUpdateAccount()
  const { mutateAsync: addFamily } = useAddFamily()
  const { mutateAsync: addFamilyComposition } = useAddFamilyComposition()
  const { data: householdsList, isLoading: isLoadingHouseholds } = useHouseholdsList()
  const [selectedMember, setSelectedMember] = React.useState(0)
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false)
  const [invalidHousehold, setInvalidHousehold] = React.useState<boolean>(false)

  const currentMember = registrationData.compositions[selectedMember]
  const form = useForm<z.infer<typeof demographicInfoSchema>>({
    resolver: zodResolver(demographicInfoSchema),
    defaultValues: generateDefaultValues(demographicInfoSchema),
  })

  const formattedHouseholds = React.useMemo(() => formatHouseholds(householdsList), [householdsList])

  // ----------------- SIDE EFFECTS --------------------
  React.useEffect(() => {
    if (isLoadingHouseholds) {
      showLoading()
    } else {
      hideLoading()
    }
  }, [isLoadingHouseholds])

  // ----------------- HANDLERS --------------------
  const formatAddress = (address: any) => {
    const parts = [
      address.add_street,
      address.sitio && `Sitio ${capitalize(address.sitio)}`,
      address.add_barangay && `Brgy. ${capitalize(address.add_barangay)}`,
      address.add_city,
      address.add_province,
    ].filter(Boolean)
    return parts.join(", ")
  }

  const submit = async () => {
    setIsSubmitting(true)

    const formIsValid = await form.trigger()
    const householdId = form.watch("householdNo")
    if (formIsValid && householdId) {
      try {
        const requestId = params?.data.req_id
        const compositions = params?.data.compositions
        const fc_data = []

        const family = await addFamily({
          demographicInfo: form.getValues(),
          staffId: user?.staff?.staff_id || "",
        })

        for (const comp of compositions) {
          const resident_profile = await addResidentAndPersonal({
            personalInfo: {
              per_id: comp.per_id,
            },
            staffId: user?.staff?.staff_id,
          })
          if (comp.acc) {
            await updateAccount({
              accNo: comp.acc,
              data: { rp: resident_profile.rp_id },
            })
          }

          fc_data.push({
            fam: family.fam_id,
            fc_role: comp.role,
            rp: resident_profile.rp_id,
          })
        }
        await deleteRequest(requestId)
        await addFamilyComposition(fc_data)
        showSuccessToast("Request Approved!")
        safeNavigate.back()
      } catch (error) {
        console.error(error)
        showErrorToast("Failed to process request")
        setIsSubmitting(false)
      }
    } else {
      if (!householdId) setInvalidHousehold(true)
      showErrorToast("Please fill out all required fields")
      setIsSubmitting(false)
    }
  }

  // ----------------- RENDER --------------------
  if (!registrationData) {
    return (
      <LayoutWithBack title="Family Registration" description="Loading registration details...">
        <Card>
          <CardContent className="p-6">
            <p>Loading registration data...</p>
          </CardContent>
        </Card>
      </LayoutWithBack>
    )
  }

  return (
    <LayoutWithBack
      title="Family Registration Request"
      description="Review and verify family registration information submitted by residents"
    >
      {/* Registration Overview */}
      <Card className="shadow-none rounded-lg">
        <CardHeader className="">
          <CardTitle>
            <p className="text-xl mb-1">Registration Request Overview</p>
            <p className="text-[15px] font-normal opacity-80">Submitted on {formatDate(registrationData.req_date, "long")}</p>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left side - Household Registration Form */}
            <div>
              <Form {...form}>
                <form className="space-y-6">
                  {/* Housing & Community Information */}
                  <Card className="bg-blue-500 border-none shadow-none rounded-lg">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Label className="text-base font-semibold text-white">Household Assignment</Label>
                      </div>

                      <p className="text-sm text-white mt-2">
                        Complete the demographic details to properly categorize and assign this family to the
                        appropriate household and community groups.
                      </p>
                    </CardHeader>
                    <CardContent className="bg-white rounded-b-lg ring-1 ring-gray-300 ring-inset">
                      <div className="space-y-4 pt-4">
                        <div className="grid">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Select Household Number
                          </Label>
                          <p className="text-sm text-gray-600 mb-3">
                            Choose the household this family belongs to. Each household represents a group of families
                            living in the same area or compound.
                          </p>
                          <Combobox
                            options={formattedHouseholds}
                            value={form.watch(`householdNo`)}
                            onChange={(value: any) => form.setValue("householdNo", value)}
                            placeholder="Search and select household..."
                            contentClassName="w-full"
                            emptyMessage={
                              <div className="flex gap-2 justify-center items-center p-4">
                                <Info className="h-4 w-4 text-gray-400" />
                                <div className="text-center">
                                  <Label className="font-normal text-sm text-gray-600 block">No household found.</Label>
                                  <Link to="/household/form">
                                    <Label className="font-medium text-sm text-blue-600 cursor-pointer hover:underline">
                                      Register New Household
                                    </Label>
                                  </Link>
                                </div>
                              </div>
                            }
                          />
                          {invalidHousehold && (
                            <Label className="text-[13px] text-red-500 mt-1 block">
                              Household selection is required for family registration
                            </Label>
                          )}
                        </div>

                        <div className="space-y-4">
                          {/* Building/Housing Status */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Household Occupancy</Label>
                            <p className="text-xs text-gray-600 mb-3">
                              Specify the family's relationship to their current residence. This helps determine housing
                              assistance eligibility.
                            </p>
                            <FormSelect
                              control={form.control}
                              name="building"
                              label=""
                              options={[
                                { id: "owner", name: "Owner" },
                                { id: "renter", name: "Renter" },
                                { id: "other", name: "Other" },
                              ]}
                              readOnly={false}
                            />
                          </div>

                          {/* Indigenous People Classification */}
                          <div>
                            <Label className="text-sm font-medium text-gray-700 mb-2 block">Indigenous</Label>
                            <p className="text-xs text-gray-600 mb-3">
                              Identify if any family member belongs to an indigenous community. This ensures access to
                              IP-specific programs and services.
                            </p>
                            <FormSelect
                              control={form.control}
                              name="indigenous"
                              label=""
                              options={[
                                { id: "no", name: "No" },
                                { id: "yes", name: "Yes" },
                              ]}
                              readOnly={false}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </form>
              </Form>
            </div>

            {/* Right side - Selected Member Details */}
            <div className="col-span-2">
              <Card className="border-gray-300 shadow-none rounded-lg">
                <CardHeader>
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">Select Family Member ({registrationData.compositions.length})</h3>
                    <div className="flex flex-wrap gap-1">
                      {registrationData?.compositions?.map((member: any, index: number) => (
                        <button
                          key={member.per_id}
                          className={`px-3 py-1.5 rounded-md border text-sm transition-all hover:shadow-sm ${
                            selectedMember === index
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                          onClick={() => setSelectedMember(index)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">
                              {member.per_fname} {member.per_lname}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0.5 ${
                                selectedMember === index
                                  ? "bg-blue-400 text-white border-blue-400"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              {member.role}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <CardTitle className="text-xl flex items-center gap-4">
                      {currentMember.per_fname} {currentMember.per_mname && `${currentMember.per_mname} `}
                      {currentMember.per_lname} {currentMember.per_suffix}
                      <div className="">
                        <Badge variant={"outline"} className="text-blue-600">
                          {currentMember.role}
                        </Badge>
                      </div>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <p className="text-sm text-gray-600 mb-4">Complete personal profile and demographic information.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">Date of Birth</Label>
                        <p className="font-medium text-sm mt-1">{formatDate(currentMember.per_dob)}</p>
                        <p className="text-xs text-gray-500">
                          Age: {new Date().getFullYear() - new Date(currentMember.per_dob).getFullYear()} years
                        </p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">Gender</Label>
                        <p className="font-medium text-sm mt-1">{currentMember.per_sex}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">Civil Status</Label>
                        <p className="font-medium text-sm mt-1">{currentMember.per_status}</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border">
                        <Label className="text-gray-700 text-xs font-medium">Contact Number</Label>
                        <p className="font-medium text-sm mt-1">{currentMember.per_contact || "Not provided"}</p>
                      </div>

                      {currentMember.per_edAttainment && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <Label className="text-gray-700 text-xs font-medium">Education</Label>
                          <p className="font-medium text-sm mt-1">{currentMember.per_edAttainment}</p>
                        </div>
                      )}

                      {currentMember.per_religion && (
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <Label className="text-gray-700 text-xs font-medium">Religion</Label>
                          <p className="font-medium text-sm mt-1">{currentMember.per_religion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Separator />

                  {/* Address Information */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">Residential Address</h4>
                    {currentMember?.per_addresses?.map((address: any, index: number) => (
                      <div key={address.add_id || index} className="p-4 bg-gray-50 rounded-lg border space-y-3">
                        <div>
                          <Label className="text-gray-700 text-xs font-medium">Address {index + 1}</Label>
                          <p className="text-gray-900 text-sm font-medium mt-1">{formatAddress(address)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Registration Actions</p>
                <p className="text-sm text-gray-500 mt-1">
                  Review the information above and take appropriate action on this registration request.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ConfirmationModal
                  trigger={
                    isSubmitting ? (
                      <LoadButton className="w-full">Creating Record...</LoadButton>
                    ) : (
                      <Button>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    )
                  }
                  title="Confirm Approval"
                  description={
                    "Please review and verify all the details provided before confirming the registration. Do you wish to proceed?"
                  }
                  onClick={submit}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </LayoutWithBack>
  )
}