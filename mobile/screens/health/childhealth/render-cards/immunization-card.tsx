import React from "react";
import { View, Text } from "react-native";
import { format, isValid } from "date-fns";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";

export const ImmunizationCard = ({ processedRecords, currentRecord, extractDOBFromRecord }:any) => {
  const hasImmunizationRecords = processedRecords.some((record:any) => record.rawRecord.immunization_tracking && record.rawRecord.immunization_tracking.length > 0);

  if (!hasImmunizationRecords) {
    return (
      <View className="bg-white rounded-lg p-4 py-16 border border-gray-200">
        <Text className="text-gray-600 text-center">No vaccination records yet</Text>
      </View>
    );
  }

  // Group immunizations by vaccine name and organize by dose
  const vaccineGroups: Record<string, Record<number, { date: string; age: string; isCurrentRecord: boolean }>> = {};

  processedRecords
    .filter((record:any) => {
      const recordDate = new Date(record.rawCreatedAt).getTime();
      const currentRecordDate = new Date(currentRecord?.rawCreatedAt || 0).getTime();
    return recordDate <= currentRecordDate;
    })
    .flatMap(
    (record: any) =>
      record.rawRecord.immunization_tracking?.map((tracking: any) => ({
        record,
        tracking
      })) || []
    )
    .forEach(({ record, tracking }: { record: any; tracking: any }) => {
      const vaccinationHistory = tracking.vachist_details || {};
      const vaccineStock = vaccinationHistory.vaccine_stock || {};
      const vaccineDetails = vaccineStock.vaccinelist || {};
      const vaccineName = vaccineDetails.vac_name || vaccinationHistory?.vac_details?.vac_name;
      const doseNumber = vaccinationHistory.vachist_doseNo;
      const childDOB = extractDOBFromRecord(record.rawRecord);
      const isCurrentRecord = record.chhist_id === currentRecord?.chhist_id;

      if (vaccineName && doseNumber) {
        if (!vaccineGroups[vaccineName]) {
          vaccineGroups[vaccineName] = {};
        }

        const vaccinationDate = vaccinationHistory.created_at && isValid(new Date(vaccinationHistory.created_at)) ? format(new Date(vaccinationHistory.created_at), "MMM dd, yyyy") : "N/A";

        const ageAtVaccination = childDOB && record.rawCreatedAt ? `${calculateAgeFromDOB(childDOB, record.rawCreatedAt).ageString} mos` : "N/A";

        vaccineGroups[vaccineName][doseNumber] = {
          date: vaccinationDate,
          age: ageAtVaccination,
          isCurrentRecord
        };
      }
    });

  const vaccineNames = Object.keys(vaccineGroups).sort();

  return (
    <View className="bg-white rounded-lg border border-gray-200">
      <View className="border-b border-gray-200 p-3">
        <Text className="text-gray-900 font-semibold">Immunization Records</Text>
      </View>
      <View className="p-3">
        {vaccineNames.map((vaccineName) => {
          const doses = vaccineGroups[vaccineName];

          return (
            <View key={vaccineName} className="mb-4 pb-3 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
              <Text className="font-medium text-gray-900 mb-2">{vaccineName}</Text>
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">1st Dose</Text>
                  {doses[1] ? (
                    <View className={doses[1].isCurrentRecord ? "bg-blue-50 p-2 rounded" : ""}>
                      <Text className={`text-sm ${doses[1].isCurrentRecord ? "font-medium text-blue-700" : "text-gray-700"}`}>{doses[1].date}</Text>
                      <Text className="text-xs text-gray-500">({doses[1].age})</Text>
                    </View>
                  ) : (
                    <Text className="text-gray-400 text-sm">-</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">2nd Dose</Text>
                  {doses[2] ? (
                    <View className={doses[2].isCurrentRecord ? "bg-blue-50 p-2 rounded" : ""}>
                      <Text className={`text-sm ${doses[2].isCurrentRecord ? "font-medium text-blue-700" : "text-gray-700"}`}>{doses[2].date}</Text>
                      <Text className="text-xs text-gray-500">({doses[2].age})</Text>
                    </View>
                  ) : (
                    <Text className="text-gray-400 text-sm">-</Text>
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-gray-500 mb-1">3rd Dose</Text>
                  {doses[3] ? (
                    <View className={doses[3].isCurrentRecord ? "bg-blue-50 p-2 rounded" : ""}>
                      <Text className={`text-sm ${doses[3].isCurrentRecord ? "font-medium text-blue-700" : "text-gray-700"}`}>{doses[3].date}</Text>
                      <Text className="text-xs text-gray-500">({doses[3].age})</Text>
                    </View>
                  ) : (
                    <Text className="text-gray-400 text-sm">-</Text>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};