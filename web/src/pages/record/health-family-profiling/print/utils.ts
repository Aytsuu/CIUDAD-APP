// Utility functions for Family Profile Print Preview
export interface FamilyProfilePrintPreviewProps {
  data: any
}

export interface FamilyProfilePrintPreviewHandle {
  PrintForm: () => void
}

// Helpers to normalize backend values for status fields
export const isTruthyLike = (val: unknown): boolean => {
  if (val == null) return false
  const s = String(val).trim().toLowerCase()
  return ["yes", "true", "y", "1"].includes(s)
}

export const isFalsyLike = (val: unknown): boolean => {
  if (val == null) return false
  const s = String(val).trim().toLowerCase()
  return ["no", "false", "n", "0"].includes(s)
}

export const isNhts = (val: unknown): boolean => {
  if (val == null) return false
  const s = String(val).trim().toLowerCase()
  // Handle common variants
  if (isTruthyLike(s)) return true
  return (
    s === "nhts" ||
    s === "4ps" ||
    s === "nhts (4ps)" ||
    s === "nhts household" ||
    s === "nhts4ps" ||
    s === "yes (4ps)"
  )
}

export const isIndigenous = (val: unknown): boolean => {
  if (val == null) return false
  const s = String(val).trim().toLowerCase()
  if (isTruthyLike(s)) return true
  return s === "ip" || s === "indigenous" || s === "indigenous people" || s === "indigenouspeoples"
}

// Normalize toilet facility shared/not-shared values from backend (sf_toilet_type)
export const isSharedToilet = (val: unknown): boolean => {
  if (val == null) return false
  const s = String(val).trim().toLowerCase()
  // Consider variants like "shared", "shared with other household", and truthy-like yes
  // Guard against "not shared" containing the word "shared"
  if (s.includes("not shared") || s.includes("not-shared") || s.includes("exclusive")) return false
  return s === "shared" || s.includes("shared with") || s.includes("shared") || isTruthyLike(s)
}

export const isNotSharedToilet = (val: unknown): boolean => {
  if (val == null) return false
  const s = String(val).trim().toLowerCase()
  // Consider variants like "not shared", "exclusive use", and falsy-like no
  return s === "not shared" || s.includes("not shared") || s.includes("exclusive") || isFalsyLike(s)
}

// Generic normalization utilities for robust, case-insensitive comparisons
export const norm = (val: unknown): string => (val == null ? "" : String(val).trim())
export const lower = (val: unknown): string => norm(val).toLowerCase()
export const token = (val: unknown): string => lower(val).replace(/[^a-z0-9]/g, "") // remove spaces, slashes, punctuation
export const equalsCI = (a: unknown, b: unknown): boolean => lower(a) === lower(b)
export const equalsToken = (a: unknown, b: unknown): boolean => token(a) === token(b)
export const inSetCI = (val: unknown, set: string[]): boolean => set.some((s) => equalsCI(val, s))
export const inSetToken = (val: unknown, set: string[]): boolean => set.some((s) => equalsToken(val, s))
export const tokenIncludes = (val: unknown, sub: string): boolean => token(val).includes(token(sub))

// Explicit negative classifiers
export const isNonNhts = (val: unknown): boolean => {
  if (val == null) return false
  const t = token(val)
  return t === "nonnhts" || isFalsyLike(val)
}

export const isNonIp = (val: unknown): boolean => {
  if (val == null) return false
  const t = token(val)
  return t === "nonip" || isFalsyLike(val)
}

// Sanitary facility classifier (sanitary vs unsanitary) based on facility_type
export const SANITARY_TYPES = [
  "sanitary",
  "POUR/FLUSH WITH SEPTIC TANK",
  "POUR/FLUSH CONNECTED TO SEPTIC TANK AND SEWERAGE SYSTEM",
  "VENTILATED PIT (VIP) LATRINE",
]

export const UNSANITARY_TYPES = [
  "unsanitary",
  "WATER-SEALED TOILET WITHOUT SEPTIC TANK",
  "OVERHUNG LATRINE",
  "OPEN PIT LATRINE",
  "WITHOUT TOILET",
]

export const classifySanitaryFacilityType = (val: unknown): "sanitary" | "unsanitary" | null => {
  if (!val) return null
  if (inSetToken(val, SANITARY_TYPES)) return "sanitary"
  if (inSetToken(val, UNSANITARY_TYPES)) return "unsanitary"
  return null
}

// Helper to get derived data from the main data object
export const getDerivedData = (data: any) => {
  const householdData = data.family_info.household
  const familyMembers = data.family_members
  const environmentalData = data.environmental_health
  const ncdRecords = data.ncd_records || []
  const tbRecords = data.tb_surveillance_records || []
  const surveyData = data.survey_identification

  // Derive once for reuse
  const sanitaryFacilityType = environmentalData?.sanitary_facility?.facility_type
  const sanitaryFacilityDesc = environmentalData?.sanitary_facility?.description
  const sanitaryClass = classifySanitaryFacilityType(sanitaryFacilityType)
  const waterSupplyType = environmentalData?.water_supply?.type
  
  // Be robust to different backend field names for solid waste
  const wasteType = (
    environmentalData?.waste_management?.type ??
    environmentalData?.waste_management?.disposal_type ??
    environmentalData?.waste_management?.waste_management_type ??
    ""
  )
  
  const buildingType = data.family_info?.family_building
  const toiletFacilityRaw = environmentalData?.sanitary_facility?.toilet_facility_type
  const toiletShareStatus: "shared" | "not-shared" | null = (() => {
    const s = lower(toiletFacilityRaw)
    if (!s) return null
    if (isNotSharedToilet(s)) return "not-shared"
    if (isSharedToilet(s)) return "shared"
    return null
  })()

  // Get household head (the resident that the household is registered to)
  const householdHead =
    data.family_info?.household?.head_resident ||
    familyMembers.find((m: any) => m.is_household_head === true) ||
    familyMembers.find((m: any) => m.role === "FATHER") ||
    familyMembers.find((m: any) => m.role === "MOTHER") ||
    familyMembers[0]

  // Get father and mother data
  const fatherData = familyMembers.find((m: any) => m.role === "FATHER")
  const motherData = familyMembers.find((m: any) => m.role === "MOTHER")

  // Children (members who are not FATHER or MOTHER)
  const allChildren = familyMembers.filter((m: any) => !["FATHER", "MOTHER"].includes(m.role))

  // Separate children by age groups
  const childrenUnder5 = allChildren.filter((child: any) => {
    if (!child.personal_info.date_of_birth) return false
    const age = new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
    return age < 5
  })

  const childrenOver5 = allChildren.filter((child: any) => {
    if (!child.personal_info.date_of_birth) return true // Include children without birth date in over 5
    const age = new Date().getFullYear() - new Date(child.personal_info.date_of_birth).getFullYear()
    return age >= 5
  })

  return {
    householdData,
    familyMembers,
    environmentalData,
    ncdRecords,
    tbRecords,
    surveyData,
    sanitaryFacilityType,
    sanitaryFacilityDesc,
    sanitaryClass,
    waterSupplyType,
    wasteType,
    buildingType,
    toiletFacilityRaw,
    toiletShareStatus,
    householdHead,
    fatherData,
    motherData,
    allChildren,
    childrenUnder5,
    childrenOver5,
  }
}

// Print styles constant for reuse across components
export const PRINT_STYLES = `
  @media print {
    /* Print only the preview area */
    body * { visibility: hidden; }
    .print-preview, .print-preview * { visibility: visible; }
    .print-preview { position: absolute; left: 0; top: 0; }
    .no-print { display: none !important; }

    @page {
      size: 8.5in 13in;
      margin: 0.5in;
    }
    .print-preview {
      margin: 0;
      padding: 0;
      font-size: 10px;
      width: 100%;
      max-width: none;
    }
    .print-field {
      break-inside: avoid;
    }
    table {
      break-inside: auto;
    }
    tr {
      break-inside: avoid;
      break-after: auto;
    }
    .page-break {
      page-break-before: always;
    }
    .page-1 {
      page-break-after: always;
    }
  }
  
  /* Screen view styling for long bond paper */
  .print-preview {
    width: 8.5in;
    min-height: 13in;
    margin: 0 auto;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
  }
  
  .page-break {
    border-top: 2px dashed #ccc;
    margin: 20px 0;
    padding-top: 20px;
  }
`
 