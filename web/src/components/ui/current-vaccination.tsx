import {
    Syringe,
    Activity,
    Calendar,
    Heart,
    Thermometer,
    Wind,
    Droplets,
  } from "lucide-react";
  import { format } from "date-fns";
  import CardLayout from "@/components/ui/card/card-layout";
  import { VaccinationRecord } from "@/pages/healthServices/vaccination/tables/columns/types";
  
  type CurrentVaccinationProps = {
    currentVaccination: VaccinationRecord | null;
  };
  
  export function CurrentVaccination({ currentVaccination }: CurrentVaccinationProps) {
    if (!currentVaccination) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-300">
          <p className="text-xl text-gray-600 font-medium">
            No current vaccination data available.
          </p>
        </div>
      );
    }
  
    // Safe date parsing function
    const parseDate = (dateString: string | undefined): Date | null => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    };
  
    // Format date safely
    const formatDate = (dateString: string | undefined, fallback = "N/A"): string => {
      const date = parseDate(dateString);
      return date ? format(date, "MMMM d, yyyy") : fallback;
    };
  
    return (
      <CardLayout
        content={
          <div className="">
            <div className="flex items-center gap-2 mb-4">
              <Syringe className="text-darkBlue1" size={16} />
              <h2 className="font-semibold text-base text-darkBlue1">
                Current Vaccination Details
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="font-medium text-sm text-gray-700 min-w-28">
                    Vaccine:
                  </span>
                  <span className="text-sm text-gray-900">
                    {currentVaccination.vaccine_name}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-sm text-gray-700 min-w-28">
                    Dose:
                  </span>
                  <span className="text-sm text-gray-900">
                    {Number(currentVaccination.vachist_doseNo) === 1
                      ? "1st Dose"
                      : Number(currentVaccination.vachist_doseNo) === 2
                      ? "2nd Dose"
                      : Number(currentVaccination.vachist_doseNo) === 3
                      ? "3rd Dose"
                      : `${currentVaccination.vachist_doseNo}th Dose`}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-sm text-gray-700 min-w-28">
                    Status:
                  </span>
                  <span className="text-sm text-gray-900">
                    {currentVaccination.vachist_status}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="font-medium text-sm text-gray-700 min-w-28">
                    Date:
                  </span>
                  <span className="text-sm text-gray-900">
                    {formatDate(currentVaccination.created_at)}
                  </span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-sm text-gray-700 min-w-28">
                    Age:
                  </span>
                  <span className="text-sm text-gray-900">
                    {currentVaccination.vachist_age}
                  </span>
                </div>
              </div>
            </div>
  
            {/* Vital Signs */}
            <div className="mb-4">
              <h3 className="font-semibold text-base text-gray-800 mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-darkGray" />
                Vital Signs
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
                  <div className="flex items-center gap-1 mb-1">
                    <Heart className="h-4 w-4 text-darkGray" />
                    <p className="text-sm font-medium text-gray-600">
                      Blood Pressure
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {currentVaccination.vital_signs.vital_bp_systolic}/
                    {currentVaccination.vital_signs.vital_bp_diastolic}
                  </p>
                  <p className="text-xs text-gray-500">mmHg</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
                  <div className="flex items-center gap-1 mb-1">
                    <Thermometer className="h-4 w-4 text-darkGray" />
                    <p className="text-sm font-medium text-gray-600">
                      Temperature
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {currentVaccination.vital_signs.vital_temp}
                  </p>
                  <p className="text-xs text-gray-500">°C</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
                  <div className="flex items-center gap-1 mb-1">
                    <Wind className="h-4 w-4 text-darkGray" />
                    <p className="text-sm font-medium text-gray-600">
                      Pulse Rate
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {currentVaccination.vital_signs.vital_pulse}
                  </p>
                  <p className="text-xs text-gray-500">per min</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-300">
                  <div className="flex items-center gap-1 mb-1">
                    <Droplets className="h-4 w-4 text-darkGray" />
                    <p className="text-sm font-medium text-gray-600">
                      Oxygen Saturation
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    {currentVaccination.vital_signs.vital_o2}
                  </p>
                  <p className="text-xs text-gray-500">%</p>
                </div>
              </div>
            </div>
  
            {/* Follow-up Schedule */}
            {currentVaccination.follow_up_visit && (
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-5 w-5 text-darkGray" />
                  <h3 className="font-semibold text-base text-darkGray">
                    Follow-up Schedule
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-start">
                    <span className="font-medium text-sm text-gray-700 px-2">
                      Next Dose Date:
                    </span>
                    <span className="text-sm text-gray-900">
                      {formatDate(currentVaccination.follow_up_visit.followv_date)}
                    </span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-sm text-gray-700 px-2">
                      Status:
                    </span>
                    <span className="text-sm text-gray-900">
                      {currentVaccination.follow_up_visit.followv_status || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        }
      />
    );
  }