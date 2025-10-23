import { format } from "date-fns";
import { Calendar, MapPin, User, Heart, Shield, Map } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import { calculateAge } from "@/helpers/ageCalculator";
import { Skeleton } from "@/components/ui/skeleton";
import { toTitleCase } from "@/helpers/ToTitleCase";

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
  addressFull?: string;
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
  isLoading?: boolean;
}

// Helper functions
const formatFullName = (personalInfo?: Patient["personal_info"]) => {
  if (!personalInfo) return "Not provided";
  const { per_fname = "", per_mname = "", per_lname = "" } = personalInfo;
  const fullName = `${per_fname} ${per_mname || ""} ${per_lname}`.replace(/\s+/g, " ").trim();
  return fullName ? toTitleCase(fullName) : "Not provided";
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

const makeAddress = (p: Patient) => {
  if (p.addressFull && p.addressFull.trim()) return toTitleCase(p.addressFull);
  const parts = [p.address?.add_street, p.address?.add_barangay, p.address?.add_city, p.address?.add_province].filter((part) => part && String(part).trim() && String(part).toLowerCase() !== "no data").map((s) => toTitleCase(String(s).trim()));
  return parts.length ? parts.join(", ") : "No address provided";
};

// Compact info row
interface InfoItemProps {
  label: string;
  value: string | number | null | undefined;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color?: string;
  titleCase?: boolean;
}

const InfoItem = ({ label, value, icon: Icon, color = "text-gray-700", titleCase = true }: InfoItemProps) => {
  const text = value == null || value === "" ? "Not provided" : typeof value === "string" && titleCase ? toTitleCase(value) : value;
  return (
    <div className="flex items-start gap-2">
      <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{text}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};

// Empty state
const EmptyPatientState = () => (
  <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
    <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Patient Selected</h3>
    <p className="text-gray-600">Select a patient to view their information</p>
  </div>
);

// Skeleton
const PatientInfoSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-3">
        <Skeleton className="w-9 h-9 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-5 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>

    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start gap-2">
            <Skeleton className="w-4 h-4 mt-0.5" />
            <div className="flex-1">
              <Skeleton className="h-4 w-56 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const PatientInfoCard = ({ patient, isLoading = false }: PatientInfoCardProps) => {
  if (isLoading) return <PatientInfoSkeleton />;
  if (!patient) return <EmptyPatientState />;

  const fullName = formatFullName(patient.personal_info);
  const age = formatAge(patient.personal_info?.per_dob);
  const dob = formatDateOfBirth(patient.personal_info?.per_dob);
  const GenderIcon = getGenderIcon(patient.personal_info?.per_sex);
  const address = makeAddress(patient);
  const sitioRaw = patient.address?.add_sitio?.trim();
  const sitio = sitioRaw ? toTitleCase(sitioRaw) : "No sitio provided";

  const sex = patient.personal_info?.per_sex || "Not specified";
  const sexLabel = sex.toUpperCase();
  const genderColor = sex && sex.toLowerCase() === "female" ? "text-pink-600" : sex && sex.toLowerCase() === "male" ? "text-blue-600" : "text-gray-600";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg flex items-center justify-center w-9 h-9">
            <span className="text-blue-600 font-bold text-sm">
              {fullName
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "NA"}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-800 truncate">{fullName}</h2>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">ID: {patient.pat_id}</span>
              <span className="text-gray-300">•</span>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${patient.pat_type?.toLowerCase() === "resident" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{patient.pat_type ? toTitleCase(patient.pat_type) : "Unknown"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - responsive, balanced grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Row 1: Age + Sex */}
          <InfoItem label="Age" value={age} icon={User} color="text-blue-600" titleCase={false} />
          <InfoItem label="Sex" value={sexLabel} icon={GenderIcon} color={genderColor} titleCase={false} />

          {/* Row 2: Date of Birth */}
          <InfoItem label="Date of Birth" value={dob} icon={Calendar} color="text-blue-600" />

          {/* Row 3: Full Address spans both columns */}
          <InfoItem label="Full Address" value={address} icon={MapPin} color="text-orange-600" />
          <InfoItem label="Sitio" value={sitio} icon={Map} color="text-red-600" />


          {/* Row 4: Sitio */}
        </div>
      </div>
    </div>
  );
};
