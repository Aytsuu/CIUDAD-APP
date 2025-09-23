import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { ChildHealthHistoryRecord } from '../types';
import { format, isValid } from 'date-fns';

interface ImmunizationTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
  patientData?: any;
}

export const ImmunizationTable: React.FC<ImmunizationTableProps> = ({
  fullHistoryData,
  chhistId,
  patientData,
}) => {
  // Prepare immunization data
  const immunizationData = fullHistoryData
    .flatMap(
      (record) =>
        record.immunization_tracking?.map((tracking) => ({
          record,
          tracking,
        })) || []
    )
    .filter(({ record }) => {
      const recordDate = new Date(record.created_at).getTime();
      const currentRecordDate = new Date(
        fullHistoryData.find((r) => String(r.chhist_id) === String(chhistId))?.created_at || 0
      ).getTime();
      return recordDate <= currentRecordDate;
    })
    .sort(
      (a, b) =>
        new Date(a.record.created_at).getTime() -
        new Date(b.record.created_at).getTime()
    )
    .map(({ record, tracking }) => {
      const isCurrentRecord = String(record.chhist_id) === String(chhistId);
      const vaccinationHistory = tracking.vachist_details || {};
      const vaccineStock = vaccinationHistory.vaccine_stock || {};
      const vaccineDetails = vaccineStock.vaccinelist || {};
      const doseNumber = vaccinationHistory.vachist_doseNo;
      const doseSuffix =
        doseNumber === 1
          ? '1st dose'
          : doseNumber === 2
          ? '2nd dose'
          : doseNumber === 3
          ? '3rd dose'
          : `${doseNumber}th dose`;
      return {
        id: `${tracking.imt_id}-${vaccinationHistory.vachist_id || ''}`,
        date: vaccinationHistory.created_at && isValid(new Date(vaccinationHistory.created_at))
          ? format(new Date(vaccinationHistory.created_at), 'MMM dd, yyyy')
          : 'N/A',
        vaccine: vaccineDetails.vac_name || vaccinationHistory?.vac_details?.vac_name || 'Unknown',
        dose: doseSuffix,
        ageGiven: vaccinationHistory.vachist_age || 'N/A',
        isCurrentRecord,
      };
    });

  // // Add fallback if no immunizations
  // const vaccineStat = patientData?.originalRecord?.vaccineStat ||
  //                    fullHistoryData.find(r => String(r.chhist_id) === String(chhistId))?.vaccineStat ||
  //                    'N/A';
  
  // if (immunizationData.length === 0 && vaccineStat !== 'N/A') {
  //   immunizationData.push({
  //     id: 'fallback-vaccineStat',
  //     date: 'N/A',
  //     vaccine: vaccineStat,
  //     dose: 'N/A',
  //     ageGiven: 'N/A',
  //     isCurrentRecord: true,
  //   });
  // }

  return (
    <View className="bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
    
      
      {immunizationData.length > 0 ? (
        <View className="divide-y divide-gray-100">
          {/* Header Row */}
          <View className="flex-row bg-gray-50 px-3 py-2">
            <Text className="flex-1 text-xs font-medium text-gray-500">Date</Text>
            <Text className="flex-1 text-xs font-medium text-gray-500">Vaccine</Text>
            <Text className="flex-1 text-xs font-medium text-gray-500">Dose</Text>
            <Text className="flex-1 text-xs font-medium text-gray-500">Age Given</Text>
          </View>
          
          {/* Data Rows */}
          {immunizationData.map((immunization) => (
            <View 
              key={immunization.id} 
              className={`flex-row px-3 py-2 ${immunization.isCurrentRecord ? 'bg-blue-50' : ''}`}
            >
              <Text className="flex-1 text-sm text-gray-800">{immunization.date}</Text>
              <Text className="flex-1 text-sm text-gray-800">{immunization.vaccine}</Text>
              <Text className="flex-1 text-sm text-gray-800">{immunization.dose}</Text>
              <Text className="flex-1 text-sm text-gray-800">{immunization.ageGiven}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View className="p-4 items-center">
          <Text className="text-gray-500">No vaccination records available</Text>
        </View>
      )}
    </View>
  );
};