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
import { useState } from "react"
import FamilyProfilePrintPreview from "./FamilyProfilePrintPreview"

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

  const handlePrint = () => {
    window.print()
  }

  if (!showHealthProfiling) {
    return null
  }

  return (
    <div>

      <Card className="p-6 shadow-none rounded-lg">
              <PrintFormField label="6h. Blood Type" value={motherData.health_details.blood_type || ""} />
            </div>

            {/* Mother Health Info */}
            {motherData.mother_health_info && (
              <div className="mt-2">
                <div className="flex gap-4 mb-2">
                  <span className="text-xs font-medium">Health Risk Classification (Malaking nag lunang):</span>
                  <span className="text-xs">LMF (Low):</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <PrintFormField label="Family Planning Method" value={motherData.mother_health_info.family_planning_method || ""} />
                  <PrintFormField label="Family Planning Source" value={motherData.mother_health_info.family_planning_source || ""} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Children Table */}
      {children.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-bold mb-3">IGA BATA/NG (0-59 KA BULAN) (Under five)</h3>
          <table className="w-full border border-gray-400 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-1">Pagalan (Magulang sa Maguwang)</th>
                <th className="border border-gray-400 p-1">Kasarihan (M/F)</th>
                <th className="border border-gray-400 p-1">Edad</th>
                <th className="border border-gray-400 p-1">Birthday (mm/dd/yy)</th>
                <th className="border border-gray-400 p-1">Relasyon sa HH Head</th>
                <th className="border border-gray-400 p-1">FIC (enciocle)</th>
                <th className="border border-gray-400 p-1">Nutritional Status</th>
                <th className="border border-gray-400 p-1">Exclusive BF (enciocle)</th>
              </tr>
            </thead>
            <tbody>
              {children.slice(0, 6).map((child: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1">{`${child.personal_info.last_name}, ${child.personal_info.first_name}`}</td>
                  <td className="border border-gray-400 p-1">{child.personal_info.sex}</td>
                  <td className="border border-gray-400 p-1">{child.personal_info.date_of_birth ? 
                    new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear() : ""}</td>
                  <td className="border border-gray-400 p-1">{child.personal_info.date_of_birth ? 
                    new Date(child.personal_info.date_of_birth).toLocaleDateString() : ""}</td>
                  <td className="border border-gray-400 p-1">{child.role}</td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                </tr>
              ))}
              {/* Add empty rows if needed */}
              {[...Array(Math.max(0, 6 - children.length))].map((_, index) => (
                <tr key={`empty-${index}`}>
                  <td className="border border-gray-400 p-1 h-6"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Environmental Health Section */}
      <div className="mb-6">
        <h2 className="text-sm font-bold mb-3 bg-gray-200 p-2">I. ENVIRONMENTAL HEALTH AND SANITATION</h2>
        
        {/* Water Supply */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">TYPE OF WATER SUPPLY</h3>
          <div className="grid grid-cols-3 gap-4 border border-gray-400 p-2">
            <div>
              <label className="flex items-center gap-1 mb-1">
                <input type="checkbox" checked={environmentalData?.water_supply?.type === 'LEVEL I'} readOnly />
                <span className="text-xs">LEVEL I</span>
              </label>
              <div className="text-xs">
                <span className="font-medium">POINT SOURCE</span>
                <p>protected/unprotected dug well or dug well without distribution/piping system supplying within 250 meter radius</p>
                <p>(e.g. balon, poso, or spring)</p>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 mb-1">
                <input type="checkbox" checked={environmentalData?.water_supply?.type === 'LEVEL II'} readOnly />
                <span className="text-xs">LEVEL II</span>
              </label>
              <div className="text-xs">
                <span className="font-medium">COMMUNAL (COMMON) FAUCET OR STANDPOST</span>
                <p>HH using point source with distribution system to a communal (common) faucet or standpost supplying within 25 meter radius</p>
              </div>
            </div>
            <div>
              <label className="flex items-center gap-1 mb-1">
                <input type="checkbox" checked={environmentalData?.water_supply?.type === 'LEVEL III'} readOnly />
                <span className="text-xs">LEVEL III</span>
              </label>
              <div className="text-xs">
                <span className="font-medium">INDIVIDUAL CONNECTION</span>
                <p>HH with faucet/tap (e.g. water supplied by MCWD, BWSA, Homeowners' Assoc./Subdivision)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sanitary Facility */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">TYPE OF SANITARY FACILITY</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-gray-400 p-2">
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={environmentalData?.sanitary_facility?.facility_type?.includes('flush')} readOnly />
                  <span className="text-xs">Pour/flush type with septic tank</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={environmentalData?.sanitary_facility?.facility_type?.includes('water-sealed')} readOnly />
                  <span className="text-xs">Water-sealed toilet without septic tank</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" readOnly />
                  <span className="text-xs">Pour/flush toilet connected to septic tank AND to sewerage system</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" readOnly />
                  <span className="text-xs">Overhung latrine</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" readOnly />
                  <span className="text-xs">Ventilated Pit (VIP) Latrine</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" readOnly />
                  <span className="text-xs">Open Pit Latrine</span>
                </label>
                <label className="flex items-center gap-1">
                  <input type="checkbox" readOnly />
                  <span className="text-xs">Without toilet</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="mt-2">
            <span className="text-xs font-medium">Is Toilet </span>
            <label className="inline-flex items-center gap-1 mr-4">
              <input type="checkbox" checked={environmentalData?.sanitary_facility?.toilet_facility_type !== 'shared'} readOnly />
              <span className="text-xs">NOT SHARED with Other Household</span>
            </label>
            <span className="text-xs">or </span>
            <label className="inline-flex items-center gap-1">
              <input type="checkbox" checked={environmentalData?.sanitary_facility?.toilet_facility_type === 'shared'} readOnly />
              <span className="text-xs">SHARED with Other Household</span>
            </label>
          </div>
        </div>

        {/* Solid Waste Management */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">SOLID WASTE MANAGEMENT</h3>
          <div className="grid grid-cols-3 gap-4">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={environmentalData?.waste_management?.type?.includes('Segregation')} readOnly />
              <span className="text-xs">Waste Segregation</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={environmentalData?.waste_management?.type?.includes('Recycling')} readOnly />
              <span className="text-xs">Recycling/Reuse</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={environmentalData?.waste_management?.type?.includes('Burning')} readOnly />
              <span className="text-xs">Burning/Burying</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={environmentalData?.waste_management?.type?.includes('Composting')} readOnly />
              <span className="text-xs">Backyard Composting</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={environmentalData?.waste_management?.type?.includes('Collection')} readOnly />
              <span className="text-xs">Collected by City Collection and Disposal System</span>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" readOnly />
              <span className="text-xs">Others (pls. specify):</span>
            </label>
          </div>
        </div>
      </div>

      {/* NCD Section */}
      {ncdRecords.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 bg-gray-200 p-2">I. NON-COMMUNICABLE DISEASE</h2>
          <div className="text-xs mb-2">
            <p><strong>*Hindi NHA laong dili kini applicable</strong></p>
            <p><strong>Comorbidities/Sakit/Babatos:</strong></p>
            <p>H = Hypertension (Hygitotel); CKD = Chronic Kidney Disease (Nota Dialysis); Others (Pls. specify unsay sakit diagnose)</p>
          </div>
          
          <table className="w-full border border-gray-400 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-1">Pangalan</th>
                <th className="border border-gray-400 p-1">Edad</th>
                <th className="border border-gray-400 p-1">Kasarian</th>
                <th className="border border-gray-400 p-1">Comorbidities/Sakit/Babatos</th>
                <th className="border border-gray-400 p-1">Lifestyle Risk</th>
                <th className="border border-gray-400 p-1">Naka Maintenance?</th>
              </tr>
            </thead>
            <tbody>
              {ncdRecords.slice(0, 8).map((ncd: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1">{`${ncd.resident_info.personal_info.last_name}, ${ncd.resident_info.personal_info.first_name}`}</td>
                  <td className="border border-gray-400 p-1">{ncd.resident_info.personal_info.date_of_birth ? 
                    new Date().getFullYear() - new Date(ncd.resident_info.personal_info.date_of_birth).getFullYear() : ""}</td>
                  <td className="border border-gray-400 p-1">{ncd.resident_info.personal_info.sex}</td>
                  <td className="border border-gray-400 p-1">{ncd.health_data.comorbidities}</td>
                  <td className="border border-gray-400 p-1">{ncd.health_data.lifestyle_risk}</td>
                  <td className="border border-gray-400 p-1">{ncd.health_data.in_maintenance === 'yes' ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {/* Add empty rows */}
              {[...Array(Math.max(0, 8 - ncdRecords.length))].map((_, index) => (
                <tr key={`empty-ncd-${index}`}>
                  <td className="border border-gray-400 p-1 h-6"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TB Surveillance Section */}
      {tbRecords.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold mb-3 bg-gray-200 p-2">Tuberculosis Surveillance (Ipuhat NHA kang walay miyembro sa pamilya niadtong og TB)</h2>
          
          <table className="w-full border border-gray-400 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-400 p-1">Pangalan</th>
                <th className="border border-gray-400 p-1">Edad</th>
                <th className="border border-gray-400 p-1">Kasarian (M/F)</th>
                <th className="border border-gray-400 p-1">Source of Anti-TB Meds</th>
                <th className="border border-gray-400 p-1">No. of Days on Anti-TB Meds</th>
                <th className="border border-gray-400 p-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {tbRecords.slice(0, 4).map((tb: any, index: number) => (
                <tr key={index}>
                  <td className="border border-gray-400 p-1">{`${tb.resident_info.personal_info.last_name}, ${tb.resident_info.personal_info.first_name}`}</td>
                  <td className="border border-gray-400 p-1">{tb.resident_info.personal_info.date_of_birth ? 
                    new Date().getFullYear() - new Date(tb.resident_info.personal_info.date_of_birth).getFullYear() : ""}</td>
                  <td className="border border-gray-400 p-1">{tb.resident_info.personal_info.sex}</td>
                  <td className="border border-gray-400 p-1">{tb.health_data.src_anti_tb_meds}</td>
                  <td className="border border-gray-400 p-1">{tb.health_data.no_of_days_taking_meds}</td>
                  <td className="border border-gray-400 p-1">{tb.health_data.tb_status}</td>
                </tr>
              ))}
              {/* Add empty rows */}
              {[...Array(Math.max(0, 4 - tbRecords.length))].map((_, index) => (
                <tr key={`empty-tb-${index}`}>
                  <td className="border border-gray-400 p-1 h-6"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                  <td className="border border-gray-400 p-1"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Survey Identification */}
      <div className="mt-8 border-2 border-gray-400 p-4">
        <h3 className="text-sm font-bold mb-3">SURVEY IDENTIFICATION</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <PrintFormField label="Filled by" value={surveyData?.filled_by || ""} />
          <PrintFormField label="Confirmed" value={surveyData?.checked_by || ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PrintFormField label="Informant (Name & Signature)" value={surveyData?.informant || ""} />
          <PrintFormField label="Date" value={surveyData?.date ? formatDate(surveyData.date, "short" as any) : ""} />
        </div>
        
        <div className="mt-4 p-2 border border-gray-300">
          <p className="text-xs">
            <strong>Household</strong> as defined by the Philippine Statistical Authority (PSA) is a social unit consisting of a person living 
            alone or a group of persons who usually sleep in the same housing unit and have a common arrangement in the 
            preparation and consumption of food.
          </p>
          <p className="text-xs mt-2">
            Manual on Field Health Services Information System<br/>
            CHO265 rev. 2018 Department of Health
          </p>
        </div>
      </div>

      <div className="mt-8 text-right">
        <p className="text-xs">Updated Ver.: December 2023</p>
      </div>
    </div>
  );
};

export default function HealthFamilyProfileView({ familyId, showHealthProfiling }: HealthFamilyProfileViewProps) {
  const { data: healthProfilingData, isLoading: isLoadingHealthData } = useFamilyHealthProfilingData(
    showHealthProfiling ? familyId : null,
  )
  const [showPrintPreview, setShowPrintPreview] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  if (!showHealthProfiling) {
    return null
  }

  return (
    <div>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-preview, .print-preview * {
            visibility: visible;
          }
          .print-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 20px !important;
          }
          .print-field {
            page-break-inside: avoid;
          }
          table {
            page-break-inside: avoid;
          }
          thead {
            display: table-header-group;
          }
          .no-print {
            display: none !important;
          }
        }
        
        .print-preview {
          font-family: 'Times New Roman', serif;
        }
        
        .print-preview table {
          border-collapse: collapse;
        }
        
        .print-preview input[type="checkbox"] {
          transform: scale(0.8);
        }
      `}</style>

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
          <FamilyProfilePrintPreview data={healthProfilingData.data} />
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
                    label="Household Number"
                    value={healthProfilingData.data.family_info.household?.household_id || ""}
                  />
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
