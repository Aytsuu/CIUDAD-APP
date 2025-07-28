// components/vaccination/VaccinationStatusCards.tsx
import {
  Syringe,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface VaccinationStatusCardsProps {
  unvaccinatedVaccines: any[];
  followupVaccines: any[];
}

export function VaccinationStatusCards({
  unvaccinatedVaccines,
  followupVaccines,
}: VaccinationStatusCardsProps) {
  const [activeTab, setActiveTab] = useState<
    "pending" | "completed" | "missed"
  >("pending");

  // Categorize follow-up vaccines based on followup_status
  const categorizedFollowups = {
    pending: followupVaccines.filter(
      (vaccine) => vaccine.followup_status === "pending"
    ),
    completed: followupVaccines.filter(
      (vaccine) => vaccine.followup_status === "completed"
    ),
    missed: followupVaccines.filter(
      (vaccine) => vaccine.followup_status === "missed"
    ),
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Unvaccinated Vaccines Card */}
      <div className="bg-gray-100 rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-md shadow-sm">
            <Syringe className="h-5 w-5 text-red-600" aria-hidden="true" />
          </div>
          Unvaccinated Vaccines
        </h2>
        {unvaccinatedVaccines.length > 0 ? (
          <ul className="space-y-3" role="list">
            {unvaccinatedVaccines.map((vaccine: any, index: number) => (
              // Update the unvaccinated vaccines list item in the VaccinationStatusCards component
              <li
                key={index}
                className="bg-white rounded-xl p-2 border border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                role="listitem"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-400 rounded-full flex-shrink-0 shadow-sm"></div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {vaccine.vac_name}
                    </span>
                    {/* Add age group display if available */}
                    {vaccine.age_group && (
                      <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <span className="font-medium">Age Group:</span>
                        {vaccine.age_group.name && (
                          <span>{vaccine.age_group.name}</span>
                        )}
                        {vaccine.age_group.range && (
                          <span>({vaccine.age_group.range})</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                {/* <span
                  className={`text-xs px-3 py-1 rounded-full font-medium shadow-sm ${
                    vaccine.vac_type_choices.toLowerCase() === "routine"
                      ? "bg-gray-200 text-gray-700 border border-gray-300"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                  aria-label={`Vaccine type: ${vaccine.vac_type_choices}`}
                >
                  {vaccine.vac_type_choices}
                </span> */}
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

      {/* Follow-up Visit Schedules Card with Tabs */}
      <div className="bg-gray-100 rounded-xl p-6 flex-1 border border-gray-300 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-md shadow-sm">
              <Calendar className="h-5 w-5 text-blue-600" aria-hidden="true" />
            </div>
            Follow-up Visit Schedules
          </h2>
        </div>

        <div className="flex justify-evenly gap-1 bg-gray-200 p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3 py-1.5 text-sm  flex items-center gap-1 transition-colors border-b-2 ${
              activeTab === "pending"
                ? "border-blue-500 text-blue-600 font-medium"
                : "border-transparent hover:border-gray-300 text-gray-600"
            }`}
          >
            <Clock
              className={`h-4 w-4 ${
                activeTab === "pending" ? "text-blue-500" : "text-gray-500"
              }`}
            />
            Pending
            <span
              className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                activeTab === "pending"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {categorizedFollowups.pending.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 transition-colors border-b-2 ${
              activeTab === "completed"
                ? "border-green-500 text-green-600 font-medium"
                : "border-transparent hover:border-gray-300 text-gray-600"
            }`}
          >
            <CheckCircle
              className={`h-4 w-4 ${
                activeTab === "completed" ? "text-green-500" : "text-gray-500"
              }`}
            />
            Completed
            <span
              className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                activeTab === "completed"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {categorizedFollowups.completed.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("missed")}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 transition-colors border-b-2 ${
              activeTab === "missed"
                ? "border-red-500 text-red-600 font-medium"
                : "border-transparent hover:border-gray-300 text-gray-600"
            }`}
          >
            <AlertCircle
              className={`h-4 w-4 ${
                activeTab === "missed" ? "text-red-500" : "text-gray-500"
              }`}
            />
            Missed
            <span
              className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                activeTab === "missed"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {categorizedFollowups.missed.length}
            </span>
          </button>
        </div>

        {categorizedFollowups[activeTab].length > 0 ? (
          <ul className="space-y-3" role="list">
            {categorizedFollowups[activeTab].map(
              (vaccine: any, index: number) => (
                <li
                  key={index}
                  className="bg-white rounded-xl p-2 shadow-sm border border-zinc-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full flex-shrink-0 shadow-sm ${
                        activeTab === "pending"
                          ? "bg-blue-400"
                          : activeTab === "completed"
                          ? "bg-green-600"
                          : "bg-red-400"
                      }`}
                    ></div>
                    <span className="font-semibold text-gray-800">
                      {vaccine.vac_name}
                    </span>
                  </div>
                  {vaccine.followup_date && (
                    <div
                      className={`flex items-center gap-2 px-4 py-1 rounded-full ${
                        activeTab === "pending"
                          ? "bg-blue-50 text-blue-800"
                          : activeTab === "completed"
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                      }`}
                    >
                      <span className="text-sm font-semibold">
                        {activeTab === "completed"
                          ? "Completed on: "
                          : "Follow-up: "}
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
                  )}
                </li>
              )
            )}
          </ul>
        ) : (
          <div className="text-center py-8" role="status">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              {activeTab === "pending" && (
                <Clock className="h-8 w-8 text-gray-700 " />
              )}
              {activeTab === "completed" && (
                <CheckCircle className="h-8 w-8 text-gray-700" />
              )}
              {activeTab === "missed" && (
                <AlertCircle className="h-8 w-8 text-gray-700" />
              )}
            </div>
            <p className="text-gray-800 font-bold text-lg">
              {activeTab === "pending" && "No pending follow-ups"}
              {activeTab === "completed" && "No completed follow-ups"}
              {activeTab === "missed" && "No missed follow-ups"}
            </p>
            <p className="text-sm text-gray-700  mt-1">
              {activeTab === "pending" &&
                "No pending follow-up vaccines found for this patient."}
              {activeTab === "completed" &&
                "No completed follow-up vaccines found for this patient."}
              {activeTab === "missed" &&
                "No missed follow-up vaccines found for this patient."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
