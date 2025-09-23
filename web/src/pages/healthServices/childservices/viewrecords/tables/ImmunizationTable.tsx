import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { format, isValid } from "date-fns";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator";

interface ImmunizationTableProps {
  fullHistoryData: any[];
  chhistId: string;
}

export const ImmunizationTable: React.FC<ImmunizationTableProps> = ({ fullHistoryData, chhistId }) => {
  // Check if there are any immunization records
  const hasImmunizationRecords = fullHistoryData.some((record) => record.immunization_tracking && record.immunization_tracking.length > 0);
  
  const extractDOBFromRecord = (record: any): string => {
    return record?.chrec_details?.patrec_details?.pat_details?.personal_info?.per_dob || "";
  };

  // Group immunizations by vaccine name and organize by dose
  const groupVaccinesByName = () => {
    const vaccineGroups: { [vaccineName: string]: { [dose: number]: { date: string; age: string; isCurrentRecord: boolean } } } = {};

    fullHistoryData
      .flatMap(
        (record) =>
          record.immunization_tracking?.map((tracking: any) => ({
            record,
            tracking
          })) || []
      )
      .filter(({ record }) => {
        const recordDate = new Date(record.created_at).getTime();
        const currentRecordDate = new Date(fullHistoryData.find((r) => r.chhist_id === chhistId)?.created_at || 0).getTime();
        return recordDate <= currentRecordDate;
      })
      .sort((a, b) => new Date(a.record.created_at).getTime() - new Date(b.record.created_at).getTime())
      .forEach(({ record, tracking }) => {
        const vaccinationHistory = tracking.vachist_details || {};
        const vaccineStock = vaccinationHistory.vaccine_stock || {};
        const vaccineDetails = vaccineStock.vaccinelist || {};
        const vaccineName = vaccineDetails.vac_name || vaccinationHistory?.vac_details?.vac_name;
        const doseNumber = vaccinationHistory.vachist_doseNo;
        const childDOB = extractDOBFromRecord(record);
        const isCurrentRecord = record.chhist_id === chhistId;

        if (vaccineName && doseNumber) {
          if (!vaccineGroups[vaccineName]) {
            vaccineGroups[vaccineName] = {};
          }

          const vaccinationDate = vaccinationHistory.created_at && isValid(new Date(vaccinationHistory.created_at)) 
            ? format(new Date(vaccinationHistory.created_at), "MMM dd, yyyy") 
            : "N/A";

          const ageAtVaccination = childDOB && record.created_at 
            ? `${calculateAgeFromDOB(childDOB, record.created_at).ageString} mos` 
            : "N/A";

          vaccineGroups[vaccineName][doseNumber] = {
            date: vaccinationDate,
            age: ageAtVaccination,
            isCurrentRecord
          };
        }
      });

    return vaccineGroups;
  };

  const vaccineGroups = groupVaccinesByName();
  const vaccineNames = Object.keys(vaccineGroups).sort();

  return (
    <div className="border border-black mb-6">
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader>
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[150px] border-r border-b border-black text-black bg-white">Vaccine Name</TableHead>
            <TableHead className="w-[120px] border-r border-b border-black text-black bg-white text-center">1st Dose</TableHead>
            <TableHead className="w-[120px] border-r border-b border-black text-black bg-white text-center">2nd Dose</TableHead>
            <TableHead className="w-[120px] border-b border-black text-black bg-white text-center">3rd Dose</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!hasImmunizationRecords ? (
            <TableRow className="hover:bg-inherit">
              <TableCell colSpan={4} className="text-center text-gray-600 py-4 border-b border-black">
                No vaccination records yet.
              </TableCell>
            </TableRow>
          ) : (
            vaccineNames.map((vaccineName, index) => {
              const isLastRow = index === vaccineNames.length - 1;
              const doses = vaccineGroups[vaccineName];
              
              return (
                <TableRow key={vaccineName} className="hover:bg-inherit">
                  <TableCell className={`border-r border-black font-medium ${!isLastRow ? "border-b" : ""}`}>
                    {vaccineName}
                  </TableCell>
                  <TableCell className={`border-r border-black text-center ${!isLastRow ? "border-b" : ""}`}>
                    {doses[1] ? (
                      <div className={doses[1].isCurrentRecord ? "font-medium" : ""}>
                        <div className="text-sm">{doses[1].date}</div>
                        <div className="text-xs text-gray-600">({doses[1].age})</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className={`border-r border-black text-center ${!isLastRow ? "border-b" : ""}`}>
                    {doses[2] ? (
                      <div className={doses[2].isCurrentRecord ? "font-medium" : ""}>
                        <div className="text-sm">{doses[2].date}</div>
                        <div className="text-xs text-gray-600">({doses[2].age})</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className={`text-center ${!isLastRow ? "border-b border-black" : ""}`}>
                    {doses[3] ? (
                      <div className={doses[3].isCurrentRecord ? "font-medium" : ""}>
                        <div className="text-sm">{doses[3].date}</div>
                        <div className="text-xs text-gray-600">({doses[3].age})</div>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};