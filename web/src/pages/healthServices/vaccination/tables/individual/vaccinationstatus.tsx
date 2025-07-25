// components/vaccination/VaccinationStatusCards.tsx
import { Syringe, Calendar } from "lucide-react";

interface VaccinationStatusCardsProps {
  unvaccinatedVaccines: any[];
  followupVaccines: any[];
}

export function VaccinationStatusCards({
  unvaccinatedVaccines,
  followupVaccines,
}: VaccinationStatusCardsProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="bg-gray-100 rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-md shadow-sm">
            <Syringe className="h-5 w-5 text-red-600" aria-hidden="true" />
          </div>
          Unvaccinated Vaccines
        </h2>
        {unvaccinatedVaccines.length > 0 ? (
          <ul className="space-y-3" role="list">
            {unvaccinatedVaccines.map((vaccine: any, index: any) => (
              <li
                key={index}
                className="bg-white rounded-xl p-2 border border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                role="listitem"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-400 rounded-full flex-shrink-0 shadow-sm"></div>
                  <span className="font-semibold text-gray-800">
                    {vaccine.vac_name}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
                      vaccine.vac_type_choices.toLowerCase() === "routine"
                        ? "bg-gray-200 text-gray-700 border border-gray-300"
                        : "bg-gray-100 text-gray-600 border border-gray-200"
                    }`}
                    aria-label={`Vaccine type: ${vaccine.vac_type_choices}`}
                  >
                    {vaccine.vac_type_choices}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Syringe className="h-8 w-8 text-gray-700" />
            </div>
            <p className="text-gray-800 font-bold text-lg">
              All vaccines completed!
            </p>
            <p className="text-sm text-gray-700 mt-1">
              All available vaccines have been administered
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-100 rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-md shadow-sm">
            <Calendar className="h-5 w-5 text-blue" aria-hidden="true" />
          </div>
          Follow-up Visit Schedules
        </h2>
        {followupVaccines.length > 0 ? (
          <ul className="space-y-3" role="list">
            {followupVaccines.map((vaccine: any, index: any) => (
              <li
                key={index}
                className="bg-white rounded-xl p-2 shadow-sm border border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                role="listitem"
              >
                {vaccine.followup_date &&
                  !isNaN(new Date(vaccine.followup_date).getTime()) && (
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-gray-400 rounded-full flex-shrink-0 shadow-sm"></div>
                      <span className="font-semibold text-gray-800">
                        {vaccine.vac_name}
                      </span>
                    </div>
                  )}
                {vaccine.followup_date &&
                !isNaN(new Date(vaccine.followup_date).getTime()) ? (
                  <div className="flex items-center gap-2 bg-gray-200 px-4">
                    <span className="text-sm font-semibold text-blue">
                      Follow-up:{" "}
                      {new Date(vaccine.followup_date).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                ) : (
                  <span
                    className="text-xs text-gray-600 italic bg-gray-100 px-3 py-1 rounded-full border border-gray-200 shadow-sm"
                    aria-label="No follow-up visit scheduled"
                  >
                    No follow-up visit scheduled
                  </span>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8" role="status">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Syringe className="h-8 w-8 text-gray-700" />
            </div>
            <p className="text-gray-800 font-bold text-lg">
              No follow-ups scheduled
            </p>
            <p className="text-sm text-gray-700 mt-1">
              No follow-up vaccines or visit data found for this patient.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}