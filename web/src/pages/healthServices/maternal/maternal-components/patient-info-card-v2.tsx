import { format } from "date-fns"
import { Calendar, MapPin, User, Heart, Shield } from "lucide-react"

// Updated interface to match Patient
interface Patient {
  pat_id: string;
  age: number;
  personal_info: {
    per_fname: string;
    per_lname: string;
    per_mname: string;
    per_sex: string;
    per_dob?: string
    ageTime?: "yrs";
  };
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_external_sitio?: string;
  }
  sitio?: string;
  pat_type: string;
  patrec_type?: string;
}

interface PatientInfoCardv2Props {
  patient: Patient | null
}

// Helper functions
const formatFullName = (patients?: Patient["personal_info"]) => {
  if (!patients) return "Not provided"
  const { per_fname = "", per_mname = "", per_lname = "" } = patients
  const fullName = `${per_fname} ${per_mname} ${per_lname}`.trim()
  return fullName || "Not provided"
}

const formatAddress = (patient: Patient) => {
  const addressParts = [
	patient.address?.add_street,
	patient.sitio,
	patient.address?.add_barangay,
	patient.address?.add_city,
	patient.address?.add_province,
	patient.address?.add_external_sitio,
  ].filter(Boolean)
  return addressParts.length > 0 ? addressParts.join(", ") : "Not provided"
}

const formatDateOfBirth = (dob?: string) => {
  if (!dob) return "Not provided"
  try {
    return format(new Date(dob), "MMM dd, yyyy")
  } catch {
    return "Invalid date"
  }
}

const formatAge = (ageData?: { age: number; ageTime: string }) => {
  if (!ageData) return "N/A"
  return `${ageData.age} ${ageData.ageTime}`
}

const getGenderIcon = (gender?: string) => {
  if (!gender) return User
  return gender.toLowerCase() === 'female' ? Heart : Shield
}

// Empty state
const EmptyPatientState = () => (
  <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patient Selected</h3>
    <p className="text-gray-600">Select a patient to view their information</p>
  </div>
)

export const PatientInfoCardv2 = ({ patient }: PatientInfoCardv2Props) => {
  if (!patient) {
    return <EmptyPatientState />
  }

  const fullName = formatFullName(patient.personal_info)
  const age = patient.personal_info ? formatAge({ age: patient.age, ageTime: patient.personal_info.ageTime ?? "yrs" }) : ""
  const dob = patient.personal_info ? formatDateOfBirth(patient.personal_info.per_dob) : ""
  const sex = patient.personal_info ? patient.personal_info.per_sex : "Not specified"
  const address = formatAddress(patient)
  const GenderIcon = getGenderIcon(patient.personal_info?.per_sex)

  return (
    <div className="p-6 bg-white rounded-sm shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 bg-slate-400 rounded-xl flex items-center justify-center text-white text-lg font-bold">
          {fullName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{fullName}</h2>
          <p className="text-sm text-gray-600">
            ID: {patient.pat_id} • {patient.pat_type}
          </p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{dob}</p>
              <p className="text-xs text-gray-500">{age}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <GenderIcon className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{sex}</p>
              <p className="text-xs text-gray-500">Sex</p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">{address}</p>
              <p className="text-xs text-gray-500">Address</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}