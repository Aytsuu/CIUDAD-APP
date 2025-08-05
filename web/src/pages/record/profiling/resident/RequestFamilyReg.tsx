import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Check, CircleAlert, Info } from "lucide-react"
import React from "react"
import { Link, useLocation } from "react-router"
import { Button } from "@/components/ui/button/button"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { Label } from "@/components/ui/label"
import { useRequestExpiration } from "./useRequestExpiration"
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

  const { getExpirationColor, getExpirationMessage, getStatusDisplay } = useRequestExpiration(params.data?.req_date)

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
      address.add_barangay && `Brgy. ${address.add_barangay}`,
      address.add_city,
      address.add_province,
    ].filter(Boolean)
    return parts.join(", ")
  }

  const submit = async () => {
    setIsSubmitting(true)

    const formIsValid = await form.trigger()
    const householdId = form.watch("householdNo");
    if (formIsValid && householdId) {
      try {
        const requestId = params?.data.req_id
        const compositions = params?.data.compositions
        const fc_data = [];

        const family = await addFamily({
          demographicInfo: form.getValues(),
          staffId: user?.staff?.staff_id || "",
        });

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
            rp: resident_profile.rp_id
          });

        }
        await deleteRequest(requestId)
        await addFamilyComposition(fc_data);
        showSuccessToast("Request Approved!")
        safeNavigate.back();
      } catch (error) {
        console.error(error);
        showErrorToast("Failed to process request")
        setIsSubmitting(false)
      }
    } else {
      if (!householdId) setInvalidHousehold(true);
      showErrorToast("Please fill out all required fields");
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
      <Card className="mb-6">
        <CardHeader className="mb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registration Request Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="border-r border-gray-400 pr-3 ">
              <p className="text-sm text-blue-600 font-medium">Submission Date</p>
              <p className="text-sm font-medium">{formatDate(registrationData.req_date, true)}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Family Members <span className="ml-1 text-xs text-gray-500 italic">(see the members below)</span></p>
              <p className="text-sm font-medium">{registrationData.compositions.length}</p>
            </div>
          </div>

          <div className={`${getExpirationColor.bg} border ${getExpirationColor.border} rounded-lg p-4 mb-6`}>
            <div className="flex items-start gap-3">
              <CircleAlert size={20} className={`${getExpirationColor.icon} mt-0.5 flex-shrink-0`} />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${getExpirationColor.title}`}>
                    Request Expiration
                    {getStatusDisplay && <span className="ml-2 text-xs font-normal">({getStatusDisplay})</span>}
                  </p>
                </div>
                <p className={`text-sm ${getExpirationColor.text} mt-1`}>{getExpirationMessage}</p>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form className="space-y-6">
              <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* Housing & Community Information */}
                <Card className="bg-blue-500 border-none">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Label className="text-base font-semibold text-white">Household Assignment</Label>
                    </div>

                    <p className="text-sm text-white mt-2">
                      Complete the demographic details to properly categorize and assign this family to the appropriate
                      household and community groups.
                    </p>
                  </CardHeader>
                  <CardContent className="bg-white rounded-b ring-1 ring-gray-300 ring-inset">
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
                          onChange={(value: string) => form.setValue("householdNo", value)}
                          placeholder="Search and select household..."
                          contentClassName="w-full"
                          emptyMessage={
                            <div className="flex gap-2 justify-center items-center p-4">
                              <Info className="h-4 w-4 text-gray-400" />
                              <div className="text-center">
                                <Label className="font-normal text-sm text-gray-600 block">
                                  No household found.
                                </Label>
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
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">Building</Label>
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
              </div>   
            </form>
          </Form>

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
                  trigger={!isSubmitting ? (
                    <Button>
                      <Check className="h-4 w-4 mr-2" />
                      Approve & Create Record
                    </Button>) : (
                      <LoadButton className="w-full">
                        Creating Record...
                      </LoadButton>
                    )
                  }
                  title="Confirm Approval"
                  description={
                    "Please review and verify all the details provided before confirming the registration." +
                    " Do you wish to proceed?"
                  }
                  onClick={submit}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-6 pb-10">
        {/* Sidebar */}
        <div className="w-80">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Family Members</CardTitle>
              <p className="text-sm text-gray-600">
                Select a family member below to view their detailed information and registration data.
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {registrationData.compositions.map((member: any, index: number) => (
                <div
                  key={member.per_id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${
                    selectedMember === index
                      ? "bg-blue-50 border-blue-300 shadow-sm"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedMember(index)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {member.per_fname} {member.per_lname}
                      </h4>
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        {member.role}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Card>
            <CardHeader>
              <div className="space-y-2 mb-4">
                <CardTitle className="text-2xl flex items-center gap-4">
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
                <p className="text-sm text-gray-600 mb-4">
                  Basic personal details as provided during the registration process. This information is used for
                  identification and demographic purposes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-gray-700">Date of Birth</Label>
                    </div>
                    <p className="font-medium">{formatDate(currentMember.per_dob)}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Age: {new Date().getFullYear() - new Date(currentMember.per_dob).getFullYear()} years old
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-gray-700">Gender</Label>
                    </div>
                    <p className="font-medium">{currentMember.per_sex}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-gray-700">Civil Status</Label>
                    </div>
                    <p className="font-medium">{currentMember.per_status}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-gray-700">Religion</Label>
                    </div>
                    <p className="font-medium">{currentMember.per_religion || "Not specified"}</p>
                  </div>
                  {currentMember.per_edAttainment && (
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-gray-700">Educational Attainment</Label>
                      </div>
                      <p className="font-medium">{currentMember.per_edAttainment}</p>
                    </div>
                  )}
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Label className="text-gray-700">Contact Number</Label>
                    </div>
                    <p className="font-medium">{currentMember.per_contact}</p>
                    <p className="text-xs text-gray-500 mt-1">Primary contact for this family member</p>
                  </div>
                </div>
              </div>
              <Separator />
              {/* Address Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">Residential Address</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Current residential address as declared in the registration. This address will be used for official
                  correspondence and service delivery.
                </p>
                {currentMember.addresses.map((address: any, index: number) => (
                  <div key={address.add_id || index} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">Complete Address</p>
                          <p className="text-gray-700">{formatAddress(address)}</p>
                        </div>
                      </div>
                      {address.add_external_sitio && (
                        <div className="pl-8">
                          <p className="text-sm text-gray-600">
                            <strong>External Sitio:</strong> {address.add_external_sitio}
                          </p>
                        </div>
                      )}
                      <div className="pl-8 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                          This address has been verified and will be used for all official communications and service
                          delivery related to this family registration.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutWithBack>
  )
}
