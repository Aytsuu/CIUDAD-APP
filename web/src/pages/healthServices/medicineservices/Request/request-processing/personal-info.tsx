import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, MapPin, Calendar, AlertCircle, CheckCircle, Heart, Baby, Map } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { calculateAge } from "@/helpers/ageCalculator";
import { createPatients } from "@/pages/record/health/patientsRecord/restful-api/post";
import { updateMedicineRequest } from "../restful-api/update";
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
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_sitio?: string;
    full_address?: string;
  } | null;
  currentPatId?: string | null;
  rp_id?: string;
  medreq_id?: string;
  onPatientRegistered: (patId: string) => void;
  shouldShowRegisterButton?: boolean;
  isPatientRegistered?: boolean;
  isCheckingPatient?: boolean;
  patientExists?: boolean;
}

interface InfoItemProps {
  label: string;
  value: string | null;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
  className?: string;
  titleCase?: boolean;
  valueClassName?: string;
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

export function PersonalInfoCard({ personalInfo, address, currentPatId, rp_id, medreq_id, onPatientRegistered, shouldShowRegisterButton = true, isPatientRegistered = false, isCheckingPatient = false }: PersonalInfoCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const age = calculateAge(personalInfo.per_dob);

  const fullNameRaw = `${personalInfo.per_fname} ${personalInfo.per_mname || ""} ${personalInfo.per_lname}`.trim().replace(/\s+/g, " ");
  const fullName = fullNameRaw ? toTitleCase(fullNameRaw) : "Not provided";

  const formatAddress = () => {
    if (!address) return null;
    const addressParts = [address.add_street, address.add_barangay, address.add_city, address.add_province].filter(Boolean).map((p) => toTitleCase(String(p)));
    const joined = addressParts.join(", ");
    return joined || null;
  };

  const formattedDob = personalInfo.per_dob ? format(new Date(personalInfo.per_dob), "MMM dd, yyyy") : null;

  const gender = personalInfo.per_sex ? toTitleCase(personalInfo.per_sex) : null;
  const sitio = address?.add_sitio ? toTitleCase(address.add_sitio) : null;

  const handleRegisterPatient = async () => {
    if (!rp_id) return;

    setIsRegistering(true);
    try {
      const response = await createPatients({
        pat_status: "active",
        rp_id: rp_id,
        personal_info: personalInfo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pat_type: "Resident"
      });

      if (medreq_id) {
        await updateMedicineRequest(medreq_id, {
          rp_id: null,
          pat_id: response.pat_id
        });
      }

      onPatientRegistered(response.pat_id);
      toast.success("Successfully registered");
    } catch (error) {
      toast.error("Failed to register patient");
      console.error("Registration error:", error);
    } finally {
      setIsRegistering(false);
    }
  };

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
              <StatusBadge isRegistered={isPatientRegistered || !!currentPatId} patientId={currentPatId ?? null} />
            </div>
          </div>

          {shouldShowRegisterButton && !currentPatId && (
            <Button onClick={handleRegisterPatient} disabled={isCheckingPatient || isRegistering} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
              {isCheckingPatient || isRegistering ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isRegistering ? "Registering..." : "Checking..."}
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
        {!isPatientRegistered && !currentPatId && !isCheckingPatient && <AlertMessage type="warning" message="Patient not registered in the system" description="Please register the patient before proceeding with the medicine request." />}

        {/* Balanced grid */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Row 1: Age • Sex • DOB */}
          <InfoItem label="Age" value={age !== null ? `${age} yrs old` : null} icon={Heart} color="text-red-600" titleCase={false} />
          <InfoItem label="Sex" value={gender} icon={Baby} color="text-pink-600" />
          <InfoItem label="Date of Birth" value={formattedDob} icon={Calendar} color="text-blue-600" titleCase={false} />

          {/* Row 2: Full Address (span 2) • Sitio */}
          <InfoItem label="Full Address" value={formatAddress()} icon={MapPin} color="text-orange-600" valueClassName="whitespace-normal break-words" className="sm:col-span-2" />
          <InfoItem label="Sitio" value={sitio} icon={Map} color="text-red-600" />
        </div>
      </div>
    </div>
  );
}
