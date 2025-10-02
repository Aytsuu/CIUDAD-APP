// import { Label } from "@/components/ui/label"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { Spinner } from "@/components/ui/spinner"
// import { Separator } from "@/components/ui/separator"
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
// import { useFamilyHealthProfilingData } from "../../record/health-family-profiling/family-profling/queries/profilingFetchQueries"
// import { formatDate } from "@/helpers/dateHelper"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button/button"
// import { Printer } from "lucide-react"
// import FamilyProfilePrintPreview, { FamilyProfilePrintPreviewHandle } from "./FamilyProfilePrintPreview"
// import { useRef, useState } from "react"

// interface HealthFamilyProfileViewProps {
//   familyId: string | null
//   showHealthProfiling: boolean
// }

// const FormField = ({ label, value, className = "", optional = false }: { 
//   label: string; 
//   value: string | null; 
//   className?: string; 
//   optional?: boolean;
// }) => {
//   // For optional fields, show empty string instead of "N/A" if no value
//   const displayValue = !value || value.trim() === '' 
//     ? (optional ? '' : 'N/A') 
//     : value;
    
//   return (
//     <div className={`space-y-2 ${className}`}>
//       <Label className="text-sm font-medium text-gray-700">{label}</Label>
//       <Input value={displayValue} readOnly className="bg-gray-50 border-gray-200" />
//     </div>
//   );
// };

// export default function HealthFamilyProfileView({ familyId, showHealthProfiling }: HealthFamilyProfileViewProps) {
//   const { data: healthProfilingData, isLoading: isLoadingHealthData } = useFamilyHealthProfilingData(
//     showHealthProfiling ? familyId : null,
//   )
//   const [showPrintPreview, setShowPrintPreview] = useState(false)
//   const printPreviewRef = useRef<FamilyProfilePrintPreviewHandle | null>(null)


//   if (!showHealthProfiling) {
//     return null
//   }

//   return (
//     <div>
//       <Card className="p-6 shadow-none rounded-lg">
//         <div className="mb-6">
//           <div className="mb-2 flex justify-between items-center">
//             <div>
//               <h2 className="text-xl font-semibold text-darkBlue1 mb-1">Complete Health Family Profiling</h2>
//             </div>
//             <div className="flex gap-2 no-print">
//               <Button
//                 onClick={() => setShowPrintPreview(!showPrintPreview)}
//                 variant="outline"
//                 size="sm"
//               >
//                 {showPrintPreview ? "Hide Preview" : "Show Print Preview"}
//               </Button>
//               {showPrintPreview && (
//                   <Button
//                     onClick={() => printPreviewRef.current?.PrintForm()}
//                     variant="default"
//                     size="sm"
//                     className="flex items-center gap-2"
//                   >
//                     <Printer className="h-4 w-4" />
//                     Print Form
//                   </Button>
//               )}
//             </div>
//           </div>
//           <p className="text-gray-600 text-sm max-w-3xl">
//             A comprehensive information of the family and members, including their roles, health information and key
//             details.
//           </p>
//         </div>

//         {/* Print Preview */}
//         {showPrintPreview && healthProfilingData?.success && (
//           <div className="mb-6">
//             <FamilyProfilePrintPreview ref={printPreviewRef} data={healthProfilingData.data} />
//           </div>
//         )}

//         {isLoadingHealthData ? (
//           <div className="border rounded-lg p-12">
//             <div className="flex flex-col items-center justify-center gap-4">
//               <Spinner size="lg" />
//               <div className="text-center">
//                 <h3 className="font-medium text-gray-900">Loading health profiling data...</h3>
//                 <p className="text-sm text-gray-500 mt-1">Please wait while we fetch the information</p>
//               </div>
//             </div>
//           </div>
//         ) : healthProfilingData?.success ? (
//           <div className="space-y-8">
//             <Accordion type="multiple" className="w-full space-y-4">
//               <AccordionItem value="demographics" className="border rounded-lg">
//                 <AccordionTrigger className="px-6 py-4 hover:no-underline">
//                   <h3 className="text-lg font-semibold text-gray-900">Household and Address Information</h3>
//                 </AccordionTrigger>
//                 <Separator className=""></Separator>
//                 <AccordionContent className="px-6 pb-6">
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-8 gap-4 mt-4">
//                     <FormField
//                       label="Family ID"
//                       value={healthProfilingData.data.family_info.family_id || ""}
//                     />
//                     <FormField
//                       label="Family Building"
//                       value={healthProfilingData.data.family_info.family_building || ""}
//                     />
//                     <FormField
//                       label="Indigenous Status"
//                       value={healthProfilingData.data.family_info.family_indigenous === 'yes' ? 'Yes' : 
//                              healthProfilingData.data.family_info.family_indigenous === 'no' ? 'No' : 
//                              healthProfilingData.data.family_info.family_indigenous || ""}
//                     />
//                     <FormField
//                       label="Household Number"
//                       value={healthProfilingData.data.family_info.household?.household_id || ""}
//                     />
//                      <FormField
//                       label="Province"
//                       value={healthProfilingData.data.family_info.household?.address?.province || ""}
//                     />
//                     <FormField
//                       label="Municipality"
//                       value={healthProfilingData.data.family_info.household?.address?.city || ""}
//                     />
                   
//                     <FormField
//                       label="Barangay"
//                       value={healthProfilingData.data.family_info.household?.address?.barangay || ""}
//                     />
//                     <FormField
//                       label="Sitio"
//                       value={healthProfilingData.data.family_info.household?.address?.sitio || ""}
//                     />
              
//                   </div>
//                 </AccordionContent>
//               </AccordionItem>

//               <AccordionItem value="family-members" className="border rounded-lg">
//                 <AccordionTrigger className="px-6 py-4 hover:no-underline">
//                   <h3 className="text-lg font-semibold text-gray-900">Family Members</h3>
//                 </AccordionTrigger>
//                 <AccordionContent className="px-6 pb-6">
//                   <div className="space-y-6">
//                     {healthProfilingData.data.family_members.map((member: any) => {
//                       // Debug: Log the member data to see what we're receiving
//                       console.log('Member data:', member);
//                       console.log('Member personal_info:', member.personal_info);
//                       console.log('Member religion:', member.personal_info?.religion);
                      
//                       return (
//                       <div key={member.resident_id} className="border rounded-lg p-4 space-y-4">
//                         <div className="flex items-center justify-between">
//                           <Badge className="text-white text-sm bg-blue-600 hover:bg-blue-700">{member.role}</Badge>
//                           <span className="text-xs text-gray-500  px-2 py-1 rounded">
//                             <Badge className="bg-green-500 hover:bg-green-500 text-sm">{member.resident_id}</Badge>
//                           </span>
//                         </div>

//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                           <FormField label="First Name" value={member.personal_info.first_name} />
//                           <FormField label="Last Name" value={member.personal_info.last_name} />
//                           <FormField label="Middle Name" value={member.personal_info.middle_name} optional={true} />
//                           <FormField label="Sex" value={member.personal_info.sex} />
//                           <FormField
//                             label="Date of Birth"
//                             value={member.personal_info.date_of_birth ? formatDate(member.personal_info.date_of_birth, "long" as any) : ""}
//                           />
//                           <FormField
//                             label="Age"
//                             value={
//                               member.personal_info.date_of_birth
//                                 ? `${new Date().getFullYear() - new Date(member.personal_info.date_of_birth).getFullYear()} years old`
//                                 : ""
//                             }
//                           />
//                           <FormField label="Civil Status" value={member.personal_info.civil_status} />
//                           <FormField label="Education" value={member.personal_info.education} optional={true} />
//                           <FormField label="Religion" value={member.personal_info.religion} optional={true} />
//                           <FormField label="Contact" value={member.personal_info.contact} />
                          
//                         </div>

//                         {/* Health Details */}
//                         {(
//                           member?.health_details?.blood_type ||
//                           member?.per_additional_details?.per_add_philhealth_id ||
//                           member?.per_additional_details?.per_add_covid_vax_status ||
//                           member?.health_details?.philhealth_id ||
//                           member?.health_details?.covid_vax_status
//                         ) && (
//                           <div>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                               {member?.health_details?.blood_type && (
//                                 <FormField label="Blood Type" value={member.health_details.blood_type} />
//                               )}
//                               {(() => {
//                                 const philhealthId =
//                                   member?.per_additional_details?.per_add_philhealth_id ||
//                                   member?.health_details?.philhealth_id
//                                 return philhealthId ? (
//                                   <FormField label="PhilHealth ID" value={philhealthId} />
//                                 ) : null
//                               })()}
//                               {(() => {
//                                 const covidStatus =
//                                   member?.per_additional_details?.per_add_covid_vax_status ||
//                                   member?.health_details?.covid_vax_status
//                                 return covidStatus ? (
//                                   <FormField label="COVID Vaccination Status" value={covidStatus} />
//                                 ) : null
//                               })()}
//                             </div>
//                           </div>
//                         )}

//                         {/* Mother Health Info */}
//                         {member.mother_health_info && (
//                           <>
//                             <Separator />
//                             <div>
//                               <h4 className="font-medium text-gray-700 mb-4">Mother Health Information</h4>
//                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                 <FormField
//                                   label="Health Risk Class"
//                                   value={member.mother_health_info.health_risk_class}
//                                   optional={true}
//                                 />
//                                 <FormField
//                                   label="Immunization Status"
//                                   value={member.mother_health_info.immunization_status}
//                                   optional={true}
//                                 />
//                                 <FormField
//                                   label="Family Planning Method"
//                                   value={member.mother_health_info.family_planning_method}
//                                   optional={true}
//                                 />
//                                 <FormField
//                                   label="Family Planning Source"
//                                   value={member.mother_health_info.family_planning_source}
//                                   optional={true}
//                                 />
//                               </div>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                       );
//                     })}
//                   </div>
//                 </AccordionContent>
//               </AccordionItem>

//               {healthProfilingData.data.environmental_health &&
//                 Object.keys(healthProfilingData.data.environmental_health).length > 0 && (
//                   <AccordionItem value="environmental-health" className="border rounded-lg">
//                     <AccordionTrigger className="px-6 py-4 hover:no-underline">
//                       <h3 className="text-lg font-semibold text-gray-900">Environmental Health & Sanitation</h3>
//                     </AccordionTrigger>
//                     <AccordionContent className="px-6 pb-6">
//                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
//                         {healthProfilingData.data.environmental_health.water_supply && (
//                           <>
//                             <FormField
//                               label="Water Supply Type"
//                               value={healthProfilingData.data.environmental_health.water_supply.type}
//                             />
//                             <FormField
//                               label="Water Supply Description"
//                               value={healthProfilingData.data.environmental_health.water_supply.description}
//                             />
//                           </>
//                         )}
//                         {healthProfilingData.data.environmental_health.sanitary_facility && (
//                           <>
//                             <FormField
//                               label="Sanitary Facility Type"
//                               value={healthProfilingData.data.environmental_health.sanitary_facility.facility_type}
//                             />
//                             <FormField
//                               label="Toilet Facility Type"
//                               value={
//                                 healthProfilingData.data.environmental_health.sanitary_facility.toilet_facility_type ===
//                                 "shared"
//                                   ? "Shared with Other Household"
//                                   : "Not Shared with Other Household"
//                               }
//                             />
//                           </>
//                         )}
//                         {healthProfilingData.data.environmental_health.waste_management && (
//                           <FormField
//                             label="Waste Management"
//                             value={healthProfilingData.data.environmental_health.waste_management.type.replace(
//                               /([A-Z])/g,
//                               " $1",
//                             )}
//                           />
//                         )}
//                       </div>
//                     </AccordionContent>
//                   </AccordionItem>
//                 )}

//               {healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0 && (
//                 <AccordionItem value="ncd-records" className="border rounded-lg">
//                   <AccordionTrigger className="px-6 py-4 hover:no-underline">
//                     <h3 className="text-lg font-semibold text-gray-900">Non-Communicable Disease Records</h3>
//                   </AccordionTrigger>
//                   <AccordionContent className="px-6 pb-6">
//                     <div className="space-y-6">
//                       {healthProfilingData.data.ncd_records.map((ncd: any) => (
//                         <div key={ncd.ncd_id} className="border rounded-lg p-4 space-y-4">
//                           <div className="flex items-center justify-between">
//                             <h4 className="font-semibold text-gray-900">
//                               {ncd.resident_info.personal_info.first_name} {ncd.resident_info.personal_info.last_name}
//                             </h4>
//                             <Badge className="bg-green-500 hover:bg-green-500">{ncd.resident_info.resident_id}</Badge>
//                           </div>
//                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                             <FormField label="Risk Class (40+ years)" value={ncd.health_data.risk_class_age_group} />
//                             <FormField
//                               label="Comorbidities"
//                               value={`${ncd.health_data.comorbidities}${ncd.health_data.comorbidities_others ? ` (${ncd.health_data.comorbidities_others})` : ""}`}
//                             />
//                             <FormField
//                               label="Lifestyle Risk"
//                               value={`${ncd.health_data.lifestyle_risk}${ncd.health_data.lifestyle_risk_others ? ` (${ncd.health_data.lifestyle_risk_others})` : ""}`}
//                             />
//                             {(() => {
//                               const raw = ncd?.health_data?.in_maintenance ?? ncd?.ncd_maintenance_status ?? ncd?.health_data?.maintenance_status
//                               const display = (() => {
//                                 if (raw == null || String(raw).trim() === '') return ''
//                                 const s = String(raw).trim().toLowerCase()
//                                 if (["yes", "y", "true", "1"].includes(s)) return "YES"
//                                 if (["no", "n", "false", "0"].includes(s)) return "NO"
//                                 return String(raw)
//                               })()
//                               return (
//                                 <FormField label="In Maintenance" value={display} />
//                               )
//                             })()}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </AccordionContent>
//                 </AccordionItem>
//               )}

//               {healthProfilingData.data.tb_surveillance_records &&
//                 healthProfilingData.data.tb_surveillance_records.length > 0 && (
//                   <AccordionItem value="tb-surveillance" className="border rounded-lg">
//                     <AccordionTrigger className="px-6 py-4 hover:no-underline">
//                       <h3 className="text-lg font-semibold text-gray-900">TB Surveillance Records</h3>
//                     </AccordionTrigger>
//                     <AccordionContent className="px-6 pb-6">
//                       <div className="space-y-6">
//                         {healthProfilingData.data.tb_surveillance_records.map((tb: any) => (
//                           <div key={tb.tb_id} className="border rounded-lg p-4 space-y-4">
//                             <div className="flex items-center justify-between">
//                               <h4 className="font-semibold text-gray-900">
//                                 {tb.resident_info.personal_info.first_name} {tb.resident_info.personal_info.last_name}
//                               </h4>
//                               <Badge className="bg-green-500 hover:bg-green-500">{tb.resident_info.resident_id}</Badge>
//                             </div>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                               <FormField
//                                 label="Medication Source"
//                                 value={`${tb.health_data.src_anti_tb_meds}${tb.health_data.src_anti_tb_meds_others ? ` (${tb.health_data.src_anti_tb_meds_others})` : ""}`}
//                               />
//                               <FormField
//                                 label="Days Taking Medication"
//                                 value={`${tb.health_data.no_of_days_taking_meds} days`}
//                               />
//                               <FormField label="TB Status" value={tb.health_data.tb_status} />
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </AccordionContent>
//                   </AccordionItem>
//                 )}

//               {healthProfilingData.data.survey_identification && (
//                 <AccordionItem value="survey-identification" className="border rounded-lg">
//                   <AccordionTrigger className="px-6 py-4 hover:no-underline">
//                     <h3 className="text-lg font-semibold text-gray-900">Survey Identification & Verification</h3>
//                   </AccordionTrigger>
//                   <AccordionContent className="px-6 pb-6">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                       <FormField label="Filled By" value={healthProfilingData.data.survey_identification.filled_by} optional={true} />
//                       <FormField label="Informant" value={healthProfilingData.data.survey_identification.informant} optional={true} />
//                       <FormField label="Checked By" value={healthProfilingData.data.survey_identification.checked_by} optional={true} />
//                       <FormField
//                         label="Date Completed"
//                         value={formatDate(healthProfilingData.data.survey_identification.date, "long" as any)}
//                       />
//                     </div>

//                     {healthProfilingData.data.survey_identification.signature && (
//                       <>
//                         <Separator className="my-6" />
//                         <div className="space-y-3">
//                           <h4 className="font-medium text-gray-900">Digital Signature</h4>
//                           <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-4 inline-block">
//                             <img
//                               src={healthProfilingData.data.survey_identification.signature || "/placeholder.svg"}
//                               alt="Digital Signature"
//                               className="h-16 w-32 object-contain bg-white rounded border"
//                             />
//                           </div>
//                         </div>
//                       </>
//                     )}
//                   </AccordionContent>
//                 </AccordionItem>
//               )}
//             </Accordion>
//           </div>
//         ) : (
//           <div className="border rounded-lg p-12">
//             <div className="text-center space-y-4">
//               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto"></div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-2">No Health Profiling Data</h3>
//                 <p className="text-sm text-gray-600 max-w-md mx-auto">
//                   This family does not have health profiling data yet.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   )
// }
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useFamilyHealthProfilingData } from "../../record/health-family-profiling/family-profling/queries/profilingFetchQueries"
import { formatDate } from "@/helpers/dateHelper"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button/button"
import { Printer, Users, Home, Droplets, FileText, Activity, Stethoscope, ClipboardCheck } from "lucide-react"
import FamilyProfilePrintPreview, { type FamilyProfilePrintPreviewHandle } from "./FamilyProfilePrintPreview"
import { useRef, useState } from "react"

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
  <div className="flex items-start gap-3">
    <div className="mt-0.5 p-2 rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div className="flex-1">
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
    </div>
  </div>
)

export default function HealthFamilyProfileView({ familyId, showHealthProfiling }: HealthFamilyProfileViewProps) {
  const { data: healthProfilingData, isLoading: isLoadingHealthData } = useFamilyHealthProfilingData(
    showHealthProfiling ? familyId : null,
  )
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const printPreviewRef = useRef<FamilyProfilePrintPreviewHandle | null>(null)

  if (!showHealthProfiling) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
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
        <div className="space-y-4">
          <Accordion type="multiple" className="space-y-4" defaultValue={["demographics", "family-members"]}>
            {/* Household and Address Information */}
            <AccordionItem value="demographics" className="border-0">
              <Card className="border-border shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                  <SectionHeader
                    icon={Home}
                    title="Household and Address Information"
                    description="Family identification and location details"
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <Separator />
                  <div className="px-6 py-5 bg-muted/20">
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
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Family Members */}
            <AccordionItem value="family-members" className="border-0">
              <Card className="border-border shadow-sm overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                  <SectionHeader
                    icon={Users}
                    title="Family Members"
                    description={`${healthProfilingData.data.family_members.length} member${healthProfilingData.data.family_members.length !== 1 ? "s" : ""} registered`}
                  />
                </AccordionTrigger>
                <AccordionContent>
                  <Separator />
                  <div className="p-6 space-y-4 bg-muted/20">
                    {healthProfilingData.data.family_members.map((member: any, index: number) => (
                      <Card key={member.resident_id} className="border-border shadow-sm bg-background">
                        <CardContent className="p-5 space-y-5">
                          {/* Member Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="text-xs font-medium px-2.5 py-1">
                                {member.role}
                              </Badge>
                              <span className="text-sm font-medium text-foreground">
                                {member.personal_info.first_name} {member.personal_info.last_name}
                              </span>
                            </div>
                            <Badge className="bg-green-500 hover:bg-green-500">
                              {member.resident_id}
                            </Badge>
                          </div>

                          {/* Personal Information */}
                          <div>
                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                              Personal Information
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              <FormField label="First Name" value={member.personal_info.first_name} />
                              <FormField label="Last Name" value={member.personal_info.last_name} />
                              <FormField label="Middle Name" value={member.personal_info.middle_name} optional={true} />
                              <FormField label="Sex" value={member.personal_info.sex} />
                              <FormField
                                label="Date of Birth"
                                value={
                                  member.personal_info.date_of_birth
                                    ? formatDate(member.personal_info.date_of_birth, "long" as any)
                                    : ""
                                }
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
                          </div>

                          {/* Health Details */}
                          {(member?.health_details?.blood_type ||
                            member?.per_additional_details?.per_add_philhealth_id ||
                            member?.per_additional_details?.per_add_covid_vax_status ||
                            member?.health_details?.philhealth_id ||
                            member?.health_details?.covid_vax_status) && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                  Health Details
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {member?.health_details?.blood_type && (
                                    <FormField label="Blood Type" value={member.health_details.blood_type} />
                                  )}
                                  {(() => {
                                    const philhealthId =
                                      member?.per_additional_details?.per_add_philhealth_id ||
                                      member?.health_details?.philhealth_id
                                    return philhealthId ? (
                                      <FormField label="PhilHealth ID" value={philhealthId} />
                                    ) : null
                                  })()}
                                  {(() => {
                                    const covidStatus =
                                      member?.per_additional_details?.per_add_covid_vax_status ||
                                      member?.health_details?.covid_vax_status
                                    return covidStatus ? (
                                      <FormField label="COVID Vaccination Status" value={covidStatus} />
                                    ) : null
                                  })()}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Mother Health Info */}
                          {member.mother_health_info && (
                            <>
                              <Separator />
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                                  Mother Health Information
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    ))}
                  </div>
                </AccordionContent>
              </Card>
            </AccordionItem>

            {/* Environmental Health */}
            {healthProfilingData.data.environmental_health &&
              Object.keys(healthProfilingData.data.environmental_health).length > 0 && (
                <AccordionItem value="environmental-health" className="border-0">
                  <Card className="border-border shadow-sm overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                      <SectionHeader
                        icon={Droplets}
                        title="Environmental Health & Sanitation"
                        description="Water supply, sanitation facilities, and waste management"
                      />
                    </AccordionTrigger>
                    <AccordionContent>
                      <Separator />
                      <div className="px-6 py-5 bg-muted/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
                                  healthProfilingData.data.environmental_health.sanitary_facility
                                    .toilet_facility_type === "shared"
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
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}

            {/* NCD Records */}
            {healthProfilingData.data.ncd_records && healthProfilingData.data.ncd_records.length > 0 && (
              <AccordionItem value="ncd-records" className="border-0">
                <Card className="border-border shadow-sm overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                    <SectionHeader
                      icon={Activity}
                      title="Non-Communicable Disease Records"
                      description={`${healthProfilingData.data.ncd_records.length} record${healthProfilingData.data.ncd_records.length !== 1 ? "s" : ""} found`}
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    <Separator />
                    <div className="p-6 space-y-4 bg-muted/20">
                      {healthProfilingData.data.ncd_records.map((ncd: any) => (
                        <Card key={ncd.ncd_id} className="border-border shadow-sm bg-background">
                          <CardContent className="p-5 space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <h4 className="text-sm font-semibold text-foreground">
                                {ncd.resident_info.personal_info.first_name} {ncd.resident_info.personal_info.last_name}
                              </h4>
                              <Badge className="bg-green-500 hover:bg-green-500">
                                {ncd.resident_info.resident_id}
                              </Badge>
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
                              {(() => {
                                const raw =
                                  ncd?.health_data?.in_maintenance ??
                                  ncd?.ncd_maintenance_status ??
                                  ncd?.health_data?.maintenance_status
                                const display = (() => {
                                  if (raw == null || String(raw).trim() === "") return ""
                                  const s = String(raw).trim().toLowerCase()
                                  if (["yes", "y", "true", "1"].includes(s)) return "YES"
                                  if (["no", "n", "false", "0"].includes(s)) return "NO"
                                  return String(raw)
                                })()
                                return <FormField label="In Maintenance" value={display} />
                              })()}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            )}

            {/* TB Surveillance */}
            {healthProfilingData.data.tb_surveillance_records &&
              healthProfilingData.data.tb_surveillance_records.length > 0 && (
                <AccordionItem value="tb-surveillance" className="border-0">
                  <Card className="border-border shadow-sm overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                      <SectionHeader
                        icon={Stethoscope}
                        title="TB Surveillance Records"
                        description={`${healthProfilingData.data.tb_surveillance_records.length} record${healthProfilingData.data.tb_surveillance_records.length !== 1 ? "s" : ""} found`}
                      />
                    </AccordionTrigger>
                    <AccordionContent>
                      <Separator />
                      <div className="p-6 space-y-4 bg-muted/20">
                        {healthProfilingData.data.tb_surveillance_records.map((tb: any) => (
                          <Card key={tb.tb_id} className="border-border shadow-sm bg-background">
                            <CardContent className="p-5 space-y-4">
                              <div className="flex flex-wrap items-center justify-between gap-3">
                                <h4 className="text-sm font-semibold text-foreground">
                                  {tb.resident_info.personal_info.first_name} {tb.resident_info.personal_info.last_name}
                                </h4>
                                <Badge className="bg-green-500 hover:bg-green-500">
                                  {tb.resident_info.resident_id}
                                </Badge>
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
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              )}

            {/* Survey Identification */}
            {healthProfilingData.data.survey_identification && (
              <AccordionItem value="survey-identification" className="border-0">
                <Card className="border-border shadow-sm overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                    <SectionHeader
                      icon={ClipboardCheck}
                      title="Survey Identification & Verification"
                      description="Survey completion and verification details"
                    />
                  </AccordionTrigger>
                  <AccordionContent>
                    <Separator />
                    <div className="px-6 py-5 bg-muted/20 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FormField
                          label="Filled By"
                          value={healthProfilingData.data.survey_identification.filled_by}
                          optional={true}
                        />
                        <FormField
                          label="Informant"
                          value={healthProfilingData.data.survey_identification.informant}
                          optional={true}
                        />
                        <FormField
                          label="Checked By"
                          value={healthProfilingData.data.survey_identification.checked_by}
                          optional={true}
                        />
                        <FormField
                          label="Date Completed"
                          value={formatDate(healthProfilingData.data.survey_identification.date, "long" as any)}
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
                  </AccordionContent>
                </Card>
              </AccordionItem>
            )}
          </Accordion>
        </div>
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
                  This family does not have health profiling data yet. Please complete the health profiling form to view
                  information here.
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
