import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, User, MapPin, Users, Droplets, Shield, AlertTriangle, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Form } from "@/components/ui/form/form"
import { FormInput } from "@/components/ui/form/form-input"
import { FormTextarea } from "@/components/ui/form/form-textarea"
import { useForm } from "react-hook-form"
import { useFamilyHealthProfilingData } from "../../health-family-profiling/family-profling/queries/profilingFetchQueries"
import { formatDate } from "@/helpers/dateHelper"

interface HealthFamilyProfileViewProps {
  familyId: string | null
  showHealthProfiling: boolean
}

export default function HealthFamilyProfileView({ familyId, showHealthProfiling }: HealthFamilyProfileViewProps) {
  const { data: healthProfilingData, isLoading: isLoadingHealthData } = useFamilyHealthProfilingData(
    showHealthProfiling ? familyId : null,
  )

  // Initialize form with empty default values
  const form = useForm({
    defaultValues: {
      demographics: {
        householdNumber: "",
        barangay: "",
        municipality: "",
        province: "",
        sitio: "",
        region: "NCR"
      },
      members: {} as Record<string, any>,
      environmental: {
        waterSupplyType: "",
        waterSupplyDescription: "",
        sanitaryFacilityType: "",
        toiletFacilityType: "",
        wasteManagementType: ""
      },
      ncd: {} as Record<string, any>,
      tb: {} as Record<string, any>,
      survey: {
        filledBy: "",
        informant: "",
        checkedBy: "",
        dateCompleted: "",
        signature: ""
      }
    }
  })

  // Update form values when data is loaded
  React.useEffect(() => {
    if (healthProfilingData?.success && healthProfilingData?.data) {
      const data = healthProfilingData.data
      
      // Update demographics
      form.setValue("demographics.householdNumber", data.family_info?.household?.household_id || "")
      form.setValue("demographics.barangay", data.family_info?.household?.address?.barangay || "")
      form.setValue("demographics.municipality", data.family_info?.household?.address?.city || "")
      form.setValue("demographics.province", data.family_info?.household?.address?.province || "")
      form.setValue("demographics.sitio", data.family_info?.household?.address?.sitio || "")

      // Update family members data
      data.family_members?.forEach((member: any, index: number) => {
        form.setValue(`members.${index}.firstName`, member.personal_info?.first_name || "")
        form.setValue(`members.${index}.lastName`, member.personal_info?.last_name || "")
        form.setValue(`members.${index}.age`, 
          member.personal_info?.date_of_birth 
            ? `${new Date().getFullYear() - new Date(member.personal_info.date_of_birth).getFullYear()} years`
            : "N/A"
        )
        form.setValue(`members.${index}.contact`, member.personal_info?.contact || "")
        form.setValue(`members.${index}.bloodType`, member.health_details?.blood_type || "")
        form.setValue(`members.${index}.philhealthId`, member.health_details?.philhealth_id || "")
        form.setValue(`members.${index}.covidVaxStatus`, member.health_details?.covid_vax_status || "")
        
        // Mother health info
        if (member.mother_health_info) {
          form.setValue(`members.${index}.healthRiskClass`, member.mother_health_info.health_risk_class || "")
          form.setValue(`members.${index}.immunizationStatus`, member.mother_health_info.immunization_status || "")
          form.setValue(`members.${index}.familyPlanningMethod`, member.mother_health_info.family_planning_method || "")
          form.setValue(`members.${index}.familyPlanningSource`, member.mother_health_info.family_planning_source || "")
        }
      })

      // Update NCD records data - removed dynamic setValue calls for now
      // data.ncd_records?.forEach((ncd: any, index: number) => {
      //   form.setValue(`ncd.${index}.riskClassAge`, ncd.health_data?.risk_class_age_group || "")
      // })

      // Update TB surveillance records data - removed dynamic setValue calls for now  
      // data.tb_surveillance_records?.forEach((tb: any, index: number) => {
      //   form.setValue(`tb.${index}.medicationSource`, tb.health_data?.src_anti_tb_meds || "")
      // })

      // Update environmental health data
      if (data.environmental_health) {
        form.setValue("environmental.waterSupplyType", data.environmental_health.water_supply?.type || "")
        form.setValue("environmental.waterSupplyDescription", data.environmental_health.water_supply?.description || "")
        form.setValue("environmental.sanitaryFacilityType", data.environmental_health.sanitary_facility?.facility_type || "")
        form.setValue("environmental.toiletFacilityType", 
          data.environmental_health.sanitary_facility?.toilet_facility_type === "shared" 
            ? "Shared with Other Household" 
            : "Not Shared with Other Household"
        )
        form.setValue("environmental.wasteManagementType", 
          data.environmental_health.waste_management?.type?.replace(/([A-Z])/g, " $1") || ""
        )
      }

      // Update survey identification
      if (data.survey_identification) {
        form.setValue("survey.filledBy", data.survey_identification.filled_by || "")
        form.setValue("survey.informant", data.survey_identification.informant || "")
        form.setValue("survey.checkedBy", data.survey_identification.checked_by || "")
        form.setValue("survey.dateCompleted", formatDate(data.survey_identification.date, "long" as any) || "")
        form.setValue("survey.signature", data.survey_identification.signature || "")
      }
    }
  }, [healthProfilingData, form])

  if (!showHealthProfiling) {
    return null
  }

  return (
    <Card className="w-full max-w-none shadow-sm border-border/50">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Heart className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-foreground">Complete Health Family Profiling</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              A comprehensive information of the family and members including their roles, health information and key
              details.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoadingHealthData ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Loading health profiling data...</p>
          </div>
        ) : healthProfilingData?.success ? (
          <Form {...form}>
            <form className="space-y-6">
              <Accordion type="multiple" defaultValue={["demographics", "members"]} className="space-y-4">
                {/* Demographics & Location */}
                <AccordionItem value="demographics" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/20">
                        <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-foreground">Demographics & Location</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <FormInput
                        control={form.control}
                        name="demographics.householdNumber"
                        label="Household Number"
                        readOnly={true}
                        className="bg-gray-50"
                      />
                      <FormInput
                        control={form.control}
                        name="demographics.barangay"
                        label="Barangay"
                        readOnly={true}
                        className="bg-gray-50"
                      />
                      <FormInput
                        control={form.control}
                        name="demographics.municipality"
                        label="Municipality"
                        readOnly={true}
                        className="bg-gray-50"
                      />
                      <FormInput
                        control={form.control}
                        name="demographics.province"
                        label="Province"
                        readOnly={true}
                        className="bg-gray-50"
                      />
                      <FormInput
                        control={form.control}
                        name="demographics.sitio"
                        label="Sitio"
                        readOnly={true}
                        className="bg-gray-50"
                      />
                      
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Family Members */}
                <AccordionItem value="members" className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-green-100 dark:bg-green-900/20">
                        <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="font-medium text-foreground">Family Members</span>
                      <Badge variant="secondary" className="ml-auto">
                        {healthProfilingData.data.family_members.length}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-6">
                      {healthProfilingData.data.family_members.map((member: any, index: number) => (
                        <div
                          key={member.resident_id}
                          className="border border-border rounded-lg p-4 bg-card/50 space-y-4"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              ID: {member.resident_id}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormInput
                              control={form.control}
                              name={`members.${index}.firstName`}
                              label="First Name"
                              readOnly={true}
                              className="bg-gray-50"
                            />
                            <FormInput
                              control={form.control}
                              name={`members.${index}.lastName`}
                              label="Last Name"
                              readOnly={true}
                              className="bg-gray-50"
                            />
                            <FormInput
                              control={form.control}
                              name={`members.${index}.age`}
                              label="Age"
                              readOnly={true}
                              className="bg-gray-50"
                            />
                            <FormInput
                              control={form.control}
                              name={`members.${index}.contact`}
                              label="Contact"
                              readOnly={true}
                              className="bg-gray-50"
                            />
                          </div>

                          {/* Health Details */}
                          {(member.health_details.blood_type ||
                            member.health_details.philhealth_id ||
                            member.health_details.covid_vax_status) && (
                            <div className="border-t border-border pt-4">
                              <h5 className="text-sm font-medium text-foreground mb-3">Health Information</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormInput
                                  control={form.control}
                                  name={`members.${index}.bloodType`}
                                  label="Blood Type"
                                  readOnly={true}
                                  className="bg-blue-50"
                                />
                                <FormInput
                                  control={form.control}
                                  name={`members.${index}.philhealthId`}
                                  label="PhilHealth ID"
                                  readOnly={true}
                                  className="bg-blue-50"
                                />
                                <FormInput
                                  control={form.control}
                                  name={`members.${index}.covidVaxStatus`}
                                  label="COVID Vaccination Status"
                                  readOnly={true}
                                  className="bg-blue-50"
                                />
                              </div>
                            </div>
                          )}

                          {/* Mother Health Info */}
                          {member.mother_health_info && (
                            <div className="border-t border-border pt-4">
                              <h5 className="text-sm font-medium text-pink-700 mb-3">Mother Health Information</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                  control={form.control}
                                  name={`members.${index}.healthRiskClass`}
                                  label="Health Risk Class"
                                  readOnly={true}
                                  className="bg-pink-50"
                                />
                                <FormInput
                                  control={form.control}
                                  name={`members.${index}.immunizationStatus`}
                                  label="Immunization Status"
                                  readOnly={true}
                                  className="bg-pink-50"
                                />
                                <FormInput
                                  control={form.control}
                                  name={`members.${index}.familyPlanningMethod`}
                                  label="Family Planning Method"
                                  readOnly={true}
                                  className="bg-pink-50"
                                />
                                <FormInput
                                  control={form.control}
                                  name={`members.${index}.familyPlanningSource`}
                                  label="Family Planning Source"
                                  readOnly={true}
                                  className="bg-pink-50"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Environmental Health & Sanitation */}
                {healthProfilingData.data.environmental_health &&
                  Object.keys(healthProfilingData.data.environmental_health).length > 0 && (
                    <AccordionItem value="environmental" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/20">
                            <Droplets className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="font-medium text-foreground">Environmental Health & Sanitation</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormInput
                            control={form.control}
                            name="environmental.waterSupplyType"
                            label="Water Supply Type"
                            readOnly={true}
                            className="bg-blue-50"
                          />
                          <FormInput
                            control={form.control}
                            name="environmental.sanitaryFacilityType"
                            label="Sanitary Facility Type"
                            readOnly={true}
                            className="bg-blue-50"
                          />
                          <FormInput
                            control={form.control}
                            name="environmental.toiletFacilityType"
                            label="Toilet Facility Type"
                            readOnly={true}
                            className="bg-blue-50"
                          />
                          <FormInput
                            control={form.control}
                            name="environmental.wasteManagementType"
                            label="Waste Management Type"
                            readOnly={true}
                            className="bg-blue-50"
                          />
                        </div>
                        <div className="mt-4">
                          <FormTextarea
                            control={form.control}
                            name="environmental.waterSupplyDescription"
                            label="Water Supply Description"
                            readOnly={true}
                            className="bg-blue-50"
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                {/* NCD Records */}
                {healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0 && (
                  <AccordionItem value="ncd" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 dark:bg-red-900/20">
                          <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="font-medium text-foreground">Non-Communicable Disease Records</span>
                        <Badge variant="secondary" className="ml-auto">
                          {healthProfilingData.data.ncd_records.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-6">
                        {healthProfilingData.data.ncd_records.map((ncd: any, index: number) => (
                          <div
                            key={ncd.ncd_id}
                            className="border border-red-200 dark:border-red-800 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/10 space-y-4"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-foreground">
                                {ncd.resident_info.personal_info.first_name} {ncd.resident_info.personal_info.last_name}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                {ncd.resident_info.resident_id}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <FormInput
                                control={form.control}
                                name="demographics.householdNumber"
                                label="Risk Class (40+ years)"
                                readOnly={true}
                                className="bg-red-50"
                                placeholder={ncd.health_data.risk_class_age_group || "N/A"}
                              />
                              <FormInput
                                control={form.control}
                                name="demographics.barangay"
                                label="Comorbidities"
                                readOnly={true}
                                className="bg-red-50"
                                placeholder={`${ncd.health_data.comorbidities || ""}${ncd.health_data.comorbidities_others ? ` (${ncd.health_data.comorbidities_others})` : ""}` || "N/A"}
                              />
                              <FormInput
                                control={form.control}
                                name="demographics.municipality"
                                label="Lifestyle Risk"
                                readOnly={true}
                                className="bg-red-50"
                                placeholder={`${ncd.health_data.lifestyle_risk || ""}${ncd.health_data.lifestyle_risk_others ? ` (${ncd.health_data.lifestyle_risk_others})` : ""}` || "N/A"}
                              />
                              <FormInput
                                control={form.control}
                                name="demographics.province"
                                label="Maintenance Status"
                                readOnly={true}
                                className="bg-red-50"
                                placeholder={ncd.health_data.in_maintenance === "yes" ? "Yes" : "No"}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* TB Surveillance Records */}
                {healthProfilingData.data.tb_surveillance_records &&
                  healthProfilingData.data.tb_surveillance_records.length > 0 && (
                    <AccordionItem value="tb" className="border rounded-lg px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-orange-100 dark:bg-orange-900/20">
                            <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="font-medium text-foreground">TB Surveillance Records</span>
                          <Badge variant="secondary" className="ml-auto">
                            {healthProfilingData.data.tb_surveillance_records.length}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="space-y-6">
                          {healthProfilingData.data.tb_surveillance_records.map((tb: any) => (
                            <div
                              key={tb.tb_id}
                              className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50/50 dark:bg-orange-900/10 space-y-4"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-foreground">
                                  {tb.resident_info.personal_info.first_name} {tb.resident_info.personal_info.last_name}
                                </h4>
                                <Badge variant="outline" className="text-xs">
                                  {tb.resident_info.resident_id}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <FormInput
                                  control={form.control}
                                  name="demographics.householdNumber"
                                  label="Medication Source"
                                  readOnly={true}
                                  className="bg-orange-50"
                                  placeholder={`${tb.health_data.src_anti_tb_meds || ""}${tb.health_data.src_anti_tb_meds_others ? ` (${tb.health_data.src_anti_tb_meds_others})` : ""}` || "N/A"}
                                />
                                <FormInput
                                  control={form.control}
                                  name="demographics.barangay"
                                  label="Days Taking Meds"
                                  readOnly={true}
                                  className="bg-orange-50"
                                  placeholder={`${tb.health_data.no_of_days_taking_meds || ""} days`}
                                />
                                <FormInput
                                  control={form.control}
                                  name="demographics.municipality"
                                  label="TB Status"
                                  readOnly={true}
                                  className="bg-orange-50"
                                  placeholder={tb.health_data.tb_status || "N/A"}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )}

                {/* Survey Identification & Verification */}
                {healthProfilingData.data.survey_identification && (
                  <AccordionItem value="survey" className="border rounded-lg px-4">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100 dark:bg-blue-900/20">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-medium text-foreground">Survey Identification & Verification</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <FormInput
                              control={form.control}
                              name="survey.filledBy"
                              label="Filled By"
                              readOnly={true}
                              className="bg-gray-50"
                            />
                            <Badge variant="secondary" className="text-xs">
                              STAFF
                            </Badge>
                          </div>
                          <FormInput
                            control={form.control}
                            name="survey.informant"
                            label="Informant"
                            readOnly={true}
                            className="bg-gray-50"
                          />
                          <div className="space-y-2">
                            <FormInput
                              control={form.control}
                              name="survey.checkedBy"
                              label="Checked By"
                              readOnly={true}
                              className="bg-gray-50"
                            />
                            <Badge variant="secondary" className="text-xs">
                              STAFF
                            </Badge>
                          </div>
                          <FormInput
                            control={form.control}
                            name="survey.dateCompleted"
                            label="Date Completed"
                            readOnly={true}
                            className="bg-gray-50"
                          />
                        </div>

                        {healthProfilingData.data.survey_identification.signature && (
                          <div className="border-t border-border pt-4">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
                              Digital Signature
                            </p>
                            <div className="inline-block border border-border rounded-lg p-3 bg-background">
                              <img
                                src={healthProfilingData.data.survey_identification.signature || "/placeholder.svg"}
                                alt="Digital Signature"
                                className="h-16 w-32 object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>

              <div className="border-t border-border pt-6 mt-8">
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium text-foreground">Health Family Profile</p>
                  <p className="text-xs text-muted-foreground">This document contains confidential health information</p>
                </div>
              </div>
            </form>
          </Form>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-foreground">No Health Profiling Data</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                This family does not have health profiling data yet.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
