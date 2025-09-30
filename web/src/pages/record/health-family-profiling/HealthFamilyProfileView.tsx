import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useFamilyHealthProfilingData } from "../../record/health-family-profiling/family-profling/queries/profilingFetchQueries"
import { formatDate } from "@/helpers/dateHelper"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button/button"
import { Printer } from "lucide-react"
import FamilyProfilePrintPreview, { FamilyProfilePrintPreviewHandle } from "./FamilyProfilePrintPreview"
import { useRef, useState } from "react"

interface HealthFamilyProfileViewProps {
  familyId: string | null
  showHealthProfiling: boolean
}

const FormField = ({ label, value, className = "", optional = false }: { 
  label: string; 
  value: string | null; 
  className?: string; 
  optional?: boolean;
}) => {
  // For optional fields, show empty string instead of "N/A" if no value
  const displayValue = !value || value.trim() === '' 
    ? (optional ? '' : 'N/A') 
    : value;
    
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-gray-700">{label}</Label>
      <Input value={displayValue} readOnly className="bg-gray-50 border-gray-200" />
    </div>
  );
};

export default function HealthFamilyProfileView({ familyId, showHealthProfiling }: HealthFamilyProfileViewProps) {
  const { data: healthProfilingData, isLoading: isLoadingHealthData } = useFamilyHealthProfilingData(
    showHealthProfiling ? familyId : null,
  )
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const printPreviewRef = useRef<FamilyProfilePrintPreviewHandle | null>(null)

  const handlePrint = () => {
    window.print()
  }

  if (!showHealthProfiling) {
    return null
  }

  return (
    <div>
      <Card className="p-6 shadow-none rounded-lg">
        <div className="mb-6">
          <div className="mb-2 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-darkBlue1 mb-1">Complete Health Family Profiling</h2>
            </div>
            <div className="flex gap-2 no-print">
              <Button
                onClick={() => setShowPrintPreview(!showPrintPreview)}
                variant="outline"
                size="sm"
              >
                {showPrintPreview ? "Hide Preview" : "Show Print Preview"}
              </Button>
              {showPrintPreview && (
                <>
                  <Button
                    onClick={() => printPreviewRef.current?.exportToExcel()}
                    variant="outline"
                    size="sm"
                  >
                    Export to Excel
                  </Button>
                  <Button
                    onClick={() => printPreviewRef.current?.exportToPDF()}
                    variant="outline"
                    size="sm"
                  >
                    Export to PDF
                  </Button>
                </>
              )}
              {healthProfilingData?.success && (
                <Button
                  onClick={handlePrint}
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

        {isLoadingHealthData ? (
          <div className="border rounded-lg p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Spinner size="lg" />
              <div className="text-center">
                <h3 className="font-medium text-gray-900">Loading health profiling data...</h3>
                <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the information</p>
              </div>
            </div>
          </div>
        ) : healthProfilingData?.success ? (
          <div className="space-y-8">
            <Accordion type="multiple" className="w-full space-y-4">
              <AccordionItem value="demographics" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold text-gray-900">Household and Address Information</h3>
                </AccordionTrigger>
                <Separator className=""></Separator>
                <AccordionContent className="px-6 pb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-4 mt-4">
                    <FormField
                      label="Family ID"
                      value={healthProfilingData.data.family_info.family_id || ""}
                    />
                    <FormField
                      label="Family Building"
                      value={healthProfilingData.data.family_info.family_building || ""}
                    />
                    <FormField
                      label="Indigenous Status"
                      value={healthProfilingData.data.family_info.family_indigenous === 'yes' ? 'Yes' : 
                             healthProfilingData.data.family_info.family_indigenous === 'no' ? 'No' : 
                             healthProfilingData.data.family_info.family_indigenous || ""}
                    />
                    <FormField
                      label="Household Number"
                      value={healthProfilingData.data.family_info.household?.household_id || ""}
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="family-members" className="border rounded-lg">
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {healthProfilingData.data.family_members.map((member: any) => {
                      // Debug: Log the member data to see what we're receiving
                      console.log('Member data:', member);
                      console.log('Member personal_info:', member.personal_info);
                      console.log('Member religion:', member.personal_info?.religion);
                      
                      return (
                      <div key={member.resident_id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <Badge className="text-white text-base bg-blue-600 hover:bg-blue-700">{member.role}</Badge>
                          <span className="text-xs text-gray-500  px-2 py-1 rounded">
                            <Badge className="bg-green-500 hover:bg-green-500 text-base">{member.resident_id}</Badge>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <FormField label="First Name" value={member.personal_info.first_name} />
                          <FormField label="Last Name" value={member.personal_info.last_name} />
                          <FormField label="Middle Name" value={member.personal_info.middle_name} optional={true} />
                          <FormField label="Sex" value={member.personal_info.sex} />
                          <FormField
                            label="Date of Birth"
                            value={member.personal_info.date_of_birth ? formatDate(member.personal_info.date_of_birth, "long" as any) : ""}
                          />
                          <FormField
                            label="Age"
                            value={
                              member.personal_info.date_of_birth
                                ? `${new Date().getFullYear() - new Date(member.personal_info.date_of_birth).getFullYear()} years old`
                                : ""
                            }
                          />
                          <FormField label="Civil Status" value={member.personal_info.civil_status} />
                          <FormField label="Education" value={member.personal_info.education} optional={true} />
                          <FormField label="Religion" value={member.personal_info.religion} optional={true} />
                          <FormField label="Contact" value={member.personal_info.contact} />
                          
                        </div>

                        {/* Health Details */}
                        {(member.health_details.blood_type ||
                          member.health_details.philhealth_id ||
                          member.health_details.covid_vax_status) && (
                          
                          
                            <div>
                            
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {member.health_details.blood_type && (
                                  <FormField label="Blood Type" value={member.health_details.blood_type} />
                                )}
                                {member.health_details.philhealth_id && (
                                  <FormField label="PhilHealth ID" value={member.health_details.philhealth_id} />
                                )}
                                {member.health_details.covid_vax_status && (
                                  <FormField
                                    label="COVID Vaccination Status"
                                    value={member.health_details.covid_vax_status}
                                  />
                                )}
                              </div>
                            </div>
                          
                        )}

                        {/* Mother Health Info */}
                        {member.mother_health_info && (
                          <>
                            <Separator />
                            <div>
                              <h4 className="font-medium text-gray-700 mb-4">Mother Health Information</h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {healthProfilingData.data.environmental_health &&
                Object.keys(healthProfilingData.data.environmental_health).length > 0 && (
                  <AccordionItem value="environmental-health" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <h3 className="text-lg font-semibold text-gray-900">Environmental Health & Sanitation</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {healthProfilingData.data.environmental_health.water_supply && (
                          <>
                            <FormField
                              label="Water Supply Type"
                              value={healthProfilingData.data.environmental_health.water_supply.type}
                            />
                            <FormField
                              label="Water Supply Description"
                              value={healthProfilingData.data.environmental_health.water_supply.description}
                            />
                          </>
                        )}
                        {healthProfilingData.data.environmental_health.sanitary_facility && (
                          <>
                            <FormField
                              label="Sanitary Facility Type"
                              value={healthProfilingData.data.environmental_health.sanitary_facility.facility_type}
                            />
                            <FormField
                              label="Toilet Facility Type"
                              value={
                                healthProfilingData.data.environmental_health.sanitary_facility.toilet_facility_type ===
                                "shared"
                                  ? "Shared with Other Household"
                                  : "Not Shared with Other Household"
                              }
                            />
                          </>
                        )}
                        {healthProfilingData.data.environmental_health.waste_management && (
                          <FormField
                            label="Waste Management"
                            value={healthProfilingData.data.environmental_health.waste_management.type.replace(
                              /([A-Z])/g,
                              " $1",
                            )}
                          />
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

              {healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0 && (
                <AccordionItem value="ncd-records" className="border rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <h3 className="text-lg font-semibold text-gray-900">Non-Communicable Disease Records</h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="space-y-6">
                      {healthProfilingData.data.ncd_records.map((ncd: any) => (
                        <div key={ncd.ncd_id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-gray-900">
                              {ncd.resident_info.personal_info.first_name} {ncd.resident_info.personal_info.last_name}
                            </h4>
                            <Badge className="bg-green-500 hover:bg-green-500">{ncd.resident_info.resident_id}</Badge>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <FormField label="Risk Class (40+ years)" value={ncd.health_data.risk_class_age_group} />
                            <FormField
                              label="Comorbidities"
                              value={`${ncd.health_data.comorbidities}${ncd.health_data.comorbidities_others ? ` (${ncd.health_data.comorbidities_others})` : ""}`}
                            />
                            <FormField
                              label="Lifestyle Risk"
                              value={`${ncd.health_data.lifestyle_risk}${ncd.health_data.lifestyle_risk_others ? ` (${ncd.health_data.lifestyle_risk_others})` : ""}`}
                            />
                            <FormField
                              label="In Maintenance"
                              value={ncd.health_data.in_maintenance === "yes" ? "Yes" : "No"}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}

              {healthProfilingData.data.tb_surveillance_records &&
                healthProfilingData.data.tb_surveillance_records.length > 0 && (
                  <AccordionItem value="tb-surveillance" className="border rounded-lg">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                      <h3 className="text-lg font-semibold text-gray-900">TB Surveillance Records</h3>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6">
                      <div className="space-y-6">
                        {healthProfilingData.data.tb_surveillance_records.map((tb: any) => (
                          <div key={tb.tb_id} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900">
                                {tb.resident_info.personal_info.first_name} {tb.resident_info.personal_info.last_name}
                              </h4>
                              <Badge className="bg-green-500 hover:bg-green-500">{tb.resident_info.resident_id}</Badge>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <FormField
                                label="Medication Source"
                                value={`${tb.health_data.src_anti_tb_meds}${tb.health_data.src_anti_tb_meds_others ? ` (${tb.health_data.src_anti_tb_meds_others})` : ""}`}
                              />
                              <FormField
                                label="Days Taking Medication"
                                value={`${tb.health_data.no_of_days_taking_meds} days`}
                              />
                              <FormField label="TB Status" value={tb.health_data.tb_status} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

              {healthProfilingData.data.survey_identification && (
                <AccordionItem value="survey-identification" className="border rounded-lg">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline">
                    <h3 className="text-lg font-semibold text-gray-900">Survey Identification & Verification</h3>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <FormField label="Filled By" value={healthProfilingData.data.survey_identification.filled_by} optional={true} />
                      <FormField label="Informant" value={healthProfilingData.data.survey_identification.informant} optional={true} />
                      <FormField label="Checked By" value={healthProfilingData.data.survey_identification.checked_by} optional={true} />
                      <FormField
                        label="Date Completed"
                        value={formatDate(healthProfilingData.data.survey_identification.date, "long" as any)}
                      />
                    </div>

                    {healthProfilingData.data.survey_identification.signature && (
                      <>
                        <Separator className="my-6" />
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Digital Signature</h4>
                          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 inline-block">
                            <img
                              src={healthProfilingData.data.survey_identification.signature || "/placeholder.svg"}
                              alt="Digital Signature"
                              className="h-16 w-32 object-contain bg-white rounded border"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        ) : (
          <div className="border rounded-lg p-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Health Profiling Data</h3>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  This family does not have health profiling data yet.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}