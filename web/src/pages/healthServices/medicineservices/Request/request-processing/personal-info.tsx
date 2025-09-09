import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button/button";
import { User, Calendar, Phone, HeartPulse, Mail, Home, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { calculateAge } from "@/helpers/ageCalculator";
import { createPatients } from "@/pages/record/health/patientsRecord/restful-api/post";
import { updateMedicineRequest } from "../restful-api/update";




interface PersonalInfoCardProps {
  personalInfo: any;
  address?: any;
  currentPatId?: string | null;
  rp_id?: string;
  medreq_id: string;
  onPatientRegistered: (patId: string) => void;
}

export function PersonalInfoCard({
  personalInfo,
  address,
  currentPatId,
  rp_id,
  medreq_id,
  onPatientRegistered
}: PersonalInfoCardProps) {
  const [isRegistering, setIsRegistering] = useState(false);

  const fullName = `${personalInfo.per_lname}, ${personalInfo.per_fname} ${personalInfo.per_mname || ""}`.trim();
  const age = calculateAge(personalInfo.per_dob);

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
        pat_type: "Resident",
      });
      
      await updateMedicineRequest(medreq_id, {
        rp_id: null,
        pat_id: response.pat_id,
      });
      
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
    <div className="xl:col-span-2">
      <Card className="border border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Main Patient Info */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {fullName}
                </h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {age} years old
                  </span>
                  <span>•</span>
                  <span>{personalInfo.per_sex}</span>
                </div>
              </div>
            </div>

            {/* Compact Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Date of Birth
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(personalInfo.per_dob).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg">
                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Contact Number
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {personalInfo.per_contact || "Not provided"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg">
                <HeartPulse className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Patient Status
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {currentPatId ? "Registered" : "Not Registered"}
                    </p>
                    {currentPatId ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ID: {currentPatId}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Unregistered
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Civil Status
                  </p>
                  <p className="text-sm font-semibold text-gray-900">
                    {personalInfo.per_status || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="flex items-start p-3 gap-3">
                <Home className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">
                    Complete Address
                  </p>
                  <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                    {address?.full_address || "No Address Provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Alert */}
            {!currentPatId && rp_id && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-blue-900 font-semibold mb-1">
                      Registration Required
                    </h4>
                    <p className="text-blue-700 text-sm mb-3">
                      Register this person as a patient to enable medical
                      tracking and history.
                    </p>
                    <Button
                      onClick={handleRegisterPatient}
                      size="sm"
                      disabled={isRegistering}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isRegistering ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Registering...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3 h-3 mr-2" />
                          Register Patient
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

