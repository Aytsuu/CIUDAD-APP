import { format } from "date-fns";
import { Calendar, MapPin, User, UserCheck } from "lucide-react";
import { calculateAge } from "@/helpers/ageCalculator";

// Define Patient interface for type safety
interface Patient {
  pat_id: number;
  pat_type: string;
  personal_info?: {
    per_fname?: string;
    per_mname?: string;
    per_lname?: string;
    per_dob?: string;
    per_sex?: string;
  };
  households?: { hh_id: string }[];
  address?: {
    add_street?: string;
    add_barangay?: string;
    add_city?: string;
    add_province?: string;
    add_external_sitio?: string;
  };
}

interface PatientInfoCardProps {
  patient: Patient | null;
}

export const PatientInfoCard = ({ patient }: PatientInfoCardProps) => {
  if (!patient) {
    return (
      <div className="rounded-xl p-4 text-center">
        <User className="mx-auto h-8 w-8 text-gray-400 mb-4" />
        <h3 className="text-base font-medium text-gray-900 mb-2">
          No Patient Selected
        </h3>
        <p className="text-sm text-gray-500">
          Please select a patient to view their information
        </p>
      </div>
    );
  }

  const fullName = `${patient.personal_info?.per_fname || ""} ${
    patient.personal_info?.per_mname || ""
  } ${patient.personal_info?.per_lname || ""}`.trim();
  const fullAddress = [
    patient.households?.[0]?.hh_id,
    patient.address?.add_street,
    patient.address?.add_barangay,
    patient.address?.add_city,
    patient.address?.add_province,
    patient.address?.add_external_sitio,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Patient Information
            </h2>
            <p className="text-sm text-gray-600">Current patient details</p>
          </div>
        </div>
        <div className="sm:ml-auto">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="h-3 w-3" />
            {format(new Date(), "MMM dd, yyyy")}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700">Full Name</p>
              <p className="text-sm text-gray-900 break-words">
                {fullName || "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700">Address</p>
              <p className="text-sm text-gray-900 break-words">
                {fullAddress || "Not provided"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-700">Date of Birth</p>
              <p className="text-sm text-gray-900">
                {patient.personal_info?.per_dob
                  ? format(
                      new Date(patient.personal_info.per_dob),
                      "MMM dd, yyyy"
                    )
                  : "Not provided"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <UserCheck className="h-4 w-4 text-gray-500 mt-1 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <p className="text-xs font-medium text-gray-700">Age</p>
                  <p className="text-sm text-gray-900">
                    {patient.personal_info?.per_dob
                      ? calculateAge(
                          new Date(patient.personal_info.per_dob).toISOString()
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Gender</p>
                  <p className="text-sm text-gray-900">
                    {patient.personal_info?.per_sex || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-700">Type</p>
                  <p className="text-sm text-gray-900">
                    {patient.pat_type || "Standard"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
