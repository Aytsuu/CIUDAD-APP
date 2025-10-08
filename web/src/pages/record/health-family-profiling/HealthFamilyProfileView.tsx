"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFamilyHealthProfilingData, useWaterSupplyOptions, useIllnessesList } from "../../record/health-family-profiling/family-profling/queries/profilingFetchQueries"
import { useHealthStaffList } from "../../record/health-family-profiling/queries/administrationFetchQueries"
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
  Save,
  X,
  History as HistoryIcon,
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
import { EditableFormField } from "@/components/health-profiling/EditableFormField"
import { HistoryList } from "@/components/health-profiling/HistoryList"
import { NCDHistoryDisplay } from "./components/NCDHistoryDisplay"
import { TBHistoryDisplay } from "./components/TBHistoryDisplay"
import {
  useUpdateNCD,
  useUpdateTBSurveillance,
  useUpdateSurveyIdentification,
  useUpdateWaterSupply,
  useUpdateSanitaryFacility,
  useUpdateSolidWaste,
  useSurveyHistory,
  useWaterSupplyHistory,
  useSanitaryFacilityHistory,
  useSolidWasteHistory,
} from "./family-profling/queries/profilingHistoryQueries"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

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
  value: string | null
  className?: string
  optional?: boolean
}) => {
  const displayValue = !value || value.trim() === "" ? (optional ? "" : "N/A") : value

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
                <FormField
                  label="Fully Immunized Child (FIC)"
                  value={member.under_five.fic || ""}
                  optional={true}
                />
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
        {member.role?.toLowerCase() === "dependent" && !isUnderFive && (
          <>
          
          </>
        )}

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

  // Edit mode state for each section
  const [isEditModeEnv, setIsEditModeEnv] = useState(false)
  const [isEditModeSurvey, setIsEditModeSurvey] = useState(false)
  const [editingNCDId, setEditingNCDId] = useState<string | null>(null)
  const [editingTBId, setEditingTBId] = useState<string | null>(null)

  // Conditional field visibility state
  const [facilityType, setFacilityType] = useState<'SANITARY' | 'UNSANITARY' | ''>('')
  const [showWasteOthers, setShowWasteOthers] = useState(false)
  const [showNCDLifestyleOthers, setShowNCDLifestyleOthers] = useState(false)
  const [showTBSourceOthers, setShowTBSourceOthers] = useState(false)

  // Confirmation modal state
  const [showEnvConfirmModal, setShowEnvConfirmModal] = useState(false)
  const [showSurveyConfirmModal, setShowSurveyConfirmModal] = useState(false)
  const [showNCDConfirmModal, setShowNCDConfirmModal] = useState(false)
  const [showTBConfirmModal, setShowTBConfirmModal] = useState(false)

  // Edit data state
  const [waterSupplyData, setWaterSupplyData] = useState<any>(null)
  const [sanitaryData, setSanitaryData] = useState<any>(null)
  const [wasteData, setWasteData] = useState<any>(null)
  const [surveyData, setSurveyData] = useState<any>(null)
  const [ncdEditData, setNCDEditData] = useState<any>(null)
  const [tbEditData, setTBEditData] = useState<any>(null)

  // Update mutations
  const updateWaterSupply = useUpdateWaterSupply()
  const updateSanitaryFacility = useUpdateSanitaryFacility()
  const updateSolidWaste = useUpdateSolidWaste()
  const updateNCD = useUpdateNCD()
  const updateTBSurveillance = useUpdateTBSurveillance()
  const updateSurveyIdentification = useUpdateSurveyIdentification()

  // History queries (only fetch when needed)
  const { data: waterHistory } = useWaterSupplyHistory(
    healthProfilingData?.data?.environmental_health?.water_supply?.id || null
  )
  const { data: sanitaryHistory } = useSanitaryFacilityHistory(
    healthProfilingData?.data?.environmental_health?.sanitary_facility?.id || null
  )
  const { data: wasteHistory } = useSolidWasteHistory(
    healthProfilingData?.data?.environmental_health?.waste_management?.id || null
  )
  const { data: surveyHistory } = useSurveyHistory(
    healthProfilingData?.data?.survey_identification?.id || null
  )

  // Fetch dropdown options data
  const { data: waterSupplyOptionsData } = useWaterSupplyOptions()
  const { data: illnessesList } = useIllnessesList()
  const { data: healthStaffList } = useHealthStaffList()

  // Helper to get staff_id from auth context
  const getStaffId = () => {
    return user?.staff?.staff_id || '1' // Fallback to '1' if not found
  }

  // Environmental Health Save Handler
  const handleSaveEnvironmentalHealth = async () => {
    const staffId = getStaffId()
    try {
      // Update all three entities
      const promises = []
      
      if (waterSupplyData?.id) {
        promises.push(
          updateWaterSupply.mutateAsync({
            water_sup_id: waterSupplyData.id,
            data: {
              water_sup_type: waterSupplyData.type,
              water_sup_desc: waterSupplyData.description,
              staff_id: staffId
            }
          })
        )
      }
      
      if (sanitaryData?.id) {
        const sf_desc = sanitaryData.facility_type === 'SANITARY' 
          ? sanitaryData.sanitary_facility_type 
          : sanitaryData.unsanitary_facility_type
        
        promises.push(
          updateSanitaryFacility.mutateAsync({
            sf_id: sanitaryData.id,
            data: {
              sf_type: sanitaryData.facility_type,
              sf_desc: sf_desc || '',
              sf_toilet_type: sanitaryData.toilet_facility_type,
              staff_id: staffId
            }
          })
        )
      }
      
      if (wasteData?.id) {
        promises.push(
          updateSolidWaste.mutateAsync({
            swm_id: wasteData.id,
            data: {
              swn_desposal_type: wasteData.type,
              swm_desc: wasteData.description || '',
              staff_id: staffId
            }
          })
        )
      }

      await Promise.all(promises)
      
      setIsEditModeEnv(false)
      setFacilityType('')
      setShowWasteOthers(false)
      setShowEnvConfirmModal(false)
      toast.success('Environmental health data updated successfully')
    } catch (error: any) {
      console.error('Error updating environmental health:', error)
      toast.error(error?.response?.data?.message || 'Failed to update environmental health data')
    }
  }

  // NCD Save Handler
  const handleSaveNCD = async (ncdId: string) => {
    const staffId = getStaffId()
    try {
      await updateNCD.mutateAsync({
        ncd_id: ncdId,
        data: {
          ncd_riskclass_age: ncdEditData?.risk_class_age_group,
          ncd_comorbidities: ncdEditData?.comorbidities,
          ncd_lifestyle_risk: ncdEditData?.lifestyle_risk,
          ncd_maintenance_status: ncdEditData?.in_maintenance,
          staff_id: staffId
        }
      })
      setEditingNCDId(null)
      setNCDEditData(null)
      setShowNCDConfirmModal(false)
      toast.success('NCD record updated successfully')
    } catch (error) {
      toast.error('Failed to update NCD record')
    }
  }

  // TB Save Handler
  const handleSaveTB = async (tbId: string) => {
    const staffId = getStaffId()
    try {
      await updateTBSurveillance.mutateAsync({
        tb_id: tbId,
        data: {
          tb_meds_source: tbEditData?.src_anti_tb_meds,
          tb_days_taking_meds: tbEditData?.no_of_days_taking_meds,
          tb_status: tbEditData?.tb_status,
          staff_id: staffId
        }
      })
      setEditingTBId(null)
      setTBEditData(null)
      setShowTBConfirmModal(false)
      toast.success('TB surveillance record updated successfully')
    } catch (error) {
      toast.error('Failed to update TB surveillance record')
    }
  }

  // Survey Save Handler
  const handleSaveSurvey = async () => {
    const staffId = getStaffId()
    try {
      await updateSurveyIdentification.mutateAsync({
        si_id: healthProfilingData.data.survey_identification.id,
        data: {
          si_filled_by: surveyData.filled_by,
          si_informant: surveyData.informant,
          si_checked_by: surveyData.checked_by,
          si_date: surveyData.date,
          staff_id: staffId
        }
      })
      setIsEditModeSurvey(false)
      setShowSurveyConfirmModal(false)
      toast.success('Survey data updated successfully')
    } catch (error) {
      toast.error('Failed to update survey data')
    }
  }

  // Format water supply options for select
  const getWaterSupplyOptions = () => {
    if (!waterSupplyOptionsData?.data) return []
    return waterSupplyOptionsData.data.map((ws: any) => ({
      id: ws.title, // Use title (LEVEL I, LEVEL II, LEVEL III) as the value
      name: ws.title
    }))
  }

  // Get water supply description based on selected type
  const getWaterSupplyDescription = (type: string) => {
    if (!waterSupplyOptionsData?.data) return ''
    const option = waterSupplyOptionsData.data.find((ws: any) => ws.title === type)
    if (!option) return ''
    return `${option.subtitle} - ${option.description}`
  }

  // Format illnesses for combobox
  const getIllnessOptions = () => {
    if (!illnessesList?.data) return []
    return illnessesList.data.map((illness: any) => ({
      id: illness.illname,
      name: illness.illname
    }))
  }

  // Format health staff for combobox
  const getHealthStaffOptions = () => {
    if (!healthStaffList?.data) return []
    return healthStaffList.data.map((staff: any) => ({
      id: `${staff.staff_id} ${staff.first_name} ${staff.last_name}`,
      name: (
        <div className="flex flex-col">
          <span className="font-medium">{staff.first_name} {staff.last_name}</span>
          <span className="text-xs text-muted-foreground">ID: {staff.staff_id}</span>
        </div>
      )
    }))
  }

  // Format family members for informant selection
  const getFamilyMemberOptions = () => {
    if (!healthProfilingData?.data?.family_members) return []
    return healthProfilingData.data.family_members.map((member: any) => ({
      id: `${member.resident_id} - ${member.personal_info.first_name} ${member.personal_info.last_name}`,
      name: (
        <div className="flex flex-col">
          <span className="font-medium">
            {member.personal_info.first_name} {member.personal_info.last_name}
          </span>
          <span className="text-xs text-muted-foreground">
            ID: {member.resident_id} | {member.role}
          </span>
        </div>
      )
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
              {healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0 && (
                <TabsTrigger
                  value="ncd"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                >
                  NCD Records
                </TabsTrigger>
              )}
              {healthProfilingData.data.tb_surveillance_records &&
                healthProfilingData.data.tb_surveillance_records.length > 0 && (
                  <TabsTrigger
                    value="tb"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                  >
                    TB Surveillance
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
                    <FormField
                      label="Province"
                      value={healthProfilingData.data.family_info.household?.address?.province || ""}
                    />
                    <FormField
                      label="Municipality"
                      value={healthProfilingData.data.family_info.household?.address?.city || ""}
                    />
                    <FormField
                      label="Barangay"
                      value={healthProfilingData.data.family_info.household?.address?.barangay || ""}
                    />
                    <FormField
                      label="Sitio"
                      value={healthProfilingData.data.family_info.household?.address?.sitio || ""}
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
                      <div className="flex justify-between items-start mb-6">
                        <SectionHeader
                          icon={Droplets}
                          title="Environmental Health & Sanitation"
                          description="Water supply, sanitation facilities, and waste management"
                        />
                        <div className="flex gap-2 items-center">
                          {/* History Sheet */}
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <HistoryIcon className="h-4 w-4" />
                                History
                              </Button>
                            </SheetTrigger>
                            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                              <SheetHeader>
                                <SheetTitle>Environmental Health Update History</SheetTitle>
                                <SheetDescription>
                                  View all changes made to environmental health data
                                </SheetDescription>
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

                          {/* Edit/Save/Cancel Buttons */}
                          {!isEditModeEnv ? (
                            <Button
                              onClick={() => {
                                setIsEditModeEnv(true)
                                const waterData = healthProfilingData.data.environmental_health.water_supply
                                const sanitData = healthProfilingData.data.environmental_health.sanitary_facility
                                const wasteDataTemp = healthProfilingData.data.environmental_health.waste_management
                                
                                setWaterSupplyData({
                                  ...waterData
                                })
                                
                                // Map sf_desc to correct field based on facility type
                                const isSanitary = sanitData?.facility_type === 'SANITARY'
                                setSanitaryData({
                                  ...sanitData,
                                  sanitary_facility_type: isSanitary ? sanitData?.description : '',
                                  unsanitary_facility_type: !isSanitary ? sanitData?.description : ''
                                })
                                
                                setWasteData({
                                  ...wasteDataTemp
                                })
                                
                                // Initialize conditional states
                                setFacilityType(sanitData?.facility_type || '')
                                setShowWasteOthers(wasteDataTemp?.type === 'OTHERS')
                              }}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </Button>
                          ) : (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setIsEditModeEnv(false)
                                  setWaterSupplyData(null)
                                  setSanitaryData(null)
                                  setWasteData(null)
                                  // Reset conditional states
                                  setFacilityType('')
                                  setShowWasteOthers(false)
                                }}
                                className="flex items-center gap-2"
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                              <ConfirmationModal
                                open={showEnvConfirmModal}
                                onOpenChange={setShowEnvConfirmModal}
                                trigger={
                                  <Button
                                    size="sm"
                                    onClick={() => setShowEnvConfirmModal(true)}
                                    className="flex items-center gap-2"
                                    disabled={
                                      updateWaterSupply.isPending ||
                                      updateSanitaryFacility.isPending ||
                                      updateSolidWaste.isPending
                                    }
                                  >
                                    <Save className="h-4 w-4" />
                                    Save Changes
                                  </Button>
                                }
                                title="Confirm Environmental Health Update"
                                description="Are you sure you want to save the changes to environmental health data? This action will update water supply, sanitary facility, and waste management information."
                                actionLabel="Save Changes"
                                cancelLabel="Cancel"
                                onClick={handleSaveEnvironmentalHealth}
                              />
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* Water Supply Section */}
                        {healthProfilingData.data.environmental_health.water_supply && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                              <Droplets className="h-4 w-4 text-blue-500" />
                              Water Supply
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <EditableFormField
                                label="Water Supply Type"
                                value={isEditModeEnv ? waterSupplyData?.type : healthProfilingData.data.environmental_health.water_supply.type}
                                isEditing={isEditModeEnv}
                                onChange={(value) => {
                                  // Auto-populate description when type changes
                                  const description = getWaterSupplyDescription(value)
                                  setWaterSupplyData({ 
                                    ...waterSupplyData, 
                                    type: value,
                                    description: description 
                                  })
                                }}
                                type="select"
                                options={getWaterSupplyOptions()}
                                placeholder="Select water supply type"
                              />
                              <EditableFormField
                                label="Water Supply Description"
                                value={
                                  isEditModeEnv 
                                    ? waterSupplyData?.description 
                                    : healthProfilingData.data.environmental_health.water_supply.description
                                }
                                isEditing={false}
                                className="sm:col-span-2"
                              />
                            </div>
                          </div>
                        )}

                        {/* Sanitary Facility Section */}
                        {healthProfilingData.data.environmental_health.sanitary_facility && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                              <Home className="h-4 w-4 text-green-500" />
                              Sanitary Facility
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <EditableFormField
                                label="Facility Type"
                                value={isEditModeEnv ? sanitaryData?.facility_type : healthProfilingData.data.environmental_health.sanitary_facility.facility_type}
                                isEditing={isEditModeEnv}
                                onChange={(value) => {
                                  // Clear the opposite field when changing facility type
                                  const newData = { 
                                    ...sanitaryData, 
                                    facility_type: value,
                                    sanitary_facility_type: value === 'SANITARY' ? sanitaryData?.sanitary_facility_type : '',
                                    unsanitary_facility_type: value === 'UNSANITARY' ? sanitaryData?.unsanitary_facility_type : ''
                                  }
                                  setSanitaryData(newData)
                                  setFacilityType(value as 'SANITARY' | 'UNSANITARY')
                                }}
                                type="select"
                                options={[
                                  { id: 'SANITARY', name: 'Sanitary' },
                                  { id: 'UNSANITARY', name: 'Unsanitary' }
                                ]}
                                placeholder="Select facility type"
                              />
                              
                              {/* Display Facility Subtype in View Mode */}
                              {!isEditModeEnv && healthProfilingData.data.environmental_health.sanitary_facility.description && (
                                <EditableFormField
                                  label="Facility Subtype"
                                  value={healthProfilingData.data.environmental_health.sanitary_facility.description}
                                  isEditing={false}
                                  className="sm:col-span-2"
                                />
                              )}
                              
                              {/* Conditional Sanitary Type Field in Edit Mode */}
                              {isEditModeEnv && (facilityType === 'SANITARY' || sanitaryData?.facility_type === 'SANITARY') && (
                                <EditableFormField
                                  label="Sanitary Facility Subtype"
                                  value={sanitaryData?.sanitary_facility_type || ''}
                                  isEditing={isEditModeEnv}
                                  onChange={(value) => setSanitaryData({ ...sanitaryData, sanitary_facility_type: value })}
                                  type="select"
                                  options={[
                                    { id: 'Pour/flush type with septic tank', name: 'Pour/flush type with septic tank' },
                                    { id: 'Pour/flush toilet connected to septic tank AND to sewerage system', name: 'Pour/flush toilet connected to septic tank AND to sewerage system' },
                                    { id: 'Ventilated Pit (VIP) Latrine', name: 'Ventilated Pit (VIP) Latrine' }
                                  ]}
                                  placeholder="Select sanitary type"
                                  className="sm:col-span-2"
                                />
                              )}
                              
                              {/* Conditional Unsanitary Type Field in Edit Mode */}
                              {isEditModeEnv && (facilityType === 'UNSANITARY' || sanitaryData?.facility_type === 'UNSANITARY') && (
                                <EditableFormField
                                  label="Unsanitary Facility Subtype"
                                  value={sanitaryData?.unsanitary_facility_type || ''}
                                  isEditing={isEditModeEnv}
                                  onChange={(value) => setSanitaryData({ ...sanitaryData, unsanitary_facility_type: value })}
                                  type="select"
                                  options={[
                                    { id: 'Water-sealed toilet without septic tank', name: 'Water-sealed toilet without septic tank' },
                                    { id: 'Overhung latrine', name: 'Overhung latrine' },
                                    { id: 'Open Pit Latrine', name: 'Open Pit Latrine' },
                                    { id: 'Without toilet', name: 'Without toilet' }
                                  ]}
                                  placeholder="Select unsanitary type"
                                  className="sm:col-span-2"
                                />
                              )}
                              
                              <EditableFormField
                                label="Toilet Facility Type"
                                value={
                                  isEditModeEnv 
                                    ? sanitaryData?.toilet_facility_type
                                    : healthProfilingData.data.environmental_health.sanitary_facility.toilet_facility_type === "shared"
                                      ? "Shared with Other Household"
                                      : "Not Shared with Other Household"
                                }
                                isEditing={isEditModeEnv}
                                onChange={(value) => setSanitaryData({ ...sanitaryData, toilet_facility_type: value })}
                                type="select"
                                options={[
                                  { id: 'SHARED', name: 'SHARED with Other Household' },
                                  { id: 'NOT SHARED', name: 'NOT SHARED with Other Household' }
                                ]}
                              />
                            </div>
                          </div>
                        )}

                        {/* Waste Management Section */}
                        {healthProfilingData.data.environmental_health.waste_management && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 border-b pb-2">
                              <Trash2 className="h-4 w-4 text-orange-500" />
                              Waste Management
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <EditableFormField
                                label="Waste Management Type"
                                value={
                                  isEditModeEnv
                                    ? wasteData?.type
                                    : healthProfilingData.data.environmental_health.waste_management.type.replace(/([A-Z])/g, "$1")
                                }
                                isEditing={isEditModeEnv}
                                onChange={(value) => {
                                  // Clear description if changing away from OTHERS
                                  const newDescription = value === 'OTHERS' ? (wasteData?.description || '') : ''
                                  setWasteData({ ...wasteData, type: value, description: newDescription })
                                  setShowWasteOthers(value === 'OTHERS')
                                }}
                                type="select"
                                options={[
                                  { id: 'WASTE SEGREGATION', name: 'Waste Segregation' },
                                  { id: 'BACKYARD COMPOSTING', name: 'Backyard Composting' },
                                  { id: 'RECYCLING', name: 'Recycling/Reuse' },
                                  { id: 'COLLECTED BY CITY', name: 'Collected by City Collection and Disposal System' },
                                  { id: 'BURNING/BURYING', name: 'Burning/Burying' },
                                  { id: 'OTHERS', name: 'Others' }
                                ]}
                                placeholder="Select waste management type"
                              />
                              
                              {/* Display waste description in view mode if OTHERS */}
                              {!isEditModeEnv && healthProfilingData.data.environmental_health.waste_management.type === 'OTHERS' && 
                               healthProfilingData.data.environmental_health.waste_management.description && (
                                <EditableFormField
                                  label="Waste Management (Others)"
                                  value={healthProfilingData.data.environmental_health.waste_management.description}
                                  isEditing={false}
                                  className="sm:col-span-2"
                                />
                              )}
                              
                              {/* Conditional Others field in edit mode */}
                              {isEditModeEnv && (showWasteOthers || wasteData?.type === 'OTHERS') && (
                                <EditableFormField
                                  label="Waste Management (Others)"
                                  value={wasteData?.description || ''}
                                  isEditing={isEditModeEnv}
                                  onChange={(value) => setWasteData({ ...wasteData, description: value })}
                                  placeholder="Specify other waste management type"
                                  className="sm:col-span-2"
                                />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

            {/* NCD Records Tab */}
            {healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0 && (
              <TabsContent value="ncd" className="mt-6">
                <Card className="border-border shadow-sm">
                  <CardContent className="p-6">
                    <SectionHeader
                      icon={Activity}
                      title="Non-Communicable Disease Records"
                      description={`${healthProfilingData.data.ncd_records.length} record${healthProfilingData.data.ncd_records.length !== 1 ? "s" : ""} found`}
                    />
                    <div className="space-y-4">
                      {healthProfilingData.data.ncd_records.map((ncd: any) => {
                        const isEditingThisNCD = editingNCDId === ncd.ncd_id
                        
                        return (
                          <Card key={ncd.ncd_id} className="border-border shadow-sm bg-muted/20">
                            <CardContent className="p-5 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <h4 className="text-sm font-semibold text-foreground">
                                    {ncd.resident_info.personal_info.first_name} {ncd.resident_info.personal_info.last_name}
                                  </h4>
                                  <Badge className="bg-green-500 hover:bg-green-500">{ncd.resident_info.resident_id}</Badge>
                                </div>
                                
                                <div className="flex gap-2">
                                  {/* History for this NCD record */}
                                  <Sheet>
                                    <SheetTrigger asChild>
                                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                                        <HistoryIcon className="h-3 w-3" />History
                                      </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                      <SheetHeader>
                                        <SheetTitle>NCD Record History</SheetTitle>
                                        <SheetDescription>
                                          Update history for {ncd.resident_info.personal_info.first_name} {ncd.resident_info.personal_info.last_name}
                                        </SheetDescription>
                                      </SheetHeader>
                                      <div className="mt-6">
                                        <NCDHistoryDisplay ncdId={ncd.ncd_id} />
                                      </div>
                                    </SheetContent>
                                  </Sheet>

                                  {/* Edit/Save/Cancel */}
                                  {!isEditingThisNCD ? (
                                    <Button
                                      onClick={() => {
                                        setEditingNCDId(ncd.ncd_id)
                                        setNCDEditData({
                                          id: ncd.ncd_id,
                                          risk_class_age_group: ncd.health_data.risk_class_age_group,
                                          comorbidities: ncd.health_data.comorbidities,
                                          comorbidities_others: ncd.health_data.comorbidities_others || '',
                                          lifestyle_risk: ncd.health_data.lifestyle_risk,
                                          lifestyle_risk_others: ncd.health_data.lifestyle_risk_others || '',
                                          in_maintenance: ncd.health_data.in_maintenance
                                        })
                                      }}
                                      size="sm"
                                      variant="outline"
                                      className="flex items-center gap-1"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                      Edit
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setEditingNCDId(null)
                                          setNCDEditData(null)
                                        }}
                                      >
                                        <X className="h-3 w-3" />Cancel
                                      </Button>
                                      <ConfirmationModal
                                        open={showNCDConfirmModal}
                                        onOpenChange={setShowNCDConfirmModal}
                                        trigger={
                                          <Button
                                            size="sm"
                                            onClick={() => setShowNCDConfirmModal(true)}
                                            disabled={updateNCD.isPending}
                                          >
                                            <Save className="h-3 w-3" />Save Changes
                                          </Button>
                                        }
                                        title="Confirm NCD Record Update"
                                        description="Are you sure you want to save the changes to this NCD record?"
                                        actionLabel="Save Changes"
                                        cancelLabel="Cancel"
                                        onClick={() => handleSaveNCD(ncd.ncd_id)}
                                      />
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <EditableFormField
                                  label="Risk Class (40+ years)"
                                  value={isEditingThisNCD ? ncdEditData?.risk_class_age_group : ncd.health_data.risk_class_age_group}
                                  isEditing={isEditingThisNCD}
                                  onChange={(value) => setNCDEditData({ ...ncdEditData, risk_class_age_group: value })}
                                  type="select"
                                  options={[
                                    { id: 'NEWBORN', name: 'Newborn (0-28 days)' },
                                    { id: 'INFANT', name: 'Infant (29 days - 11 months)' },
                                    { id: 'UNDER FIVE', name: 'Under five (1-4 years old)' },
                                    { id: 'SCHOOLAGED', name: 'School-aged (5-9 years old)' },
                                    { id: 'ADOLESCENT', name: 'Adolescent (10-19 years old)' },
                                    { id: 'ADULT', name: 'Adult (20-59 years old)' },
                                    { id: 'SENIOR CITIZEN', name: 'Senior Citizen (60+ years old)' }
                                  ]}
                                  placeholder="Select age group"
                                />
                                <EditableFormField
                                  label="Comorbidities"
                                  value={isEditingThisNCD ? ncdEditData?.comorbidities : ncd.health_data.comorbidities}
                                  isEditing={isEditingThisNCD}
                                  onChange={(value) => setNCDEditData({ ...ncdEditData, comorbidities: value })}
                                  type="combobox"
                                  options={getIllnessOptions()}
                                  placeholder="Search illnesses..."
                                  emptyMessage="No illness found"
                                />
                                <EditableFormField
                                  label="Lifestyle Risk"
                                  value={isEditingThisNCD ? ncdEditData?.lifestyle_risk : ncd.health_data.lifestyle_risk}
                                  isEditing={isEditingThisNCD}
                                  onChange={(value) => {
                                    setNCDEditData({ ...ncdEditData, lifestyle_risk: value })
                                    setShowNCDLifestyleOthers(value === 'OTHERS')
                                  }}
                                  type="select"
                                  options={[
                                    { id: 'SMOKER', name: 'Smoker' },
                                    { id: 'ALCOHOLIC', name: 'Alcoholic Beverage Drinking' },
                                    { id: 'NONE', name: 'None' },
                                    { id: 'OTHERS', name: 'Others' }
                                  ]}
                                  placeholder="Select lifestyle risk"
                                />
                                
                                {/* Conditional Lifestyle Risk Others */}
                                {isEditingThisNCD && (showNCDLifestyleOthers || ncdEditData?.lifestyle_risk === 'OTHERS') && (
                                  <EditableFormField
                                    label="Lifestyle Risk (Others)"
                                    value={ncdEditData?.lifestyle_risk_others || ''}
                                    isEditing={isEditingThisNCD}
                                    onChange={(value) => setNCDEditData({ ...ncdEditData, lifestyle_risk_others: value })}
                                    placeholder="Specify other lifestyle risk"
                                  />
                                )}
                                
                                <EditableFormField
                                  label="In Maintenance"
                                  value={
                                    isEditingThisNCD
                                      ? ncdEditData?.in_maintenance
                                      : (() => {
                                          const raw =
                                            ncd?.health_data?.in_maintenance ??
                                            ncd?.ncd_maintenance_status ??
                                            ncd?.health_data?.maintenance_status
                                          const s = String(raw).trim().toLowerCase()
                                          if (["yes", "y", "true", "1"].includes(s)) return "YES"
                                          if (["no", "n", "false", "0"].includes(s)) return "NO"
                                          return String(raw)
                                        })()
                                  }
                                  isEditing={isEditingThisNCD}
                                  onChange={(value) => setNCDEditData({ ...ncdEditData, in_maintenance: value })}
                                  type="select"
                                  options={[
                                    { id: 'YES', name: 'YES' },
                                    { id: 'NO', name: 'NO' }
                                  ]}
                                />
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* TB Surveillance Tab */}
            {healthProfilingData.data.tb_surveillance_records &&
              healthProfilingData.data.tb_surveillance_records.length > 0 && (
                <TabsContent value="tb" className="mt-6">
                  <Card className="border-border shadow-sm">
                    <CardContent className="p-6">
                      <SectionHeader
                        icon={Stethoscope}
                        title="TB Surveillance Records"
                        description={`${healthProfilingData.data.tb_surveillance_records.length} record${healthProfilingData.data.tb_surveillance_records.length !== 1 ? "s" : ""} found`}
                      />
                      <div className="space-y-4">
                        {healthProfilingData.data.tb_surveillance_records.map((tb: any) => {
                          const isEditingThisTB = editingTBId === tb.tb_id
                          
                          return (
                            <Card key={tb.tb_id} className="border-border shadow-sm bg-muted/20">
                              <CardContent className="p-5 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <h4 className="text-sm font-semibold text-foreground">
                                      {tb.resident_info.personal_info.first_name} {tb.resident_info.personal_info.last_name}
                                    </h4>
                                    <Badge className="bg-green-500 hover:bg-green-500">
                                      {tb.resident_info.resident_id}
                                    </Badge>
                                  </div>

                                  <div className="flex gap-2">
                                    {/* History for this TB record */}
                                    <Sheet>
                                      <SheetTrigger asChild>
                                        <Button variant="outline" size="sm" className="flex items-center gap-1">
                                          <HistoryIcon className="h-3 w-3" />History
                                        </Button>
                                      </SheetTrigger>
                                      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                                        <SheetHeader>
                                          <SheetTitle>TB Surveillance History</SheetTitle>
                                          <SheetDescription>
                                            Update history for {tb.resident_info.personal_info.first_name} {tb.resident_info.personal_info.last_name}
                                          </SheetDescription>
                                        </SheetHeader>
                                        <div className="mt-6">
                                          <TBHistoryDisplay tbId={tb.tb_id} />
                                        </div>
                                      </SheetContent>
                                    </Sheet>

                                    {/* Edit/Save/Cancel */}
                                    {!isEditingThisTB ? (
                                      <Button
                                        onClick={() => {
                                          setEditingTBId(tb.tb_id)
                                          setTBEditData({
                                            id: tb.tb_id,
                                            src_anti_tb_meds: tb.health_data.src_anti_tb_meds,
                                            src_anti_tb_meds_others: tb.health_data.src_anti_tb_meds_others || '',
                                            no_of_days_taking_meds: tb.health_data.no_of_days_taking_meds,
                                            tb_status: tb.health_data.tb_status
                                          })
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="flex items-center gap-1"
                                      >
                                        <Edit2 className="h-3 w-3" />
                                        Edit
                                      </Button>
                                    ) : (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            setEditingTBId(null)
                                            setTBEditData(null)
                                          }}
                                        >
                                          <X className="h-3 w-3" />Cancel
                                        </Button>
                                        <ConfirmationModal
                                          open={showTBConfirmModal}
                                          onOpenChange={setShowTBConfirmModal}
                                          trigger={
                                            <Button
                                              size="sm"
                                              onClick={() => setShowTBConfirmModal(true)}
                                              disabled={updateTBSurveillance.isPending}
                                            >
                                              <Save className="h-3 w-3" />Save Changes
                                            </Button>
                                          }
                                          title="Confirm TB Record Update"
                                          description="Are you sure you want to save the changes to this TB surveillance record?"
                                          actionLabel="Save Changes"
                                          cancelLabel="Cancel"
                                          onClick={() => handleSaveTB(tb.tb_id)}
                                        />
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  <EditableFormField
                                    label="Source of Anti-TB Meds"
                                    value={isEditingThisTB ? tbEditData?.src_anti_tb_meds : tb.health_data.src_anti_tb_meds}
                                    isEditing={isEditingThisTB}
                                    onChange={(value) => {
                                      setTBEditData({ ...tbEditData, src_anti_tb_meds: value })
                                      setShowTBSourceOthers(value === 'Others')
                                    }}
                                    type="select"
                                    options={[
                                      { id: 'Health Center', name: 'Health Center' },
                                      { id: 'Private Clinic', name: 'Private Clinic' },
                                      { id: 'Government', name: 'Government Hospital' },
                                      { id: 'Private Hospital', name: 'Private Hospital' },
                                      { id: 'Others', name: 'Others' }
                                    ]}
                                    placeholder="Select medication source"
                                  />
                                  
                                  {/* Conditional TB Source Others */}
                                  {isEditingThisTB && (showTBSourceOthers || tbEditData?.src_anti_tb_meds === 'Others') && (
                                    <EditableFormField
                                      label="Medication Source (Others)"
                                      value={tbEditData?.src_anti_tb_meds_others || ''}
                                      isEditing={isEditingThisTB}
                                      onChange={(value) => setTBEditData({ ...tbEditData, src_anti_tb_meds_others: value })}
                                      placeholder="Specify other medication source"
                                    />
                                  )}
                                  
                                  <EditableFormField
                                    label="Days Taking Medication"
                                    value={isEditingThisTB ? tbEditData?.no_of_days_taking_meds : tb.health_data.no_of_days_taking_meds}
                                    isEditing={isEditingThisTB}
                                    onChange={(value) => setTBEditData({ ...tbEditData, no_of_days_taking_meds: value })}
                                    type="number"
                                  />
                                  <EditableFormField
                                    label="TB Status"
                                    value={isEditingThisTB ? tbEditData?.tb_status : tb.health_data.tb_status}
                                    isEditing={isEditingThisTB}
                                    onChange={(value) => setTBEditData({ ...tbEditData, tb_status: value })}
                                    type="select"
                                    options={[
                                      { id: 'TREATMENT ONGOING', name: 'Treatment Ongoing' },
                                      { id: 'COMPLETED', name: 'Completed' },
                                      { id: 'NOT COMPLETED', name: 'Not Completed' }
                                    ]}
                                    placeholder="Select TB status"
                                  />
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

            {/* Survey Identification Tab */}
            {healthProfilingData.data.survey_identification && (
              <TabsContent value="survey" className="mt-6">
                <Card className="border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <SectionHeader
                        icon={ClipboardCheck}
                        title="Survey Identification & Verification"
                        description="Survey completion and verification details"
                      />
                      <div className="flex gap-2 items-center">
                        {/* History Sheet */}
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <HistoryIcon className="h-4 w-4" />
                              History
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                            <SheetHeader>
                              <SheetTitle>Survey Update History</SheetTitle>
                              <SheetDescription>
                                View all changes made to survey identification
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                              <HistoryList
                                history={surveyHistory || []}
                                entityType="survey"
                                entityTitle="Survey Identification"
                                isLoading={false}
                              />
                            </div>
                          </SheetContent>
                        </Sheet>

                        {/* Edit/Save/Cancel Buttons */}
                        {!isEditModeSurvey ? (
                          <Button
                            onClick={() => {
                              setIsEditModeSurvey(true)
                              setSurveyData({
                                ...healthProfilingData.data.survey_identification
                              })
                            }}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Edit2 className="h-4 w-4" />
                            Edit
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setIsEditModeSurvey(false)
                                setSurveyData(null)
                              }}
                              className="flex items-center gap-2"
                            >
                              <X className="h-4 w-4" />
                              Cancel
                            </Button>
                            <ConfirmationModal
                              open={showSurveyConfirmModal}
                              onOpenChange={setShowSurveyConfirmModal}
                              trigger={
                                <Button
                                  size="sm"
                                  onClick={() => setShowSurveyConfirmModal(true)}
                                  className="flex items-center gap-2"
                                  disabled={updateSurveyIdentification.isPending}
                                >
                                  <Save className="h-4 w-4" />
                                  Save Changes
                                </Button>
                              }
                              title="Confirm Survey Update"
                              description="Are you sure you want to save the changes to the survey identification data?"
                              actionLabel="Save Changes"
                              cancelLabel="Cancel"
                              onClick={handleSaveSurvey}
                            />
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <EditableFormField
                          label="Profiled By"
                          value={isEditModeSurvey ? surveyData?.filled_by : healthProfilingData.data.survey_identification.filled_by}
                          isEditing={isEditModeSurvey}
                          onChange={(value) => setSurveyData({ ...surveyData, filled_by: value })}
                          type="combobox"
                          options={getHealthStaffOptions()}
                          placeholder="Search health staff..."
                          emptyMessage="No staff found"
                        />
                        <EditableFormField
                          label="Informant"
                          value={isEditModeSurvey ? surveyData?.informant : healthProfilingData.data.survey_identification.informant}
                          isEditing={isEditModeSurvey}
                          onChange={(value) => setSurveyData({ ...surveyData, informant: value })}
                          type="combobox"
                          options={getFamilyMemberOptions()}
                          placeholder="Search family member..."
                          emptyMessage="No family member found"
                        />
                        <EditableFormField
                          label="Checked By"
                          value={isEditModeSurvey ? surveyData?.checked_by : healthProfilingData.data.survey_identification.checked_by}
                          isEditing={isEditModeSurvey}
                          onChange={(value) => setSurveyData({ ...surveyData, checked_by: value })}
                          type="combobox"
                          options={getHealthStaffOptions()}
                          placeholder="Search health staff..."
                          emptyMessage="No staff found"
                        />
                        <EditableFormField
                          label="Date Completed"
                          value={
                            isEditModeSurvey
                              ? surveyData?.date
                              : formatDate(healthProfilingData.data.survey_identification.date, "long" as any)
                          }
                          isEditing={isEditModeSurvey}
                          onChange={(value) => setSurveyData({ ...surveyData, date: value })}
                          type={isEditModeSurvey ? "date" : "text"}
                        />
                      </div>

                      {healthProfilingData.data.survey_identification.signature && (
                        <div className="space-y-3 pt-2">
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Digital Signature
                          </h4>
                          <div className="inline-block bg-background border-2 border-dashed border-border rounded-lg p-4">
                            <img
                              src={healthProfilingData.data.survey_identification.signature || "/placeholder.svg"}
                              alt="Digital Signature"
                              className="h-20 w-40 object-contain"
                            />
                          </div>
                        </div>
                      )}
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
