import { Calendar, MapPin, User, Heart, Shield, Baby, Cross, Activity } from "lucide-react";

interface ChildHealthRecord {
  pat_id: string;
  fname: string;
  lname: string;
  mname: string;
  sex: string;
  age: string;
  dob: string;
  mother_fname: string;
  mother_lname: string;
  mother_mname: string;
  mother_occupation: string;
  mother_age: string;
  father_fname: string;
  father_lname: string;
  father_mname: string;
  father_age: string;
  father_occupation: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  landmarks: string;
  type_of_feeding: string;
  delivery_type: string;
  pod_location: string;
  tt_status: string;
  birth_order: string;
}

interface ChildHealthRecordCardProps {
  child: ChildHealthRecord | null;
}

const formatFullName = (child: ChildHealthRecord | null) => {
  if (!child) return "Not provided";
  return `${child.fname} ${child.mname} ${child.lname}`.trim() || "Not provided";
};

const formatDateOfBirth = (dob?: string) => {
  if (!dob) return "Not provided";
  try {
    return new Date(dob).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  } catch {
    return "Invalid date";
  }
};

const getGenderIcon = (gender?: string) => {
  return gender?.toLowerCase() === "female" ? Heart : Shield;
};

const EmptyChildState = () => (
  <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
    <Baby className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Child Selected</h3>
    <p className="text-gray-600">Select a child to view their information</p>
  </div>
);

interface InfoItemProps {
  label: string;
  value: string | null;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color?: string;
}

const InfoItem = ({ label, value, icon: Icon, color = "text-gray-700" }: InfoItemProps) => (
  <div className="flex items-start gap-2">
    <Icon className={`w-4 h-4 mt-0.5 ${color}`} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-gray-900">{value || "Not provided"}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

export const ChildHealthRecordCard = ({ child }: ChildHealthRecordCardProps) => {
  if (!child) return <EmptyChildState />;

  const fullName = formatFullName(child);
  const dob = formatDateOfBirth(child.dob);
  const GenderIcon = getGenderIcon(child.sex);
  const motherName = `${child.mother_fname} ${child.mother_mname} ${child.mother_lname}`.trim();
  const fatherName = `${child.father_fname} ${child.father_mname} ${child.father_lname}`.trim();
  const fullAddress = [child.street, child.barangay, child.city, child.province]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Baby className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{fullName}</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{child.age} years</span>
                <span>•</span>
                <span className="capitalize">{child.sex}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-gray-500">Patient ID</span>
            <p className="text-sm font-medium text-gray-700">{child.pat_id}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Personal Info */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <h3 className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-3">
                <User className="w-4 h-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoItem label="Date of Birth" value={dob} icon={Calendar} color="text-blue-600" />
                <InfoItem label="Gender" value={child.sex} icon={GenderIcon} color="text-blue-600" />
                {child.birth_order && (
                  <InfoItem label="Birth Order" value={child.birth_order} icon={User} color="text-blue-600" />
                )}
                {child.type_of_feeding && (
                  <InfoItem label="Feeding Type" value={child.type_of_feeding} icon={Heart} color="text-blue-600" />
                )}
              </div>
            </div>

            {/* Birth Info */}
            {child.delivery_type && (
              <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                <h3 className="flex items-center gap-2 text-purple-700 font-semibold text-sm mb-3">
                  <Activity className="w-4 h-4" />
                  Birth Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoItem label="Delivery Type" value={child.delivery_type} icon={Cross} color="text-purple-600" />
                  {child.pod_location && (
                    <InfoItem label="Location" value={child.pod_location} icon={MapPin} color="text-purple-600" />
                  )}
                  {child.tt_status && (
                    <InfoItem label="TT Status" value={child.tt_status} icon={Shield} color="text-purple-600" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Parent Info */}
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <h3 className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-3">
                <User className="w-4 h-4" />
                Parent Information
              </h3>
              <div className="space-y-3">
                <InfoItem 
                  label={`Mother${child.mother_age ? ` (${child.mother_age})` : ""}`}
                  value={motherName} 
                  icon={Heart} 
                  color="text-green-600"
                />
                {child.mother_occupation && (
                  <div className="ml-6 text-xs text-gray-500">
                    Occupation: {child.mother_occupation}
                  </div>
                )}
                <InfoItem 
                  label={`Father${child.father_age ? ` (${child.father_age})` : ""}`}
                  value={fatherName} 
                  icon={Shield} 
                  color="text-green-600"
                />
                {child.father_occupation && (
                  <div className="ml-6 text-xs text-gray-500">
                    Occupation: {child.father_occupation}
                  </div>
                )}
              </div>
            </div>

            {/* Address Info */}
            <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
              <h3 className="flex items-center gap-2 text-orange-700 font-semibold text-sm mb-3">
                <MapPin className="w-4 h-4" />
                Address
              </h3>
              <div className="space-y-3">
                <InfoItem 
                  label="Full Address" 
                  value={fullAddress} 
                  icon={MapPin} 
                  color="text-orange-600"
                />
                {child.landmarks && (
                  <InfoItem 
                    label="Landmark" 
                    value={child.landmarks} 
                    icon={MapPin} 
                    color="text-orange-600"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};