import { Calendar, MapPin, Baby, Cross, HospitalIcon } from "lucide-react";
import { getOrdinalSuffix } from "@/helpers/getOrdinalSuffix";
import { BsPerson, BsPersonFill } from "react-icons/bs";
import { Skeleton } from "@/components/ui/skeleton";
import { toTitleCase } from "@/helpers/ToTitleCase";


interface ChildHealthRecordCardProps {
  child: any | null;
  isLoading?: boolean;
}

const formatFullName = (child: any | null) => {
  if (!child) return "Not provided";
  const fullName = `${child.fname} ${child.mname} ${child.lname}`.trim();
  return fullName ? toTitleCase(fullName) : "Not provided";
};

const formatDateOfBirth = (dob?: string) => {
  if (!dob) return "Not provided";
  try {
    return new Date(dob).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
  } catch {
    return "Invalid date";
  }
};

const EmptyChildState = () => (
  <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
    <Baby className="w-12 h-12 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Child Selected</h3>
    <p className="text-gray-600">Select a child to view their information</p>
  </div>
);

const ChildHealthRecordCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    {/* Header Skeleton */}
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div>
            <Skeleton className="h-5 w-48 mb-2" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <span className="text-gray-300">•</span>
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
        <div className="text-right">
          <Skeleton className="h-3 w-16 mb-1" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Info Items Skeleton */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-2">
                <Skeleton className="w-4 h-4 mt-0.5" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-1" />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-3">
            <div className="flex items-start gap-2">
              <Skeleton className="w-4 h-4 mt-0.5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-full mb-1" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="w-4 h-4 mt-0.5" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Parent Info Skeleton */}
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="flex items-start gap-2">
                  <Skeleton className="w-4 h-4 mt-0.5" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40 mb-1" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
                <div className="ml-6 mt-1">
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
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
      <p className="text-sm font-medium text-gray-900">{value ? toTitleCase(value) : "Not provided"}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

export const ChildHealthRecordCard = ({ child, isLoading = false }: ChildHealthRecordCardProps) => {
  // Show skeleton while loading
  if (isLoading) return <ChildHealthRecordCardSkeleton />;
  
  // Show empty state if no child data
  if (!child) return <EmptyChildState />;

  const fullName = formatFullName(child);
  const dob = formatDateOfBirth(child.dob);
  
  // Format parent names with title case
  const motherName = `${child.mother_fname} ${child.mother_mname} ${child.mother_lname}`.trim();
  const fatherName = `${child.father_fname} ${child.father_mname} ${child.father_lname}`.trim();
  const formattedMotherName = motherName ? toTitleCase(motherName) : "Not provided";
  const formattedFatherName = fatherName ? toTitleCase(fatherName) : "Not provided";
  
  // Format address with title case
  const fulladdress = `${child.address} ${child.landmarks}`.trim();
  const formattedAddress = fulladdress ? toTitleCase(fulladdress) : "Not provided";

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
                <span>{child.age} </span>
                <span>•</span>
                <span className="capitalize">{toTitleCase(child.sex)}</span>
                <span className="font-semibold text-blue-500">
                  ({getOrdinalSuffix(parseInt(child.birth_order, 10))} Born)
                </span>
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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date of Birth */}
                <InfoItem label="Date of Birth" value={dob} icon={Calendar} color="text-blue-600" />


                {/* Delivery Info */}
                {child.delivery_type && (
                  <InfoItem label="Delivery Type" value={child.delivery_type} icon={Cross} color="text-purple-600" />
                )}

                {/* Place of Delivery */}
                {child.pod_location && (
                  <InfoItem label="Place of Delivery" value={child.pod_location} icon={HospitalIcon} color="text-orange-600" />
                )}
              </div>
              <div className="mt-3 space-y-2">
                <InfoItem label="Full Address" value={formattedAddress} icon={MapPin} color="text-orange-600" />
                {child.landmarks && (
                  <InfoItem label="Landmark" value={child.landmarks} icon={MapPin} color="text-orange-600" />
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Parent Info */}
            <div>
              <div className="space-y-3">
                <div>
                  <InfoItem 
                    label={`Mother${child.mother_age ? ` (${child.mother_age})` : ""}`} 
                    value={formattedMotherName} 
                    icon={BsPerson} 
                    color="text-green-600" 
                  />
                  {child.mother_occupation && (
                    <div className="ml-6 text-xs text-gray-500">
                      Occupation: {toTitleCase(child.mother_occupation)}
                    </div>
                  )}
                </div>
                
                <div>
                  <InfoItem 
                    label={`Father${child.father_age ? ` (${child.father_age})` : ""}`} 
                    value={formattedFatherName} 
                    icon={BsPersonFill} 
                    color="text-green-600" 
                  />
                  {child.father_occupation && (
                    <div className="ml-6 text-xs text-gray-500">
                      Occupation: {toTitleCase(child.father_occupation)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};