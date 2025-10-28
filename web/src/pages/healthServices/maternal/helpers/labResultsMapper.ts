import type { LabResults, LabResultData, LabImage } from "@/pages/healthServices/maternal/maternal-components/lab-result"

/**
 * Map API lab result response to the frontend LabResults format
 * This handles converting the fetched lab data into the shape expected by the LaboratoryResults component
 */
export interface ApiLabResult {
  lab_id: string
  pf_id: string
  lab_type: string
  result_date: string | null
  is_completed: boolean
  to_be_followed: boolean
  document_path: string
  remarks: string
  images: ApiLabImage[]
  created_at: string
  updated_at: string
}

export interface ApiLabImage {
  lab_img_id: string
  image_url: string
  image_name: string
  image_type: string
  image_size: number
  created_at: string
}

/**
 * Convert lab_type from API format (snake_case) to component format (camelCase)
 * Example: "sgot_sgpt" → "sgotSgpt"
 */
const normalizeLabType = (labType: string): string => {
  const labTypeMapping: Record<string, string> = {
    "urinalysis": "urinalysis",
    "cbc": "cbc",
    "sgot_sgpt": "sgotSgpt",
    "creatinine_serum": "creatinineSerum",
    "bua_bun": "buaBun",
    "syphilis": "syphilis",
    "hiv_test": "hivTest",
    "hepa_b": "hepaB",
    "blood_typing": "bloodTyping",
    "ogct_50gms": "ogct50",
    "ogct_100gms": "ogct100",
  }

  return labTypeMapping[labType] || labType
}

/**
 * Convert API lab images to component format
 * Creates preview URLs from the image_url
 */
const convertApiImagesToLabImages = (apiImages: ApiLabImage[]): LabImage[] => {
  return apiImages.map((img) => ({
    file: new File([], img.image_name, { type: img.image_type }), // Placeholder file object
    preview: img.image_url, // Use the actual image URL from API
    name: img.image_name,
    type: img.image_type,
    size: img.image_size,
    url: img.image_url, // Store original URL for reference
  }))
}

/**
 * Convert a single API lab result to component format
 */
const convertApiLabResultToLabResultData = (apiResult: ApiLabResult): LabResultData => {
  return {
    checked: true, // Mark as checked since it exists in the API
    date: apiResult.result_date || "", // Empty string if null
    toBeFollowed: apiResult.to_be_followed,
    remarks: apiResult.remarks || "",
    images: convertApiImagesToLabImages(apiResult.images),
    // Keep first image for backward compatibility
    imageFile: apiResult.images.length > 0 ? new File([], apiResult.images[0].image_name) : null,
    imagePreview: apiResult.images.length > 0 ? apiResult.images[0].image_url : undefined,
  }
}

/**
 * Main function to convert API lab results response to LabResults format
 * Returns complete LabResults object with all lab types (checked/unchecked as needed)
 */
export const mapApiLabResultsToFormData = (apiResponse: {
  lab_results: ApiLabResult[]
}): LabResults => {
  // Start with all lab types unchecked
  const initialLabResults: LabResults = {
    urinalysis: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    cbc: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    sgotSgpt: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    creatinineSerum: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    buaBun: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    syphilis: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    hivTest: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    hepaB: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    bloodTyping: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    ogct50: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
    ogct100: {
      checked: false,
      date: "",
      toBeFollowed: false,
      remarks: "",
      images: [],
      imageFile: null,
      imagePreview: undefined,
    },
  }

  // Now populate with API data
  apiResponse.lab_results.forEach((apiResult) => {
    const normalizedLabType = normalizeLabType(apiResult.lab_type)
    
    if (normalizedLabType in initialLabResults) {
      initialLabResults[normalizedLabType as keyof LabResults] = 
        convertApiLabResultToLabResultData(apiResult)
    }
  })

  return initialLabResults
}

/**
 * Example usage in your component:
 * 
 * const { data: prenatalLabResults } = usePrenatalLabResult(pregnancyId)
 * 
 * useEffect(() => {
 *   if (prenatalLabResults?.lab_results) {
 *     const mappedResults = mapApiLabResultsToFormData(prenatalLabResults)
 *     setLabResults(mappedResults)
 *   }
 * }, [prenatalLabResults])
 */
