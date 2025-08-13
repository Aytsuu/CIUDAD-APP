// components/vaccination/VaccinationStatusCards.tsx
import { Syringe, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useState } from "react";

interface VaccinationStatusCardsProps {
  vaccinations: any[];
  unvaccinatedVaccines: any[];
}

export function VaccinationStatusCards({
  vaccinations = [],
  unvaccinatedVaccines = [],
}: VaccinationStatusCardsProps) {
  const [activeTab, setActiveTab] = useState<
    "unvaccinated" | "completed" | "partial"
  >("unvaccinated");

  // Group vaccinations by vaccine type and find the latest record for each
  const groupedVaccinations = vaccinations.reduce((acc, record) => {
    const vaccineId =
      record.vaccine_stock?.vaccinelist?.vac_id || record.vac_details?.vac_id;
    if (!vaccineId) return acc;

    if (
      !acc[vaccineId] ||
      new Date(record.date_administered) >
        new Date(acc[vaccineId].date_administered)
    ) {
      acc[vaccineId] = record;
    }
    return acc;
  }, {});

  // Categorize the latest records
  const categorizedVaccines = {
    completed: Object.values(groupedVaccinations).filter(
      (record: any) =>
        record.vachist_doseNo === record.vacrec_details?.vacrec_totaldose
    ),
    partial: Object.values(groupedVaccinations).filter(
      (record: any) =>
        record.vachist_doseNo < record.vacrec_details?.vacrec_totaldose
    ),
    unvaccinated: unvaccinatedVaccines,
  };

  // Helper component for tab buttons (adopted from FollowUpsCard)
  const TabButton = ({
    active,
    type,
    count,
    onClick,
  }: {
    active: boolean;
    type: "unvaccinated" | "completed" | "partial";
    count: number;
    onClick: () => void;
  }) => {
    const config = {
      unvaccinated: { icon: AlertCircle, color: "red" },
      partial: { icon: Clock, color: "yellow" },
      completed: { icon: CheckCircle, color: "green" },
    }[type];

    return (
      <button
        onClick={onClick}
        className={`flex-1 py-2 text-sm flex flex-row justify-center items-center gap-2 transition-colors border-b-2 ${
          active
            ? `border-${config.color}-600 text-${config.color}-700 font-medium`
            : "border-transparent text-gray-600 hover:border-gray-300"
        }`}
      >
        <config.icon
          className={`h-4 w-4 ${
            active ? `text-${config.color}-600` : "text-gray-500"
          }`}
        />
        <span className="capitalize">
          {type === "partial" ? "Partially " : type}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-md ${
            active
              ? `bg-${config.color}-100 text-${config.color}-800`
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {count}
        </span>
      </button>
    );
  };

  const renderVaccineList = (vaccines: any[]) => {
    if (vaccines.length === 0) {
      return (
        <div className="flex items-center justify-center h-[250px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mx-auto mb-4 shadow-sm">
              {activeTab === "completed" ? (
                <CheckCircle className="h-8 w-8 text-gray-700" />
              ) : activeTab === "partial" ? (
                <Clock className="h-8 w-8 text-gray-700" />
              ) : (
                <AlertCircle className="h-8 w-8 text-gray-700" />
              )}
            </div>
            <p className="text-gray-800 font-bold text-lg">
              {activeTab === "completed"
                ? "No completed vaccines"
                : activeTab === "partial"
                ? "No partially vaccinated"
                : "No unvaccinated vaccines"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-y-auto h-[250px]">
        <ul className="space-y-3 pr-2">
          {vaccines.map((record: any, index: number) => {
            // For unvaccinated, the structure is different
            if (activeTab === "unvaccinated") {
              return (
                <li
                  key={index}
                  className="bg-white rounded-xl p-4 border border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  role="listitem"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-md flex-shrink-0 shadow-sm"></div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">
                        {record.vac_name}
                      </span>
                      {record.age_group && (
                        <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <span className="font-medium">Age Group:</span>
                          {record.age_group.name && (
                            <span>{record.age_group.name}</span>
                          )}
                          {record.age_group.range && (
                            <span>({record.age_group.range})</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            }

            // For completed/partial vaccines
            const vaccineData =
              record.vaccine_stock?.vaccinelist || record.vac_details || {};
            const ageGroup = vaccineData.age_group || {};

            return (
              <li
                key={index}
                className="bg-white rounded-xl p-4 border border-gray-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                role="listitem"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-4 h-4 rounded-md flex-shrink-0 shadow-sm ${
                      activeTab === "completed"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  ></div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800">
                      {vaccineData.vac_name}
                    </span>
                    <div className="flex gap-4 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="font-medium">Dose:</span>
                        {record.vachist_doseNo} of{" "}
                        {record.vacrec_details?.vacrec_totaldose}
                      </span>
                      {ageGroup && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <span className="font-medium">Age Group:</span>
                          {ageGroup.agegroup_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {record.date_administered &&
                    new Date(record.date_administered).toLocaleDateString()}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
      {/* Adopted header style from FollowUpsCard */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Syringe className="h-5 w-5 text-blue-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">
          Vaccination Status
        </h2>
      </div>

      {/* Adopted tab design from FollowUpsCard */}
      <div className="flex gap-2 mb-4">
        <TabButton
          active={activeTab === "unvaccinated"}
          type="unvaccinated"
          count={categorizedVaccines.unvaccinated.length}
          onClick={() => setActiveTab("unvaccinated")}
        />
        <TabButton
          active={activeTab === "partial"}
          type="partial"
          count={categorizedVaccines.partial.length}
          onClick={() => setActiveTab("partial")}
        />
        <TabButton
          active={activeTab === "completed"}
          type="completed"
          count={categorizedVaccines.completed.length}
          onClick={() => setActiveTab("completed")}
        />
      </div>

      {/* Content structure with scrollable area */}
      <div >
        {activeTab === "unvaccinated" &&
          renderVaccineList(categorizedVaccines.unvaccinated)}
        {activeTab === "partial" &&
          renderVaccineList(categorizedVaccines.partial)}
        {activeTab === "completed" &&
          renderVaccineList(categorizedVaccines.completed)}
      </div>
    </div>
  );
}