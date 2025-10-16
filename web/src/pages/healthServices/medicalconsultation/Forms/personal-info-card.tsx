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
  Mail, 
  AlertCircle, 
  CheckCircle,
  Heart,
  Baby,
  Cross,
} from "lucide-react";
import { format } from "date-fns";

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
    full_address?: string;
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
}

const InfoItem = ({ label, value, icon: Icon, color = "text-gray-700", className = "" }: InfoItemProps) => (
  <div className={`flex items-start gap-2 ${className}`}>
    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{value || "Not provided"}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

const StatusBadge = ({ isRegistered, patientId }: { isRegistered: boolean; patientId: string | null }) => (
  <div className="flex items-center gap-2">
    <Badge 
      variant={isRegistered ? "default" : "secondary"}
      className={
        isRegistered 
          ? "bg-green-100 text-green-800 border-green-200" 
          : "bg-yellow-100 text-yellow-800 border-yellow-200"
      }
    >
      {isRegistered ? "Registered" : "Not Registered"}
    </Badge>
    {patientId && (
      <Badge variant="outline" className="text-xs bg-blue-50">
        ID: {patientId}
      </Badge>
    )}
  </div>
);

const AlertMessage = ({ 
  type, 
  message, 
  description 
}: { 
  type: "warning" | "success"; 
  message: string; 
  description?: string;
}) => (
  <div className={
    type === "warning" 
      ? "bg-yellow-50 border border-yellow-200 rounded-lg p-3" 
      : "bg-green-50 border border-green-200 rounded-lg p-3"
  }>
    <div className="flex items-center gap-2">
      {type === "warning" ? (
        <AlertCircle className="h-4 w-4 text-yellow-600" />
      ) : (
        <CheckCircle className="h-4 w-4 text-green-600" />
      )}
      <Label className={
        type === "warning" ? "text-yellow-800 text-sm font-medium" : "text-green-800 text-sm font-medium"
      }>
        {message}
      </Label>
    </div>
    {description && (
      <p className={
        type === "warning" ? "text-yellow-700 text-xs mt-1" : "text-green-700 text-xs mt-1"
      }>
        {description}
      </p>
    )}
  </div>
);

export function PersonalInfoCard({
  personalInfo,
  address,
  currentPatId,
  onPatientRegistered,
  shouldShowRegisterButton,
  isPatientRegistered,
  isCheckingPatient,
}: PersonalInfoCardProps) {
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
  const fullName = `${personalInfo.per_fname} ${personalInfo.per_mname || ''} ${personalInfo.per_lname}`.trim().replace(/\s+/g, ' ');
  
  const formatAddress = () => {
    if (!address) return null;
    if (address.full_address) return address.full_address;
    
    const addressParts = [
      address.add_sitio,
      address.add_street,
      address.add_barangay,
      address.add_city,
      address.add_province
    ].filter(Boolean);
    
    return addressParts.join(', ') || null;
  };

  const formattedDob = personalInfo.per_dob 
    ? format(new Date(personalInfo.per_dob), "MMMM d, yyyy")
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Patient Information</h2>
              <StatusBadge isRegistered={isPatientRegistered} patientId={currentPatId} />
            </div>
          </div>
          
          {/* Registration Button */}
          {shouldShowRegisterButton && (
            <Button
              onClick={onPatientRegistered}
              disabled={isCheckingPatient}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
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
        {/* Status Alerts */}
        {!isPatientRegistered && !isCheckingPatient && (
          <AlertMessage
            type="warning"
            message="Patient not registered in the system"
            description="Please register the patient before proceeding with the consultation."
          />
        )}

        {/* {isPatientRegistered && currentPatId && (
          <AlertMessage
            type="success"
            message="Patient registered successfully"
            description={`Patient ID: ${currentPatId}`}
          />
        )} */}

        {/* Patient Information */}
        <div className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Personal Details */}
            <div className="space-y-4">
              {/* Name */}
              <div>
                <div className="space-y-3">
                  <InfoItem
                    label="Full Name"
                    value={fullName}
                    icon={User}
                    color="text-blue-600"
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      label="Date of Birth"
                      value={formattedDob}
                      icon={Calendar}
                      color="text-purple-600"
                    />
                    
                    <InfoItem
                      label="Age"
                      value={age !== null ? `${age} years old` : null}
                      icon={Heart}
                      color="text-red-600"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      label="Gender"
                      value={personalInfo.per_sex ? personalInfo.per_sex.charAt(0).toUpperCase() + personalInfo.per_sex.slice(1) : null}
                      icon={Baby}
                      color="text-pink-600"
                    />
                    
                    {personalInfo.per_status && (
                      <InfoItem
                        label="Civil Status"
                        value={personalInfo.per_status.charAt(0).toUpperCase() + personalInfo.per_status.slice(1)}
                        icon={Cross}
                        color="text-gray-600"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact & Address */}
            <div className="space-y-4">
              <div className="space-y-3">
                <InfoItem
                  label="Address"
                  value={formatAddress()}
                  icon={MapPin}
                  color="text-orange-600"
                />
                
                {personalInfo.per_contact && (
                  <InfoItem
                    label="Contact Number"
                    value={personalInfo.per_contact}
                    icon={Phone}
                    color="text-green-600"
                  />
                )}
                
                {personalInfo.per_email && (
                  <InfoItem
                    label="Email"
                    value={personalInfo.per_email}
                    icon={Mail}
                    color="text-blue-600"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}