"use client"
import type React from "react"
import { useMemo, useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { api2 } from "@/api/api"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocation } from "react-router"
import { Button } from "@/components/ui/button/button"
import { useNavigate } from "react-router"

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

// Update the StaffDetails interface
interface StaffDetails {
  staff_id: string
  staff_assign_date: string
  staff_type: string
  rp: {
    // Changed from 'string' to an object matching the API response
    rp_id: string
    per: PersonalInfo // PersonalInfo already contains per_fname, per_lname
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
  // Remove fname, lname, mname from here as they are nested under rp.per
  // lname: string // Removed
  // fname: string // Removed
  // mname: string | null // Removed
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
  followv_details: FollowVDetails | null // Can be null if no follow-up
  staff_details: StaffDetails // Now directly includes staff details
  chn_notes: string
  created_at: string
  updated_at: string
  chhist: number
  followv: number | null // Can be null
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
  // chnotes: number // Removed as per new structure
  // chnotes_details: CHNotes // Removed as per new structure
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
  child_health_notes: CHNotes[] // This array now holds the notes directly
  child_health_vital_signs: CHVitalSigns[]
  child_health_supplements: CHSupplement[]
  exclusive_bf_checks: EBFCheck[]
  immunization_tracking: any[]
  supplements_statuses: CHSSupplementStat[]
  nutrition_statuses: NutritionStatus[]
}

export default function ChildHealthHistoryDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { chhistId, patId, chrecId } = location.state?.params || {}
  const [fullHistoryData, setFullHistoryData] = useState<ChildHealthHistoryRecord[]>([])
  const [selectedRecordIndex, setSelectedRecordIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      try {
        // Fetch full history data for the patient
        const historyResponse = await api2.get(`/child-health/history/${chrecId}/`)
        setFullHistoryData(historyResponse.data[0]?.child_health_histories || [])

        // Find the index of the initially selected record if chhistId is provided
        if (chhistId) {
          const initialIndex = historyResponse.data.findIndex(
            (record: ChildHealthHistoryRecord) => record.chhist_id === Number(chhistId),
          )
          if (initialIndex !== -1) {
            setSelectedRecordIndex(initialIndex)
          }
        }
      } catch (error) {
        console.error("Error fetching child health history:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (patId) {
      fetchAllData()
    }
  }, [patId, chhistId, chrecId]) // Added chrecId to dependencies

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && selectedRecordIndex < fullHistoryData.length - 1) {
      setSelectedRecordIndex(selectedRecordIndex + 1)
    }
    if (isRightSwipe && selectedRecordIndex > 0) {
      setSelectedRecordIndex(selectedRecordIndex - 1)
    }
  }

  // Handle navigation buttons
  const goToPrevious = () => {
    if (selectedRecordIndex > 0) {
      setSelectedRecordIndex(selectedRecordIndex - 1)
    }
  }

  const goToNext = () => {
    if (selectedRecordIndex < fullHistoryData.length - 1) {
      setSelectedRecordIndex(selectedRecordIndex + 1)
    }
  }

  const currentRecord = useMemo(() => {
    return fullHistoryData[selectedRecordIndex]
  }, [fullHistoryData, selectedRecordIndex])

  const previousRecords = useMemo(() => {
    return fullHistoryData.slice(selectedRecordIndex + 1)
  }, [fullHistoryData, selectedRecordIndex])

  const getDiffClass = (currentValue: any, path: string[]) => {
    if (previousRecords.length === 0) return ""

    const getValueByPath = (obj: any, path: string[]) => {
      return path.reduce((acc, part) => {
        if (acc === undefined || acc === null) return undefined
        if (Array.isArray(acc) && !isNaN(Number(part))) {
          return acc[Number(part)]
        }
        return acc[part]
      }, obj)
    }

    const current = currentValue !== undefined ? currentValue : getValueByPath(currentRecord, path)

    const hasChange = previousRecords.some((record) => {
      const previousValue = getValueByPath(record, path)

      if (current === undefined || previousValue === undefined) return false

      if (
        typeof current === "string" &&
        typeof previousValue === "string" &&
        (current.match(/^\d{4}-\d{2}-\d{2}/) || current.match(/^\d{4}-\d{2}-\d{2}T/))
      ) {
        return new Date(current).getTime() !== new Date(previousValue).getTime()
      }

      if (Array.isArray(current) && Array.isArray(previousValue)) {
        return JSON.stringify(current) !== JSON.stringify(previousValue)
      }

      return current !== previousValue
    })

    return hasChange ? "text-red-500 font-semibold" : ""
  }

  const renderDetailRow = (label: string, currentValue: any, path: string[]) => (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="font-medium text-gray-700">{label}:</span>
      <span className={getDiffClass(currentValue, path)}>
        {currentValue !== undefined
          ? typeof currentValue === "string" && currentValue.match(/^\d{4}-\d{2}-\d{2}/)
            ? format(new Date(currentValue), "PPP")
            : currentValue || "N/A"
          : "N/A"}
      </span>
    </div>
  )

  const renderSection = (title: string, content: React.ReactNode) => (
    <Card className="mb-6 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">{content}</CardContent>
    </Card>
  )

  const formatSupplement = (supplement: CHSupplement) => {
    const medDetails = supplement.medrec_details?.minv_details
    if (!medDetails) return "N/A"
    const name = medDetails.med_detail?.med_name || "Unknown Medicine"
    const dosage = medDetails.minv_dsg ? `${medDetails.minv_dsg}${medDetails.minv_dsg_unit || ""}` : "N/A"
    const form = medDetails.minv_form || "N/A"
    const qty = supplement.medrec_details?.medrec_qty || "N/A"
    return `${name} - Dosage: ${dosage} - Form: ${form} - Qty: ${qty}`
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

  if (!currentRecord) {
    return (
      <div className="p-6 text-center text-gray-600">
        <p>No record found.</p>
        <Button onClick={() => navigate(-1)}>Go back</Button>
      </div>
    )
  }

  const currentPatDetails = currentRecord.chrec_details.patrec_details.pat_details
  const currentChrecDetails = currentRecord.chrec_details
  const currentVitalSigns = currentRecord.child_health_vital_signs?.[0]
  const currentNutritionStatus = currentRecord.nutrition_statuses?.[0]

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Button onClick={() => navigate(-1)} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Child Health History Details</h1>

      {/* Swipeable Carousel Navigation */}
      <Card className="mb-6 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Record History ({selectedRecordIndex + 1} of {fullHistoryData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Navigation Arrows */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                onClick={goToPrevious}
                disabled={selectedRecordIndex === 0}
                className="flex items-center gap-2 bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-600">Swipe left/right to navigate</p>
                <p className="font-semibold">{format(new Date(currentRecord.created_at), "PPP")}</p>
              </div>

              <Button
                variant="outline"
                onClick={goToNext}
                disabled={selectedRecordIndex === fullHistoryData.length - 1}
                className="flex items-center gap-2 bg-transparent"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Swipeable Content Area */}
            <div
              ref={carouselRef}
              className="overflow-hidden rounded-lg bg-white border p-4 cursor-grab active:cursor-grabbing"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="flex items-center justify-center space-x-4">
                {/* Record Indicators */}
                <div className="flex space-x-2">
                  {fullHistoryData.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedRecordIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === selectedRecordIndex ? "bg-blue-500" : "bg-gray-300 hover:bg-gray-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Current Record Summary */}
              <div className="mt-4 text-center">
                <h3 className="font-semibold text-lg">Record #{currentRecord.chhist_id}</h3>
                <p className="text-gray-600">{format(new Date(currentRecord.created_at), "PPPp")}</p>
                <div className="flex justify-center space-x-4 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      currentRecord.tt_status === "Complete"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    TT: {currentRecord.tt_status}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      currentRecord.status === "Active" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    Status: {currentRecord.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Record Details */}
      {renderSection(
        "Record Overview",
        <>
          {renderDetailRow("Record ID", currentRecord.chhist_id, ["chhist_id"])}
          {renderDetailRow("Created At", format(new Date(currentRecord.created_at), "PPP p"), ["created_at"])}
          {renderDetailRow("TT Status", currentRecord.tt_status, ["tt_status"])}
          {renderDetailRow("Status", currentRecord.status, ["status"])}
        </>,
      )}

      {renderSection(
        "Child Personal Information",
        <>
          {renderDetailRow("Patient ID", currentPatDetails.pat_id, [
            "chrec_details",
            "patrec_details",
            "pat_details",
            "pat_id",
          ])}
          {renderDetailRow("Last Name", currentPatDetails.personal_info.per_lname, [
            "chrec_details",
            "patrec_details",
            "pat_details",
            "personal_info",
            "per_lname",
          ])}
          {renderDetailRow("First Name", currentPatDetails.personal_info.per_fname, [
            "chrec_details",
            "patrec_details",
            "pat_details",
            "personal_info",
            "per_fname",
          ])}
          {renderDetailRow("Middle Name", currentPatDetails.personal_info.per_mname, [
            "chrec_details",
            "patrec_details",
            "pat_details",
            "personal_info",
            "per_mname",
          ])}
          {renderDetailRow("Date of Birth", currentPatDetails.personal_info.per_dob, [
            "chrec_details",
            "patrec_details",
            "pat_details",
            "personal_info",
            "per_dob",
          ])}
          {renderDetailRow("Sex", currentPatDetails.personal_info.per_sex, [
            "chrec_details",
            "patrec_details",
            "pat_details",
            "personal_info",
            "per_sex",
          ])}
          {renderDetailRow("Contact", currentPatDetails.personal_info.per_contact, [
            "chrec_details",
            "patrec_details",
            "pat_details",
            "personal_info",
            "per_contact",
          ])}
        </>,
      )}

      {renderSection(
        "Family Head Information",
        <>
          {currentPatDetails.family_head_info.has_mother && (
            <>
              <h3 className="text-md font-semibold mt-2">Mother:</h3>
              {renderDetailRow(
                "Mother's Name",
                `${currentPatDetails.family_head_info.family_heads.mother?.personal_info.per_fname} ${currentPatDetails.family_head_info.family_heads.mother?.personal_info.per_lname}`,
                [
                  "chrec_details",
                  "patrec_details",
                  "pat_details",
                  "family_head_info",
                  "family_heads",
                  "mother",
                  "personal_info",
                ],
              )}
              {renderDetailRow(
                "Mother's Contact",
                currentPatDetails.family_head_info.family_heads.mother?.personal_info.per_contact,
                [
                  "chrec_details",
                  "patrec_details",
                  "pat_details",
                  "family_head_info",
                  "family_heads",
                  "mother",
                  "personal_info",
                  "per_contact",
                ],
              )}
            </>
          )}
          {currentPatDetails.family_head_info.has_father && (
            <>
              <h3 className="text-md font-semibold mt-2">Father:</h3>
              {renderDetailRow(
                "Father's Name",
                `${currentPatDetails.family_head_info.family_heads.father?.personal_info.per_fname} ${currentPatDetails.family_head_info.family_heads.father?.personal_info.per_lname}`,
                [
                  "chrec_details",
                  "patrec_details",
                  "pat_details",
                  "family_head_info",
                  "family_heads",
                  "father",
                  "personal_info",
                ],
              )}
              {renderDetailRow(
                "Father's Contact",
                currentPatDetails.family_head_info.family_heads.father?.personal_info.per_contact,
                [
                  "chrec_details",
                  "patrec_details",
                  "pat_details",
                  "family_head_info",
                  "family_heads",
                  "father",
                  "personal_info",
                  "per_contact",
                ],
              )}
            </>
          )}
          {renderDetailRow("Family No.", currentChrecDetails.family_no, ["chrec_details", "family_no"])}
          {renderDetailRow("Mother's Occupation", currentChrecDetails.mother_occupation, [
            "chrec_details",
            "mother_occupation",
          ])}
          {renderDetailRow("Father's Occupation", currentChrecDetails.father_occupation, [
            "chrec_details",
            "father_occupation",
          ])}
        </>,
      )}

      {renderSection(
        "Disabilities",
        currentRecord.disabilities?.length > 0 ? (
          <ul className="list-disc pl-5">
            {currentRecord.disabilities.map((disability, i) => (
              <li key={i} className="py-1">
                <span
                  className={getDiffClass(disability.disability_details.disability_name, [
                    "disabilities",
                    i.toString(),
                    "disability_details",
                    "disability_name",
                  ])}
                >
                  {disability.disability_details.disability_name}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No disabilities recorded.</p>
        ),
      )}

      {renderSection(
        "Vital Signs",
        currentVitalSigns ? (
          <>
            {renderDetailRow("Age", currentVitalSigns.bm_details?.age, [
              "child_health_vital_signs",
              "0",
              "bm_details",
              "age",
            ])}
            {renderDetailRow("Weight (kg)", currentVitalSigns.bm_details?.weight, [
              "child_health_vital_signs",
              "0",
              "bm_details",
              "weight",
            ])}
            {renderDetailRow("Height (cm)", currentVitalSigns.bm_details?.height, [
              "child_health_vital_signs",
              "0",
              "bm_details",
              "height",
            ])}
            {renderDetailRow("Temperature (°C)", currentVitalSigns.temp, ["child_health_vital_signs", "0", "temp"])}
          </>
        ) : (
          <p className="text-gray-500">No vital signs recorded.</p>
        ),
      )}

      {renderSection(
        "Nutrition Statuses",
        currentNutritionStatus ? (
          <>
            {renderDetailRow("Weight-for-Age (WFA)", currentNutritionStatus.wfa, ["nutrition_statuses", "0", "wfa"])}
            {renderDetailRow("Length/Height-for-Age (LHFA)", currentNutritionStatus.lhfa, [
              "nutrition_statuses",
              "0",
              "lhfa",
            ])}
            {renderDetailRow("Weight-for-Length (WFL)", currentNutritionStatus.wfl, ["nutrition_statuses", "0", "wfl"])}
            {renderDetailRow("MUAC", currentNutritionStatus.muac, ["nutrition_statuses", "0", "muac"])}
          </>
        ) : (
          <p className="text-gray-500">No nutrition statuses recorded.</p>
        ),
      )}

      {renderSection(
        "Notes",
        currentRecord.child_health_notes?.length > 0 ? (
          <ul className="list-disc pl-5">
            {currentRecord.child_health_notes
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) // Sort by date, latest first
              .map((note, i) => (
                <li key={i} className="py-1">
                  <span className={getDiffClass(note.chn_notes, ["child_health_notes", i.toString(), "chn_notes"])}>
                    {note.chn_notes}
                  </span>
                  {note.followv_details && (
                    <p className="text-gray-500 text-sm mt-1">
                      Follow Up: {format(new Date(note.followv_details.followv_date), "PPP")} (
                      {note.followv_details.followv_description || "N/A"})
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    By: {note.staff_details?.rp?.per?.per_fname} {note.staff_details?.rp?.per?.per_lname} on{" "}
                    {format(new Date(note.created_at), "PPP p")}
                  </p>
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-gray-500">No notes recorded.</p>
        ),
      )}

      {renderSection(
        "Supplements",
        currentRecord.child_health_supplements?.length > 0 ? (
          <ul className="list-disc pl-5">
            {currentRecord.child_health_supplements.map((supplement, i) => {
              const currentSupplementString = formatSupplement(supplement)
              return (
                <li key={i} className="py-1">
                  <span className={getDiffClass(currentSupplementString, ["child_health_supplements", i.toString()])}>
                    {currentSupplementString}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-gray-500">No supplements recorded.</p>
        ),
      )}

      {renderSection(
        "Exclusive Breastfeeding Checks",
        currentRecord.exclusive_bf_checks?.length > 0 ? (
          <ul className="list-disc pl-5">
            {currentRecord.exclusive_bf_checks.map((ebf, i) => (
              <li key={i} className="py-1">
                <span className={getDiffClass(ebf.ebf_date, ["exclusive_bf_checks", i.toString(), "ebf_date"])}>
                  {format(new Date(ebf.ebf_date), "PPP")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No exclusive breastfeeding checks recorded.</p>
        ),
      )}

      {renderSection(
        "Immunization Tracking",
        currentRecord.immunization_tracking?.length > 0 ? (
          <ul className="list-disc pl-5">
            {currentRecord.immunization_tracking.map((immunization, i) => (
              <li key={i} className="py-1">
                {immunization.name || JSON.stringify(immunization)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No immunization records.</p>
        ),
      )}

      {renderSection(
        "Supplement Statuses",
        currentRecord.supplements_statuses?.length > 0 ? (
          <ul className="list-disc pl-5">
            {currentRecord.supplements_statuses.map((status, i) => (
              <li key={i} className="py-1">
                <span
                  className={getDiffClass(status.status_type, ["supplements_statuses", i.toString(), "status_type"])}
                >
                  {status.status_type}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  (Seen: {format(new Date(status.date_seen), "PPP")}, Given Iron:{" "}
                  {format(new Date(status.date_given_iron), "PPP")})
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No supplement statuses recorded.</p>
        ),
      )}
    </div>
  )
}
