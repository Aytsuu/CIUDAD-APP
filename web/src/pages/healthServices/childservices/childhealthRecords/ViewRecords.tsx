"use client"

import { useMemo, useState, useEffect } from "react"
import React from "react"
import { Card, CardContent } from "@/components/ui/card/card" // Corrected import path
import { ChevronLeft, ChevronDown, ClipboardList, User, Users, AlertTriangle, HeartPulse, BookText, Soup, Syringe, Pill } from "lucide-react" // Added multiple icons
import { format } from "date-fns"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button/button" // Corrected import path
import { useNavigate, useLocation } from "react-router-dom" // Assuming react-router-dom for navigation
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { api2 } from "@/api/api"

// Define types for the complex data structure
interface PersonalInfo {
  per_id?: number
  per_lname: string
  per_fname: string
  per_mname: string | null
  per_suffix: string | null
  per_dob: string
  per_sex: string
  per_status: string
  per_edAttainment: string
  per_religion: string
  per_contact: string
}

interface RPInfo {
  rp_id: string
  per: PersonalInfo
  rp_date_registered: string
  staff: string
}

interface FamilyHead {
  role: string
  personal_info: PersonalInfo
  rp_id?: string
  composition_id?: number
}

interface FamilyHeads {
  mother?: FamilyHead
  father?: FamilyHead
}

interface FamilyHeadInfo {
  fam_id: string | null
  family_heads: FamilyHeads
  has_mother: boolean
  has_father: boolean
  total_heads: number
}

interface SpouseInfo {
  spouse_exists: boolean
  allow_spouse_insertion?: boolean
  reason?: string
  spouse_id?: number
  spouse_type?: string
  spouse_lname?: string
  spouse_fname?: string
  spouse_mname?: string
  spouse_occupation?: string
  spouse_dob?: string
  created_at?: string
}

interface Address {
  add_street: string
  add_barangay: string
  add_city: string
  add_province: string
  add_sitio: string
  full_address: string
}

interface PatDetails {
  pat_id: string
  personal_info: PersonalInfo
  address: Address
  rp_id: RPInfo | null
  family_compositions: any[]
  households: any[]
  family: { fam_id: string; fc_role: string; fc_id: number } | null
  family_head_info: FamilyHeadInfo
  spouse_info: SpouseInfo
  pat_type: string
  pat_status: string
  created_at: string
  updated_at: string
  trans_id: string | null
}

interface PatRecDetails {
  patrec_id: number
  pat_details: PatDetails
  patrec_type: string
  created_at: string
  pat_id: string
}

interface StaffDetails {
  staff_id: string
  staff_assign_date: string
  staff_type: string
  rp: {
    rp_id: string
    per: PersonalInfo
    rp_date_registered: string
    staff: string
  }
  pos: {
    pos_id: number
    pos_title: string
    pos_max: number
    pos_group: string
    staff: string
  }
  manager: string
}

interface CHRecDetails {
  chrec_id: number
  staff_details: StaffDetails
  patrec_details: PatRecDetails
  chr_date: string
  ufc_no: string
  family_no: string
  mother_occupation: string
  father_occupation: string
  updated_at: string
  type_of_feeding: string
  place_of_delivery_type: string
  birth_order: string
  pod_location: string
  staff: string
  patrec: number
}

interface DisabilityDetails {
  disability_id: number
  disability_name: string
  created_at: string
}

interface Disability {
  pd_id: number
  disability_details: DisabilityDetails
  created_at: string
  patrec: number
  disability: number
}

interface FollowVDetails {
  followv_id: number
  followv_date: string
  followv_status: string
  followv_description: string
  created_at: string
  updated_at: string
  patrec: number
}

interface CHNotes {
  chnotes_id: number
  chhist_details: any
  followv_details: FollowVDetails | null
  staff_details: StaffDetails
  chn_notes: string
  created_at: string
  updated_at: string
  chhist: number
  followv: number | null
  staff: string
}

interface BMDetails {
  bm_id: number
  age: string
  height: string
  weight: string
  created_at: string
  patrec: number
  staff: string
}

interface CHVitalSigns {
  chvital_id: number
  find_details: any
  bm_details: BMDetails
  chhist_details: any
  temp: string
  created_at: string
  bm: number
  find: any
  chhist: number
}

interface MedDetail {
  med_id: string
  catlist: string
  med_name: string
  med_type: string
  created_at: string
  updated_at: string
  cat: number
}

interface MinvDetail {
  minv_id: number
  inv_detail: any
  med_detail: MedDetail
  inv_id: string
  med_id: string
  minv_dsg: number
  minv_dsg_unit: string
  minv_form: string
  minv_qty: number
  minv_qty_unit: string
  minv_pcs: number
  minv_qty_avail: number
}

interface MedRecDetail {
  medrec_id: number
  minv_details: MinvDetail
  medrec_qty: number
  reason: string | null
  requested_at: string
  fulfilled_at: string
  signature: string | null
  patrec_id: number
  minv_id: number
  medreq_id: number | null
  staff: string | null
}

interface CHSupplement {
  chsupplement_id: number
  medrec_details: MedRecDetail
  chhist: number
  medrec: number
}

interface EBFCheck {
  ebf_id: number
  chhist_details: any
  ebf_date: string
  chhist: number
}

interface CHSSupplementStat {
  chssupplementstat_id: number
  chsupp_details: any
  birthwt: string | null
  status_type: string
  date_seen: string
  date_given_iron: string
  created_at: string
  updated_at: string
  chsupplement: number
  date_completed?: string | null // Added this field as per the user's request
}

interface NutritionStatus {
  nutstat_id: number
  chvital_details: any
  wfa: string
  lhfa: string
  wfl: string
  muac: string
  created_at: string
  chvital: number
}

interface ChildHealthHistoryRecord {
  chhist_id: number
  disabilities: Disability[]
  created_at: string
  tt_status: string
  status: string
  chrec: number
  chrec_details: CHRecDetails
  child_health_notes: CHNotes[]
  child_health_vital_signs: CHVitalSigns[]
  child_health_supplements: CHSupplement[]
  exclusive_bf_checks: EBFCheck[]
  immunization_tracking: any[]
  supplements_statuses: CHSSupplementStat[]
  nutrition_statuses: NutritionStatus[]
}

// Number of records to display in the comparison view at once
const VISIBLE_COLUMNS = 4
export default function ChildHealthHistoryDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { patId, chrecId } = location.state?.params || {}

  const [fullHistoryData, setFullHistoryData] = useState<ChildHealthHistoryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentScrollIndex, setCurrentScrollIndex] = useState(0)

  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      try {
        const historyResponse = await api2.get(`/child-health/history/${chrecId}/`)
        const sortedHistory = (historyResponse.data[0]?.child_health_histories || []).sort(
          (a: ChildHealthHistoryRecord, b: ChildHealthHistoryRecord) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        setFullHistoryData(sortedHistory)
      } catch (error) {
        console.error("Error fetching child health history:", error)
      } finally {
        setIsLoading(false)
      }
    }
    if (patId) {
      fetchAllData()
    }
  }, [patId, chrecId])

  const latestOverallRecord = useMemo(() => fullHistoryData[0] || null, [fullHistoryData])
  const recordsToDisplay = useMemo(() => {
    return fullHistoryData.slice(currentScrollIndex, currentScrollIndex + VISIBLE_COLUMNS)
  }, [fullHistoryData, currentScrollIndex])

  const getValueByPath = (obj: any, path: string[]) => {
    return path.reduce((acc, part) => {
      if (acc === undefined || acc === null) return undefined
      if (Array.isArray(acc) && !isNaN(Number(part))) {
        return acc[Number(part)]
      }
      return acc[part]
    }, obj)
  }

  const getDiffClass = (currentColumnValue: any, latestRecordValue: any) => {
    const normalizeValue = (val: any) => (val === null || val === undefined || val === "" ? null : val)
    const normalizedCurrent = normalizeValue(currentColumnValue)
    const normalizedLatest = normalizeValue(latestRecordValue)

    if (normalizedCurrent === null && normalizedLatest === null) {
      return ""
    }
    if (
      typeof normalizedCurrent === "string" &&
      typeof normalizedLatest === "string" &&
      (normalizedCurrent.match(/^\d{4}-\d{2}-\d{2}/) || normalizedCurrent.match(/^\d{4}-\d{2}-\d{2}T/)) &&
      (normalizedLatest.match(/^\d{4}-\d{2}-\d{2}/) || normalizedLatest.match(/^\d{4}-\d{2}-\d{2}T/))
    ) {
      return new Date(normalizedCurrent).getTime() !== new Date(normalizedLatest).getTime()
        ? "text-red-500 font-semibold"
        : ""
    }
    if (Array.isArray(normalizedCurrent) && Array.isArray(normalizedLatest)) {
      return JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedLatest) ? "text-red-500 font-semibold" : ""
    }
    return normalizedCurrent !== normalizedLatest ? "text-red-500 font-semibold" : ""
  }

  interface FieldConfig {
    label: string
    path: string[]
    format?: (value: any) => any
  }

  const formatSupplement = (supplement: CHSupplement) => {
    const medDetails = supplement.medrec_details?.minv_details
    if (!medDetails) return "N/A"
    const name = medDetails.med_detail?.med_name || "Unknown Medicine"
    const dosage = medDetails.minv_dsg ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}` : "N/A"
    const form = medDetails.minv_form || "N/A"
    const qty = supplement.medrec_details?.medrec_qty || "N/A"
    return `${name} - Dosage: ${dosage} - Form: ${form} - Qty: ${qty}`
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const swipeThreshold = 50
    if (distance > swipeThreshold) {
      setCurrentScrollIndex((prevIndex) => Math.min(prevIndex + 1, fullHistoryData.length - VISIBLE_COLUMNS))
    } else if (distance < -swipeThreshold) {
      setCurrentScrollIndex((prevIndex) => Math.max(prevIndex - 1, 0))
    }
    setTouchStart(0)
    setTouchEnd(0)
  }

  if (isLoading) {
    return (
      <div className="w-full h-full p-6">
        <Skeleton className="h-10 w-1/6 mb-3" />
        <Skeleton className="h-7 w-1/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4/5 w-full mb-4" />
      </div>
    )
  }

  if (fullHistoryData.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>No record found for this child.</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  // Field configurations
  const recordOverviewFields: FieldConfig[] = [
    { label: "Record ID", path: ["chhist_id"] },
    { label: "Created At", path: ["created_at"], format: (val) => (val ? format(new Date(val), "PPP p") : "N/A") },
    { label: "TT Status", path: ["tt_status"] },
    { label: "Status", path: ["status"] },
  ]

  const childPersonalInfoFields: FieldConfig[] = [
    { label: "Patient ID", path: ["chrec_details", "patrec_details", "pat_details", "pat_id"] },
    { label: "Last Name", path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_lname"] },
    { label: "First Name", path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_fname"] },
    { label: "Middle Name", path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_mname"] },
    { label: "Date of Birth", path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_dob"] },
    { label: "Sex", path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_sex"] },
    { label: "Contact", path: ["chrec_details", "patrec_details", "pat_details", "personal_info", "per_contact"] },
  ]

  const familyHeadInfoFields: FieldConfig[] = [
    {
      label: "Mother's Name",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "mother",
        "personal_info",
      ],
      format: (val) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
    },
    {
      label: "Mother's Contact",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "mother",
        "personal_info",
        "per_contact",
      ],
    },
    {
      label: "Father's Name",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "father",
        "personal_info",
      ],
      format: (val) => (val ? `${val.per_fname} ${val.per_lname}` : "N/A"),
    },
    {
      label: "Father's Contact",
      path: [
        "chrec_details",
        "patrec_details",
        "pat_details",
        "family_head_info",
        "family_heads",
        "father",
        "personal_info",
        "per_contact",
      ],
    },
    { label: "Family No.", path: ["chrec_details", "family_no"] },
    { label: "Mother's Occupation", path: ["chrec_details", "mother_occupation"] },
    { label: "Father's Occupation", path: ["chrec_details", "father_occupation"] },
  ]

  const disabilitiesFields: FieldConfig[] = [
    {
      label: "Disabilities",
      path: ["disabilities"],
      format: (val) =>
        val && val.length > 0
          ? val.map((d: any) => d.disability_details?.disability_name).join(", ")
          : "No disabilities recorded.",
    },
  ]

  const vitalSignsFields: FieldConfig[] = [
    { label: "Age", path: ["child_health_vital_signs", "0", "bm_details", "age"] },
    { label: "Weight (kg)", path: ["child_health_vital_signs", "0", "bm_details", "weight"] },
    { label: "Height (cm)", path: ["child_health_vital_signs", "0", "bm_details", "height"] },
    { label: "Temperature (°C)", path: ["child_health_vital_signs", "0", "temp"] },
  ]

  const nutritionStatusesFields: FieldConfig[] = [
    { label: "Weight-for-Age (WFA)", path: ["nutrition_statuses", "0", "wfa"] },
    { label: "Length/Height-for-Age (LHFA)", path: ["nutrition_statuses", "0", "lhfa"] },
    { label: "Weight-for-Length (WFL)", path: ["nutrition_statuses", "0", "wfl"] },
    { label: "MUAC", path: ["nutrition_statuses", "0", "muac"] },
  ]

  const notesFields: FieldConfig[] = [
    {
      label: "Notes",
      path: ["child_health_notes"],
      format: (val) =>
        val && val.length > 0 ? val.map((note: any) => note.chn_notes).join(" | ") : "No notes recorded.",
    },
  ]

  const supplementsFields: FieldConfig[] = [
    {
      label: "Supplements",
      path: ["child_health_supplements"],
      format: (val) => (val && val.length > 0 ? val.map(formatSupplement).join(" | ") : "No supplements recorded."),
    },
  ]

  const exclusiveBfCheckFields: FieldConfig[] = [
    {
      label: "EBF Check Dates",
      path: ["exclusive_bf_checks"],
      format: (val) => 
        val && val.length > 0
          ? val.map((ebf: any) => ({
              date: format(new Date(ebf.ebf_date), "PPP"),
              id: ebf.ebf_id
            }))
          : []
    }
  ]

  const immunizationTrackingFields: FieldConfig[] = [
    {
      label: "Immunizations",
      path: ["immunization_tracking"],
      format: (val) =>
        val && val.length > 0
          ? val.map((imm: any) => imm.name || JSON.stringify(imm)).join(", ")
          : "No immunization records.",
    },
  ]

  const supplementStatusesFields: FieldConfig[] = [
    {
      label: "Supplement Statuses",
      path: ["supplements_statuses"],
      format: (val) =>
        val && val.length > 0
          ? val
              .map(
                (status: any) =>
                  `${status.status_type} (Birth Weight: ${status.birthwt || "N/A"}, Seen: ${format(new Date(status.date_seen), "PPP")}, Given Iron: ${format(new Date(status.date_given_iron), "PPP")}${status.date_completed ? `, Completed: ${format(new Date(status.date_completed), "PPP")}` : ""})`,
              )
              .join(" | ")
          : "No supplement statuses recorded.",
    },
  ]

  const renderSectionContent = (fields: FieldConfig[]) => (
    <div
      className="grid gap-4 items-start w-full"
      style={{
        gridTemplateColumns: `minmax(150px, 1fr) repeat(${recordsToDisplay.length}, minmax(180px, 1fr))`,
      }}
    >
      <div className="font-bold text-gray-700 sticky left-0 bg-white z-10 py-2 border-gray-100"></div>
      {recordsToDisplay.map((record, idx) => (
        <div key={record.chhist_id} className="font-bold text-center text-gray-700 py-2 border-gray-100">
          {currentScrollIndex + idx === 0 ? "Latest Record" : `Record ${currentScrollIndex + idx + 1}`}
          <br />
          <span className="text-sm font-normal text-gray-500">
            {format(new Date(record.created_at), "MMM dd, yyyy")}
          </span>
        </div>
      ))}
      {fields.map((field, fieldIdx) => (
        <React.Fragment key={fieldIdx}>
          <div className="font-medium text-gray-700 py-2 border-t border-gray-100 sticky left-0 bg-white z-10">
            {field.label}
          </div>
          {recordsToDisplay.map((recordInColumn, recordInColumnIdx) => {
            const valueInCurrentColumn = getValueByPath(recordInColumn, field.path)
            const valueInLatestRecord = getValueByPath(latestOverallRecord, field.path)
            const displayValue = field.format
              ? field.format(valueInCurrentColumn)
              : valueInCurrentColumn !== undefined && valueInCurrentColumn !== null && valueInCurrentColumn !== ""
                ? typeof valueInCurrentColumn === "string" && valueInCurrentColumn.match(/^\d{4}-\d{2}-\d{2}/)
                  ? format(new Date(valueInCurrentColumn), "PPP")
                  : Array.isArray(valueInCurrentColumn)
                    ? valueInCurrentColumn.length > 0
                      ? valueInCurrentColumn
                          .map(
                            (item: any) =>
                              item.name || item.disability_details?.disability_name || JSON.stringify(item),
                          )
                          .join(", ")
                      : "N/A"
                    : valueInCurrentColumn
                : "N/A"
            return (
              <div key={recordInColumnIdx} className="text-center py-2 border-t border-gray-100">
                <span className={getDiffClass(valueInCurrentColumn, valueInLatestRecord)}>
                  {displayValue}
                </span>
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )

  const renderEBFContent = () => (
    <div
      className="grid gap-4 items-start w-full"
      style={{
        gridTemplateColumns: `minmax(150px, 1fr) repeat(${recordsToDisplay.length}, minmax(180px, 1fr))`,
      }}
    >
      <div className="font-bold text-gray-700 sticky left-0 bg-white z-10 py-2 border-gray-100"></div>
      {recordsToDisplay.map((record, idx) => (
        <div key={record.chhist_id} className="font-bold text-center text-gray-700 py-2 border-gray-100">
          {currentScrollIndex + idx === 0 ? "Latest Record" : `Record ${currentScrollIndex + idx + 1}`}
          <br />
          <span className="text-sm font-normal text-gray-500">
            {format(new Date(record.created_at), "MMM dd, yyyy")}
          </span>
        </div>
      ))}
      {exclusiveBfCheckFields.map((field, fieldIdx) => (
        <React.Fragment key={fieldIdx}>
          <div className="font-medium text-gray-700 py-2 border-t border-gray-100 sticky left-0 bg-white z-10">
            {field.label}
          </div>
          {recordsToDisplay.map((recordInColumn, recordInColumnIdx) => {
            const valueInCurrentColumn = getValueByPath(recordInColumn, field.path)
            const valueInLatestRecord = getValueByPath(latestOverallRecord, field.path)
            const displayValue = field.format ? field.format(valueInCurrentColumn) : valueInCurrentColumn
            
            return (
              <div key={recordInColumnIdx} className="text-center py-2 border-t border-gray-100">
                {displayValue.length > 0 ? (
                  <div className="space-y-1">
                    {displayValue.map((ebf: any) => (
                      <div key={ebf.id} className={getDiffClass(ebf.date, valueInLatestRecord)}>
                        {ebf.date}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400">No EBF checks recorded</span>
                )}
              </div>
            )
          })}
        </React.Fragment>
      ))}
    </div>
  )

  return (

    <>

<div className="flex flex-col sm:flex-row gap-4 ">
        <Button
          className="text-black p-2 mb-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <ChevronLeft />
        </Button>
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Child Health Hisotry Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
        View and compare child's health history
          </p>
        </div>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

    <div className="p-6 bg-white">
      <div className="container mx-auto max-w-6xl">
        
        
        <div className="flex justify-end gap-3 mb-6">
          <Button
            onClick={() => setCurrentScrollIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentScrollIndex === 0}
            variant="outline"
            className="px-4 py-2"
          >
            Newer
          </Button>
          <Button
            onClick={() =>
              setCurrentScrollIndex((prev) => Math.min(prev + 1, fullHistoryData.length - VISIBLE_COLUMNS))
            }
            disabled={currentScrollIndex >= fullHistoryData.length - VISIBLE_COLUMNS}
            variant="outline"
            className="px-4 py-2"
          >
            Older
          </Button>
        </div>

        <Accordion 
          type="multiple" 
          className="w-full space-y-4"
          defaultValue={["record-overview", "child-details"]}
        >
          <AccordionItem value="record-overview" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <ClipboardList className="h-5 w-5 mr-3 text-gray-600" />
                  Record Overview
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent(recordOverviewFields)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="child-details" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-3 text-gray-600" />
                  Child Details
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent(childPersonalInfoFields)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="parent-newborn" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-3 text-gray-600" />
                  Parent & Newborn Screening
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent(familyHeadInfoFields)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="exclusive-bf-checks" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <HeartPulse className="h-5 w-5 mr-3 text-gray-600" />
                  Exclusive Breastfeeding Checks
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderEBFContent()}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="disabilities" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-3 text-gray-600" />
                  Disabilities
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent(disabilitiesFields)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="vital-signs-notes" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <HeartPulse className="h-5 w-5 mr-3 text-gray-600" />
                  Vital Signs & Notes
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent([...vitalSignsFields, ...notesFields])}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="nutritional-status" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Soup className="h-5 w-5 mr-3 text-gray-600" />
                  Nutritional Status
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent(nutritionStatusesFields)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="immunization" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Syringe className="h-5 w-5 mr-3 text-gray-600" />
                  Immunization
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent(immunizationTrackingFields)}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="supplements-status" className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="text-xl font-semibold px-6 py-4 [&[data-state=open]>div>svg]:rotate-180">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center">
                  <Pill className="h-5 w-5 mr-3 text-gray-600" />
                  Supplements & Supplement Status
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <Card className="mb-0 border-t rounded-t-none shadow-none">
                <CardContent
                  className="overflow-x-auto p-6"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {renderSectionContent([...supplementsFields, ...supplementStatusesFields])}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
    </>
  )


}