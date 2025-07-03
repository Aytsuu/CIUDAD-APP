import { format } from "date-fns";
import { Calendar, MapPin, User, Heart, Shield } from "lucide-react";
import { calculateAge } from "@/helpers/ageCalculator";

// Define Patient interface for type safety
interface Patient {
  pat_id: string;
  pat_type: string;
  personal_info?: {
    per_fname?: string;
    per_mname?: string;
    per_lname?: string;
    per_dob?: string;
    per_sex?: string;
  };
  addressFull?:string;
  households?: { hh_id: string }[];
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_sitio?: string;
  };
}

interface PatientInfoCardProps {
  patient: Patient | null;
}

// Helper functions
const formatFullName = (personalInfo?: Patient["personal_info"]) => {
  if (!personalInfo) return "Not provided";
  const { per_fname = "", per_mname = "", per_lname = "" } = personalInfo;
  const fullName = `${per_fname} ${per_mname} ${per_lname}`.trim();
  return fullName || "Not provided";
};



const formatDateOfBirth = (dob?: string) => {
  if (!dob) return "Not provided";
  try {
    return format(new Date(dob), "MMM dd, yyyy");
  } catch {
    return "Invalid date";
  }
};

const formatAge = (dob?: string) => {
  if (!dob) return "N/A";
  try {
    return calculateAge(new Date(dob).toISOString());
  } catch {
    return "N/A";
  }
};

const getGenderIcon = (gender?: string) => {
  if (!gender) return User;
  return gender.toLowerCase() === "female" ? Heart : Shield;
};

// Empty state
const EmptyPatientState = () => (
  <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      No Patient Selected
    </h3>
    <p className="text-gray-600">Select a patient to view their information</p>
  </div>
);

export const PatientInfoCard = ({ patient }: PatientInfoCardProps) => {
  if (!patient) {
    return <EmptyPatientState />;
  }

  const fullName = formatFullName(patient.personal_info);
  const age = formatAge(patient.personal_info?.per_dob);
  const dob = formatDateOfBirth(patient.personal_info?.per_dob);
  const GenderIcon = getGenderIcon(patient.personal_info?.per_sex);

  return (
    <div className="p-6 bg-white rounded-sm  border border-gray-200">
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
              <p className="text-xs text-gray-500">{age} </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <GenderIcon className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {patient.personal_info?.per_sex || "Not specified"}
              </p>
              <p className="text-xs text-gray-500">Gender</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-col">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">
                {patient.addressFull || "No address provided"}
              </p>
              <p className="text-xs text-gray-500">Address</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-gray-900 leading-relaxed">
              {patient.address?.add_sitio || "No sitio provided"}
            </p>
            <p className="text-xs text-gray-500">Sitio</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
