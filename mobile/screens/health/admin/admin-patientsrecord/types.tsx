
export interface ChildHealthRecord {
    chrec_id: number
    pat_id: string
    fname: string
    lname: string
    mname: string
    sex: string
    age: string
    dob: string
    householdno: string
    street: string
    sitio: string
    barangay: string
    city: string
    province: string
    landmarks: string
    pat_type: string
    address: string 
    mother_fname: string
    mother_lname: string
    mother_mname: string
    mother_contact: string
    mother_occupation: string
    father_fname: string
    father_lname: string
    father_mname: string
    father_contact: string
    father_occupation: string
    family_no: string
    birth_weight: number
    birth_height: number
    type_of_feeding: string
    delivery_type: string
    place_of_delivery_type: string
    pod_location: string
    pod_location_details: string
    health_checkup_count: number
    birth_order: number
    tt_status: string
  }
  
  export interface PatientData {
    pat_id: string
    pat_type: string
    trans_id?: string
    households: { hh_id: string }[]
    personal_info: {
      per_fname: string
      per_mname: string
      per_lname: string
      per_sex: string
      per_contact: string
      per_dob: string
      ageTime?: "yrs"
    }
    address: {
      full_address?: string
      add_street?: string
      add_barangay?: string
      add_city?: string
      add_province?: string
      sitio: string
    } | null
    bloodType?: string
    allergies?: string
    chronicConditions?: string
    lastVisit?: string
    visits?: Array<{ date: string; reason: string; doctor: string }>
  }