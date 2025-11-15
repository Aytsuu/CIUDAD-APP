"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useFamilyHealthProfilingData,
  useWaterSupplyOptions,
  useIllnessesList,
} from "../../record/health-family-profiling/family-profling/queries/profilingFetchQueries"
import { formatDate } from "@/helpers/dateHelper"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button/button"
import {
  Printer,
  Users,
  Home,
  Droplets,
  FileText,
  Activity,
  Stethoscope,
  ClipboardCheck,
  User,
  Heart,
  Baby,
  Edit2,
  HistoryIcon,
  Trash2,
} from "lucide-react"
import FamilyProfilePrintPreview from "./FamilyProfilePrintPreview"
import type { FamilyProfilePrintPreviewHandle } from "./print/utils"
import { useRef, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet/sheet"
import { HistoryList } from "@/components/health-profiling/HistoryList"
import { NCDHistoryDisplay } from "../../../components/health-profiling/NCDHistoryDisplay"
import { TBHistoryDisplay } from "../../../components/health-profiling/TBHistoryDisplay"
import { EnvironmentalHealthEditModal } from "@/components/health-profiling/EnvironmentalHealthEditModal"
import { NCDEditModal } from "@/components/health-profiling/NCDEditModal"
import { TBEditModal } from "@/components/health-profiling/TBEditModal"
import {
  useUpdateNCD,
  useUpdateTBSurveillance,
  useUpdateWaterSupply,
  useUpdateSanitaryFacility,
  useUpdateSolidWaste,
  useWaterSupplyHistory,
  useSanitaryFacilityHistory,
  useSolidWasteHistory,
} from "./family-profling/queries/profilingHistoryQueries"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

interface HealthFamilyProfileViewProps {
  familyId: string | null
  showHealthProfiling: boolean
}

const FormField = ({
  label,
  value,
  className = "",
  optional = false,
}: {
  label: string
  value: string | number | null
  className?: string
  optional?: boolean
}) => {
  // Convert value to string and handle null/undefined
  const stringValue = value !== null && value !== undefined ? String(value) : ""
  const displayValue = !stringValue || stringValue.trim() === "" ? (optional ? "" : "N/A") : stringValue

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Input
        value={displayValue}
        readOnly
        className="bg-muted/50 border-border text-sm h-9 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  )
}

const SectionHeader = ({ icon: Icon, title, description }: { icon: any; title: string; description?: string }) => (
  <div className="flex items-start gap-3 mb-6">
    <div className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
  </div>
)

const MemberCard = ({ member }: { member: any }) => {
  // Calculate age to determine if under 5 or over 5
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(member.personal_info.date_of_birth)
  const isUnderFive = age < 5
  const hasUnderFiveData = member.under_five && Object.keys(member.under_five).length > 0

  return (
    <Card className="border-border shadow-sm bg-background hover:shadow-md transition-shadow">
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Badge variant="default" className="text-xs font-semibold px-3 py-1.5 uppercase tracking-wide">
              {member.role}
            </Badge>
            <span className="text-base font-semibold text-foreground">
              {member.personal_info.first_name} {member.personal_info.last_name}
            </span>
            {/* Age badge for dependents */}
            {member.role?.toLowerCase() === "dependent" && (
              <Badge
                variant="outline"
                className={`text-xs ${isUnderFive ? "bg-blue-50 text-blue-700 border-blue-300" : "bg-purple-50 text-purple-700 border-purple-300"}`}
              >
                {isUnderFive ? "Under 5" : "Over 5"} ({age} years old)
              </Badge>
            )}
          </div>
          <Badge className="bg-green-500 hover:bg-green-600 text-white font-medium px-3 py-1">
            {member.resident_id}
          </Badge>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
            <User className="h-3.5 w-3.5" />
            Complete Member Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-4">
            <FormField label="First Name" value={member.personal_info.first_name} />
            <FormField label="Last Name" value={member.personal_info.last_name} />
            <FormField label="Middle Name" value={member.personal_info.middle_name} optional={true} />
            <FormField label="Sex" value={member.personal_info.sex} />
            <FormField
              label="Date of Birth"
              value={
                member.personal_info.date_of_birth ? formatDate(member.personal_info.date_of_birth, "long" as any) : ""
              }
            />
            <FormField label="Age" value={age > 0 ? `${age} years old` : ""} />
            <FormField label="Civil Status" value={member.personal_info.civil_status} />
            <FormField label="Education" value={member.personal_info.education} optional={true} />
            <FormField label="Religion" value={member.personal_info.religion} optional={true} />
            <FormField label="Contact" value={member.personal_info.contact} />

            {member?.health_details?.blood_type && (
              <FormField label="Blood Type" value={member.health_details.blood_type} />
            )}
            {(() => {
              const philhealthId =
                member?.per_additional_details?.per_add_philhealth_id || member?.health_details?.philhealth_id
              return philhealthId ? <FormField label="PhilHealth ID" value={philhealthId} /> : null
            })()}
            {(() => {
              const covidStatus =
                member?.per_additional_details?.per_add_covid_vax_status || member?.health_details?.covid_vax_status
              return covidStatus ? <FormField label="COVID Vaccination Status" value={covidStatus} /> : null
            })()}
          </div>
        </div>

        {/* Under Five Dependent Health Information */}
        {member.role?.toLowerCase() === "dependent" && isUnderFive && hasUnderFiveData && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Baby className="h-3.5 w-3.5" />
                Under Five Dependent Health Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
                <FormField label="Fully Immunized Child (FIC)" value={member.under_five.fic || ""} optional={true} />
                <FormField
                  label="Nutritional Status"
                  value={member.under_five.nutritional_status || ""}
                  optional={true}
                />
                <FormField
                  label="Exclusive Breastfeeding"
                  value={member.under_five.exclusive_bf || ""}
                  optional={true}
                />
              </div>
            </div>
          </>
        )}

        {/* Over Five Dependent - Show message or keep standard fields */}
        {member.role?.toLowerCase() === "dependent" && !isUnderFive && <></>}

        {/* Mother Health Info */}
        {member.mother_health_info && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                <Heart className="h-3.5 w-3.5" />
                Mother Health Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-4">
                <FormField
                  label="Health Risk Class"
                  value={member.mother_health_info.health_risk_class}
                  optional={true}
                />
                <FormField
                  label="Immunization Status"
                  value={member.mother_health_info.immunization_status}
                  optional={true}
                />
                <FormField
                  label="Family Planning Method"
                  value={member.mother_health_info.family_planning_method}
                  optional={true}
                />
                <FormField
                  label="Family Planning Source"
                  value={member.mother_health_info.family_planning_source}
                  optional={true}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function HealthFamilyProfileView({ familyId, showHealthProfiling }: HealthFamilyProfileViewProps) {
  const { user } = useAuth()
  const { data: healthProfilingData, isLoading: isLoadingHealthData } = useFamilyHealthProfilingData(
    showHealthProfiling ? familyId : null,
  )
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const printPreviewRef = useRef<FamilyProfilePrintPreviewHandle | null>(null)

  // Modal open states
  const [envModalOpen, setEnvModalOpen] = useState(false)
  const [ncdModalOpen, setNCDModalOpen] = useState(false)
  const [tbModalOpen, setTBModalOpen] = useState(false)

  // Edit data state
  const [waterSupplyData, setWaterSupplyData] = useState<any>(null)
  const [sanitaryData, setSanitaryData] = useState<any>(null)
  const [wasteData, setWasteData] = useState<any>(null)
  const [ncdEditData, setNCDEditData] = useState<any>(null)
  const [tbEditData, setTBEditData] = useState<any>(null)

  // Update mutations
  const updateWaterSupply = useUpdateWaterSupply()
  const updateSanitaryFacility = useUpdateSanitaryFacility()
  const updateSolidWaste = useUpdateSolidWaste()
  const updateNCD = useUpdateNCD()
  const updateTBSurveillance = useUpdateTBSurveillance()

  // History queries (only fetch when needed)
  const { data: waterHistory } = useWaterSupplyHistory(
    healthProfilingData?.data?.environmental_health?.water_supply?.id || null,
  )
  const { data: sanitaryHistory } = useSanitaryFacilityHistory(
    healthProfilingData?.data?.environmental_health?.sanitary_facility?.id || null,
  )
  const { data: wasteHistory } = useSolidWasteHistory(
    healthProfilingData?.data?.environmental_health?.waste_management?.id || null,
  )

  // Fetch dropdown options data
  const { data: waterSupplyOptionsData } = useWaterSupplyOptions()
  const { data: illnessesList } = useIllnessesList()

  // Helper to get staff_id from auth context
  const getStaffId = () => {
    return user?.staff?.staff_id || "1" // Fallback to '1' if not found
  }

  // Environmental Health Save Handler
  const handleSaveEnvironmentalHealth = async (data: any) => {
    const staffId = getStaffId()
    try {
      const promises = []

      if (data.water?.id) {
        promises.push(
          updateWaterSupply.mutateAsync({
            water_sup_id: data.water.id,
            data: {
              water_sup_type: data.water.type,
              water_sup_desc: data.water.description,
              staff_id: staffId,
            },
          }),
        )
      }

      if (data.sanitary?.id) {
        const sf_desc =
          data.sanitary.facility_type === "SANITARY"
            ? data.sanitary.sanitary_facility_type
            : data.sanitary.unsanitary_facility_type

        promises.push(
          updateSanitaryFacility.mutateAsync({
            sf_id: data.sanitary.id,
            data: {
              sf_type: data.sanitary.facility_type,
              sf_desc: sf_desc || "",
              sf_toilet_type: data.sanitary.toilet_facility_type,
              staff_id: staffId,
            },
          }),
        )
      }

      if (data.waste?.id) {
        promises.push(
          updateSolidWaste.mutateAsync({
            swm_id: data.waste.id,
            data: {
              swn_desposal_type: data.waste.type,
              swm_desc: data.waste.description || "",
              staff_id: staffId,
            },
          }),
        )
      }

      await Promise.all(promises)
      setEnvModalOpen(false)
      toast.success("Environmental health data updated successfully")
    } catch (error: any) {
      console.error("Error updating environmental health:", error)
      toast.error(error?.response?.data?.message || "Failed to update environmental health data")
    }
  }

  // NCD Save Handler
  const handleSaveNCD = async (data: any) => {
    const staffId = getStaffId()
    try {
      await updateNCD.mutateAsync({
        ncd_id: data.ncd_id,
        data: {
          ncd_riskclass_age: data.risk_class_age_group,
          ncd_comorbidities: data.comorbidities,
          ncd_lifestyle_risk: data.lifestyle_risk,
          ncd_maintenance_status: data.in_maintenance,
          staff_id: staffId,
        },
      })
      setNCDModalOpen(false)
      setNCDEditData(null)
      toast.success("NCD record updated successfully")
    } catch (error) {
      toast.error("Failed to update NCD record")
    }
  }

  // TB Save Handler
  const handleSaveTB = async (data: any) => {
    const staffId = getStaffId()
    try {
      await updateTBSurveillance.mutateAsync({
        tb_id: data.tb_id,
        data: {
          tb_meds_source: data.src_anti_tb_meds,
          tb_days_taking_meds: data.no_of_days_taking_meds,
          tb_status: data.tb_status,
          staff_id: staffId,
        },
      })
      setTBModalOpen(false)
      setTBEditData(null)
      toast.success("TB surveillance record updated successfully")
    } catch (error) {
      toast.error("Failed to update TB surveillance record")
    }
  }

  // Format water supply options for select
  const getWaterSupplyOptions = () => {
    if (!waterSupplyOptionsData?.data) return []
    return waterSupplyOptionsData.data.map((ws: any) => ({
      id: ws.title, // Use title (LEVEL I, LEVEL II, LEVEL III) as the value
      name: ws.title,
      description: `${ws.subtitle} - ${ws.description}`, // Full description for display
    }))
  }

  // Format illnesses for combobox
  const getIllnessOptions = () => {
    if (!illnessesList?.data) return []
    return illnessesList.data.map((illness: any) => ({
      id: illness.illname,
      name: illness.illname,
    }))
  }

  if (!showHealthProfiling) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="p-6 shadow-sm border-border mb-4">
        <div className="mb-6">
          <div className=" flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-darkBlue1 mb-1">Complete Health Family Profiling</h2>
            </div>
            <div className="flex gap-2 no-print">
              <Button onClick={() => setShowPrintPreview(!showPrintPreview)} variant="outline" size="sm">
                {showPrintPreview ? "Hide Preview" : "Show Print Preview"}
              </Button>
              {showPrintPreview && (
                <Button
                  onClick={() => printPreviewRef.current?.PrintForm()}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print Form
                </Button>
              )}
            </div>
          </div>
          <p className="text-gray-600 text-sm max-w-3xl">
            A comprehensive information of the family and members, including their roles, health information and key
            details.
          </p>
        </div>

        {/* Print Preview */}
        {showPrintPreview && healthProfilingData?.success && (
          <div className="mb-6">
            <FamilyProfilePrintPreview ref={printPreviewRef} data={healthProfilingData.data} />
          </div>
        )}

        {/* Main Content */}
        {isLoadingHealthData ? (
          <Card className="border-border shadow-sm">
            <CardContent className="py-16">
              <div className="flex flex-col items-center justify-center gap-4">
                <Spinner size="lg" />
                <div className="text-center space-y-1">
                  <h3 className="font-semibold text-foreground">Loading health profiling data</h3>
                  <p className="text-sm text-muted-foreground">Please wait while we fetch the information</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : healthProfilingData?.success ? (
          <Tabs defaultValue="household" className="w-full">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none">
              <TabsTrigger
                value="household"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
              >
                Household & Address
              </TabsTrigger>
              <TabsTrigger
                value="family-members"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
              >
                Family Members
              </TabsTrigger>
              {healthProfilingData.data.environmental_health &&
                Object.keys(healthProfilingData.data.environmental_health).length > 0 && (
                  <TabsTrigger
                    value="environmental"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                  >
                    Environmental Health
                  </TabsTrigger>
                )}
              {((healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0) ||
                (healthProfilingData.data.tb_surveillance_records &&
                  healthProfilingData.data.tb_surveillance_records.length > 0)) && (
                <TabsTrigger
                  value="health-records"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                >
                  Health Records
                </TabsTrigger>
              )}
              {healthProfilingData.data.survey_identification && (
                <TabsTrigger
                  value="survey"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                >
                  Survey Identification
                </TabsTrigger>
              )}
            </TabsList>

            {/* Household and Address Information Tab */}
            <TabsContent value="household" className="mt-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader
                    icon={Home}
                    title="Household and Address Information"
                    description="Family identification and location details"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <FormField label="Family ID" value={healthProfilingData.data.family_info.family_id || ""} />
                    <FormField
                      label="Household Number"
                      value={healthProfilingData.data.family_info.household?.household_id || ""}
                    />
                    <FormField
                      label="Family Building"
                      value={healthProfilingData.data.family_info.family_building || ""}
                    />
                    <FormField
                      label="Indigenous Status"
                      value={
                        healthProfilingData.data.family_info.family_indigenous === "yes"
                          ? "Yes"
                          : healthProfilingData.data.family_info.family_indigenous === "no"
                            ? "No"
                            : healthProfilingData.data.family_info.family_indigenous || ""
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
                    <FormField
                      label="Street"
                      value={healthProfilingData.data.family_info.household?.address?.street || ""}
                    />
                    <FormField
                      label="Sitio"
                      value={healthProfilingData.data.family_info.household?.address?.sitio || ""}
                    />
                    <FormField
                      label="Barangay"
                      value={healthProfilingData.data.family_info.household?.address?.barangay || ""}
                    />
                    <FormField
                      label="Municipality"
                      value={healthProfilingData.data.family_info.household?.address?.city || ""}
                    />
                    <FormField
                      label="Province"
                      value={healthProfilingData.data.family_info.household?.address?.province || ""}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Family Members Tab */}
            <TabsContent value="family-members" className="mt-6">
              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <SectionHeader
                    icon={Users}
                    title="Family Members"
                    description={`${healthProfilingData.data.family_members.length} member${healthProfilingData.data.family_members.length !== 1 ? "s" : ""} registered`}
                  />

                  {/* Nested tabs for family member roles */}
                  <Tabs defaultValue="father" className="w-full">
                    <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border rounded-none">
                      <TabsTrigger
                        value="father"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                      >
                        Father
                      </TabsTrigger>
                      <TabsTrigger
                        value="mother"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                      >
                        Mother
                      </TabsTrigger>
                      <TabsTrigger
                        value="dependents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                      >
                        Dependents
                      </TabsTrigger>
                    </TabsList>

                    {/* Father Tab */}
                    <TabsContent value="father" className="mt-6 space-y-4">
                      {(() => {
                        const fathers = healthProfilingData.data.family_members.filter(
                          (m: any) => m.role?.toLowerCase() === "father",
                        )
                        return fathers.length > 0 ? (
                          fathers.map((member: any) => <MemberCard key={member.resident_id} member={member} />)
                        ) : (
                          <Card className="border-dashed border-2">
                            <CardContent className="py-12">
                              <div className="text-center space-y-2">
                                <User className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                                <h4 className="text-sm font-medium text-muted-foreground">No Father Registered</h4>
                                <p className="text-xs text-muted-foreground">
                                  There is no father information available for this family.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()}
                    </TabsContent>

                    {/* Mother Tab */}
                    <TabsContent value="mother" className="mt-6 space-y-4">
                      {(() => {
                        const mothers = healthProfilingData.data.family_members.filter(
                          (m: any) => m.role?.toLowerCase() === "mother",
                        )
                        return mothers.length > 0 ? (
                          mothers.map((member: any) => <MemberCard key={member.resident_id} member={member} />)
                        ) : (
                          <Card className="border-dashed border-2">
                            <CardContent className="py-12">
                              <div className="text-center space-y-2">
                                <Heart className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                                <h4 className="text-sm font-medium text-muted-foreground">No Mother Registered</h4>
                                <p className="text-xs text-muted-foreground">
                                  There is no mother information available for this family.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()}
                    </TabsContent>

                    {/* Dependents Tab */}
                    <TabsContent value="dependents" className="mt-6 space-y-4">
                      {(() => {
                        const dependents = healthProfilingData.data.family_members.filter(
                          (m: any) => !["father", "mother"].includes(m.role?.toLowerCase()),
                        )
                        return dependents.length > 0 ? (
                          dependents.map((member: any) => <MemberCard key={member.resident_id} member={member} />)
                        ) : (
                          <Card className="border-dashed border-2">
                            <CardContent className="py-12">
                              <div className="text-center space-y-2">
                                <Baby className="h-12 w-12 text-muted-foreground mx-auto opacity-50" />
                                <h4 className="text-sm font-medium text-muted-foreground">No Dependents Registered</h4>
                                <p className="text-xs text-muted-foreground">
                                  There are no dependent members in this family.
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Environmental Health Tab */}
            {healthProfilingData.data.environmental_health &&
              Object.keys(healthProfilingData.data.environmental_health).length > 0 && (
                <TabsContent value="environmental" className="mt-6">
                  <Card className="border-border shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-8">
                        <SectionHeader
                          icon={Droplets}
                          title="Environmental Health & Sanitation"
                          description="Water supply, sanitation facilities, and waste management"
                        />
                        <div className="flex gap-2 items-center">
                          {/* History Sheet */}
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                                <HistoryIcon className="h-4 w-4" />
                                History
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Environmental Health Update History</SheetTitle>
                                <SheetDescription>View all changes made to environmental health data</SheetDescription>
                              </SheetHeader>
                              <div className="mt-6 space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Water Supply History</h4>
                                  <HistoryList
                                    history={waterHistory || []}
                                    entityType="water-supply"
                                    entityTitle="Water Supply"
                                    isLoading={false}
                                  />
                                </div>
                                <Separator />
                                <div>
                                  <h4 className="font-semibold mb-2">Sanitary Facility History</h4>
                                  <HistoryList
                                    history={sanitaryHistory || []}
                                    entityType="sanitary-facility"
                                    entityTitle="Sanitary Facility"
                                    isLoading={false}
                                  />
                                </div>
                                <Separator />
                                <div>
                                  <h4 className="font-semibold mb-2">Waste Management History</h4>
                                  <HistoryList
                                    history={wasteHistory || []}
                                    entityType="solid-waste"
                                    entityTitle="Waste Management"
                                    isLoading={false}
                                  />
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>

                          {/* Edit Button */}
                          <Button
                            onClick={() => {
                              const waterData = healthProfilingData.data.environmental_health.water_supply
                              const sanitData = healthProfilingData.data.environmental_health.sanitary_facility
                              const wasteDataTemp = healthProfilingData.data.environmental_health.waste_management

                              setWaterSupplyData(waterData)
                              setSanitaryData(sanitData)
                              setWasteData(wasteDataTemp)
                              setEnvModalOpen(true)
                            }}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                        </div>
                      </div>

                      {/* Environmental Health Edit Modal */}
                      <EnvironmentalHealthEditModal
                        open={envModalOpen}
                        onOpenChange={setEnvModalOpen}
                        waterSupplyData={waterSupplyData}
                        sanitaryData={sanitaryData}
                        wasteData={wasteData}
                        waterSupplyOptions={getWaterSupplyOptions()}
                        onSave={handleSaveEnvironmentalHealth}
                        isPending={
                          updateWaterSupply.isPending ||
                          updateSanitaryFacility.isPending ||
                          updateSolidWaste.isPending
                        }
                      />

                      <div className="space-y-5">
                        {/* Water Supply Card */}
                        {healthProfilingData.data.environmental_health.water_supply && (
                          <Card className="border-blue-200 bg-blue-50/30 shadow-none">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-blue-200">
                                <div className="p-2.5 rounded-lg bg-blue-100">
                                  <Droplets className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold text-foreground">Water Supply</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Water source and distribution method
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FormField
                                  label="Water Supply Type"
                                  value={healthProfilingData.data.environmental_health.water_supply.type}
                                />
                                <FormField
                                  label="Water Supply Description"
                                  value={healthProfilingData.data.environmental_health.water_supply.description}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Sanitary Facility Card */}
                        {healthProfilingData.data.environmental_health.sanitary_facility && (
                          <Card className="border-green-200 bg-green-50/30 shadow-none">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-green-200">
                                <div className="p-2.5 rounded-lg bg-green-100">
                                  <Home className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold text-foreground">Sanitary Facility</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Toilet and sanitation infrastructure
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FormField
                                  label="Facility Type"
                                  value={healthProfilingData.data.environmental_health.sanitary_facility.facility_type}
                                />
                                <FormField
                                  label="Facility Subtype"
                                  value={healthProfilingData.data.environmental_health.sanitary_facility.description}
                                />
                                <FormField
                                  label="Toilet Facility Type"
                                  value={
                                    healthProfilingData.data.environmental_health.sanitary_facility
                                      .toilet_facility_type === "shared"
                                      ? "Shared with Other Household"
                                      : "Not Shared with Other Household"
                                  }
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Waste Management Card */}
                        {healthProfilingData.data.environmental_health.waste_management && (
                          <Card className="border-orange-200 bg-orange-50/30 shadow-none">
                            <CardContent className="p-6">
                              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-orange-200">
                                <div className="p-2.5 rounded-lg bg-orange-100">
                                  <Trash2 className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <h4 className="text-base font-semibold text-foreground">Waste Management</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">Solid waste disposal method</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <FormField
                                  label="Waste Management Type"
                                  value={healthProfilingData.data.environmental_health.waste_management.type.replace(
                                    /([A-Z])/g,
                                    "$1",
                                  )}
                                />
                                {healthProfilingData.data.environmental_health.waste_management.description && (
                                  <FormField
                                    label="Description"
                                    value={healthProfilingData.data.environmental_health.waste_management.description}
                                  />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

            {/* Health Records Tab (NCD + TB Surveillance) */}
            {((healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0) ||
              (healthProfilingData.data.tb_surveillance_records &&
                healthProfilingData.data.tb_surveillance_records.length > 0)) && (
              <TabsContent value="health-records" className="mt-6">
                <div className="space-y-6">
                  {/* NCD Records Section */}
                  {healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0 && (
                    <Card className="border-border shadow-sm">
                      <CardContent className="p-6">
                        <SectionHeader
                          icon={Activity}
                          title="Non-Communicable Disease Records"
                          description={`${healthProfilingData.data.ncd_records.length} record${healthProfilingData.data.ncd_records.length !== 1 ? "s" : ""} found`}
                        />
                        <div className="space-y-4">
                          {healthProfilingData.data.ncd_records.map((ncd: any) => {
                            return (
                              <Card key={ncd.ncd_id} className="border-border shadow-sm bg-muted/20">
                                <CardContent className="p-5 space-y-4">
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      <h4 className="text-sm font-semibold text-foreground">
                                        {ncd.resident_info.personal_info.first_name}{" "}
                                        {ncd.resident_info.personal_info.last_name}
                                      </h4>
                                      <Badge className="bg-green-500 hover:bg-green-500">
                                        {ncd.resident_info.resident_id}
                                      </Badge>
                                    </div>

                                    <div className="flex gap-2">
                                      {/* History for this NCD record */}
                                      <Sheet>
                                        <SheetTrigger asChild>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-1 bg-transparent"
                                          >
                                            <HistoryIcon className="h-3 w-3" />
                                            History
                                          </Button>
                                        </SheetTrigger>
                                        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                          <SheetHeader>
                                            <SheetTitle>NCD Record History</SheetTitle>
                                            <SheetDescription>
                                              Update history for {ncd.resident_info.personal_info.first_name}{" "}
                                              {ncd.resident_info.personal_info.last_name}
                                            </SheetDescription>
                                          </SheetHeader>
                                          <div className="mt-6">
                                            <NCDHistoryDisplay ncdId={ncd.ncd_id} />
                                          </div>
                                        </SheetContent>
                                      </Sheet>

                                      {/* Edit Button */}
                                      <Button
                                        onClick={() => {
                                          setNCDEditData({
                                            ncd_id: ncd.ncd_id,
                                            risk_class_age_group: ncd.health_data.risk_class_age_group,
                                            comorbidities: ncd.health_data.comorbidities,
                                            lifestyle_risk: ncd.health_data.lifestyle_risk,
                                            in_maintenance: ncd.health_data.in_maintenance,
                                          })
                                          setNCDModalOpen(true)
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center gap-1"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                        Edit
                                      </Button>
                                    </div>
                                  </div>

                                  {/* NCD Data Display */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <FormField
                                      label="Risk Class (Age Group)"
                                      value={ncd.health_data.risk_class_age_group}
                                    />
                                    <FormField label="Comorbidities" value={ncd.health_data.comorbidities} />
                                    <FormField label="Lifestyle Risk" value={ncd.health_data.lifestyle_risk} />
                                    <FormField label="In Maintenance" value={ncd.health_data.in_maintenance} />
                                  </div>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>

                        {/* NCD Edit Modal */}
                        <NCDEditModal
                          open={ncdModalOpen}
                          onOpenChange={setNCDModalOpen}
                          ncdData={ncdEditData}
                          illnessOptions={getIllnessOptions()}
                          onSave={handleSaveNCD}
                          isPending={updateNCD.isPending}
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* TB Surveillance Section */}
                  {healthProfilingData.data.tb_surveillance_records &&
                    healthProfilingData.data.tb_surveillance_records.length > 0 && (
                      <Card className="border-border shadow-sm">
                        <CardContent className="p-6">
                          <SectionHeader
                            icon={Stethoscope}
                            title="TB Surveillance Records"
                            description={`${healthProfilingData.data.tb_surveillance_records.length} record${healthProfilingData.data.tb_surveillance_records.length !== 1 ? "s" : ""} found`}
                          />
                          <div className="space-y-4">
                            {healthProfilingData.data.tb_surveillance_records.map((tb: any) => {
                              return (
                                <Card key={tb.tb_id} className="border-border shadow-sm bg-muted/20">
                                  <CardContent className="p-5 space-y-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                      <div className="flex items-center gap-3">
                                        <h4 className="text-sm font-semibold text-foreground">
                                          {tb.resident_info.personal_info.first_name}{" "}
                                          {tb.resident_info.personal_info.last_name}
                                        </h4>
                                        <Badge className="bg-green-500 hover:bg-green-500">
                                          {tb.resident_info.resident_id}
                                        </Badge>
                                      </div>

                                      <div className="flex gap-2">
                                        {/* History for this TB record */}
                                        <Sheet>
                                          <SheetTrigger asChild>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              className="flex items-center gap-1 bg-transparent"
                                            >
                                              <HistoryIcon className="h-3 w-3" />
                                              History
                                            </Button>
                                          </SheetTrigger>
                                          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                            <SheetHeader>
                                              <SheetTitle>TB Surveillance History</SheetTitle>
                                              <SheetDescription>
                                                Update history for {tb.resident_info.personal_info.first_name}{" "}
                                                {tb.resident_info.personal_info.last_name}
                                              </SheetDescription>
                                            </SheetHeader>
                                            <div className="mt-6">
                                              <TBHistoryDisplay tbId={tb.tb_id} />
                                            </div>
                                          </SheetContent>
                                        </Sheet>

                                        {/* Edit Button */}
                                        <Button
                                          onClick={() => {
                                            setTBEditData({
                                              tb_id: tb.tb_id,
                                              src_anti_tb_meds: tb.health_data.src_anti_tb_meds,
                                              src_anti_tb_meds_others: tb.health_data.src_anti_tb_meds_others || "",
                                              no_of_days_taking_meds: tb.health_data.no_of_days_taking_meds?.toString() || "",
                                              tb_status: tb.health_data.tb_status,
                                            })
                                            setTBModalOpen(true)
                                          }}
                                          size="sm"
                                          variant="outline"
                                          className="flex items-center gap-1"
                                        >
                                          <Edit2 className="h-3 w-3" />
                                          Edit
                                        </Button>
                                      </div>
                                    </div>

                                    {/* Display TB Data */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                      <FormField
                                        label="Source of Anti-TB Meds"
                                        value={tb.health_data.src_anti_tb_meds || "N/A"}
                                      />
                                      <FormField
                                        label="Days Taking Medication"
                                        value={tb.health_data.no_of_days_taking_meds || "N/A"}
                                      />
                                      <FormField label="TB Status" value={tb.health_data.tb_status || "N/A"} />
                                    </div>
                                  </CardContent>
                                </Card>
                              )
                            })}
                          </div>

                          {/* TB Edit Modal - Outside the map loop */}
                          <TBEditModal
                            open={tbModalOpen}
                            onOpenChange={setTBModalOpen}
                            tbData={tbEditData}
                            onSave={handleSaveTB}
                            isPending={updateTBSurveillance.isPending}
                          />
                        </CardContent>
                      </Card>
                    )}
                </div>
              </TabsContent>
            )}

            {/* Survey Identification Tab */}
            {healthProfilingData.data.survey_identification && (
              <TabsContent value="survey" className="mt-6">
                <Card className="border-border shadow-sm">
                  <CardContent className="p-6">
                    <SectionHeader
                      icon={ClipboardCheck}
                      title="Survey Identification & Verification"
                      description="Survey completion and verification details"
                    />

                    {/* Two Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left Column - Survey Information */}
                      <div className="space-y-4">
                        {/* First Row: Profiled By and Informant */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            label="Profiled By"
                            value={healthProfilingData.data.survey_identification.filled_by || "N/A"}
                          />
                          <FormField
                            label="Conforme"
                            value={healthProfilingData.data.survey_identification.informant || "N/A"}
                          />
                        </div>
                        
                        {/* Second Row: Checked By and Date Completed */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            label="Checked By"
                            value={healthProfilingData.data.survey_identification.checked_by || "N/A"}
                          />
                          <FormField
                            label="Date Completed"
                            value={formatDate(healthProfilingData.data.survey_identification.date, "long" as any) || "N/A"}
                          />
                        </div>
                      </div>

                      {/* Right Column - Digital Signature */}
                      <div className="flex flex-col items-center justify-center">
                        <div className="space-y-3 w-full">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide text-center">
                            Digital Signature
                          </h4>
                          {healthProfilingData.data.survey_identification.signature ? (
                            <div className="flex justify-center">
                              <div className="bg-background border-2 border-dashed border-border rounded-lg p-6">
                                <img
                                  src={healthProfilingData.data.survey_identification.signature}
                                  alt="Digital Signature"
                                  className="h-32 w-64 object-contain"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-6">
                                <p className="text-sm text-muted-foreground text-center">No signature available</p>
                              </div>
                            </div>
                          )}

                          {/* Informant name with underline and caption */}
                          <div className="mt-4 text-center">
                            <div className="w-64 mx-auto text-sm font-medium pb-1 border-b-2 border-border">
                              {healthProfilingData.data.survey_identification.informant || ""}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Informant (Name and Signature)</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="py-16">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">No Health Profiling Data</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This family does not have health profiling data yet. Please complete the health profiling form to
                    view information here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </Card>
    </div>
  )
}
