"use client";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  User,
  MapPin,
  Calendar,
  Phone,
  AlertCircle,
  CheckCircle,
  Heart,
  Baby,
  Map // added
} from "lucide-react";
import { format } from "date-fns";
import { toTitleCase } from "@/helpers/ToTitleCase";

interface PersonalInfoCardProps {
  personalInfo: {
    per_fname: string;
    per_mname?: string;
    per_lname: string;
    per_dob: string;
    per_sex: string;
    per_contact?: string;
    per_email?: string;
    per_status?: string;
  };
  address: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_sitio?: string;
  } | null;
  currentPatId: string | null;
  rp_id: string;
  onPatientRegistered: () => void;
  shouldShowRegisterButton: boolean;
  isPatientRegistered: boolean;
  isCheckingPatient: boolean;
  patientExists: any;
}

interface InfoItemProps {
  label: string;
  value: string | null;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
  className?: string;
  titleCase?: boolean;
  valueClassName?: string; // added
}

const InfoItem = ({ label, value, icon: Icon, color = "text-gray-700", className = "", titleCase = true, valueClassName }: InfoItemProps) => {
  const text = value == null || value === "" ? "Not provided" : titleCase ? toTitleCase(value) : value;

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-900 ${valueClassName ?? "truncate"}`}>{text}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
};

const StatusBadge = ({ isRegistered, patientId }: { isRegistered: boolean; patientId: string | null }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className={`text-xs font-medium ${isRegistered ? "text-green-700" : "text-yellow-700"}`}>
      {isRegistered ? "Registered as Patient" : "Not Registered"}
    </span>
    {patientId && (
      <Badge variant="outline" className="text-xs bg-blue-50 hover:bg-blue-50">
        ID: {patientId}
      </Badge>
    )}
  </div>
);

const AlertMessage = ({ type, message, description }: { type: "warning" | "success"; message: string; description?: string }) => (
  <div className={type === "warning" ? "bg-yellow-50 border border-yellow-200 rounded-lg p-3" : "bg-green-50 border border-green-200 rounded-lg p-3"}>
    <div className="flex items-center gap-2">
      {type === "warning" ? <AlertCircle className="h-4 w-4 text-yellow-600" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
      <Label className={type === "warning" ? "text-yellow-800 text-sm font-medium" : "text-green-800 text-sm font-medium"}>{message}</Label>
    </div>
    {description && <p className={type === "warning" ? "text-yellow-700 text-xs mt-1" : "text-green-700 text-xs mt-1"}>{description}</p>}
  </div>
);

export function PersonalInfoCard({ personalInfo, address, currentPatId, onPatientRegistered, shouldShowRegisterButton, isPatientRegistered, isCheckingPatient }: PersonalInfoCardProps) {
  const calculateAge = (dob: string) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(personalInfo.per_dob);

  const fullNameRaw = `${personalInfo.per_fname} ${personalInfo.per_mname || ""} ${personalInfo.per_lname}`.trim().replace(/\s+/g, " ");
  const fullName = fullNameRaw ? toTitleCase(fullNameRaw) : "Not provided";

  // Exclude sitio here; show it as a separate item below
  const formatAddress = () => {
    if (!address) return null;
    const addressParts = [address.add_street, address.add_barangay, address.add_city, address.add_province].filter(Boolean).map((p) => toTitleCase(String(p)));
    const joined = addressParts.join(", ");
    return joined || null;
  };

  const formattedDob = personalInfo.per_dob ? format(new Date(personalInfo.per_dob), "MMM dd, yyyy") : null;

  const gender = personalInfo.per_sex ? toTitleCase(personalInfo.per_sex) : null;
  // const civilStatus = personalInfo.per_status ? toTitleCase(personalInfo.per_status) : null;
  const sitio = address?.add_sitio ? toTitleCase(address.add_sitio) : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
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
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-800 truncate">{fullName}</h2>
              <StatusBadge isRegistered={isPatientRegistered} patientId={currentPatId} />
            </div>
          </div>

          {shouldShowRegisterButton && (
            <Button onClick={onPatientRegistered} disabled={isCheckingPatient} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              {isCheckingPatient ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  Register Patient
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {!isPatientRegistered && !isCheckingPatient && <AlertMessage type="warning" message="Patient not registered in the system" description="Please register the patient before proceeding with the consultation." />}

        {/* Balanced grid like the sample */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Row 1: Age • Sex • DOB */}
          <InfoItem label="Age" value={age !== null ? `${age} yrs old` : null} icon={Heart} color="text-red-600" titleCase={false} />
          <InfoItem label="Sex" value={gender} icon={Baby} color="text-pink-600" />
          <InfoItem label="Date of Birth" value={formattedDob} icon={Calendar} color="text-blue-600" titleCase={false} />

          {/* Row 2: Full Address (span 2) • Sitio */}
          <InfoItem label="Full Address" value={formatAddress()} icon={MapPin} color="text-orange-600" valueClassName="whitespace-normal break-words" className="sm:col-span-2" />
          <InfoItem label="Sitio" value={sitio} icon={Map} color="text-red-600" />
          
          {/* Row 3: Contact Number */}
          <InfoItem label="Contact Number" value={personalInfo.per_contact || null} icon={Phone} color="text-green-600" titleCase={false} />
        </div>
      </div>
    </div>
  );
}
