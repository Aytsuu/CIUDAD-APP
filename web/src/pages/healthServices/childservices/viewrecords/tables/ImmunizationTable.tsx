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
  return (
    <div className="border border-black mb-6">
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader>
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[100px] border-r border-b border-black text-black bg-white">Date</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Vaccine</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Dose</TableHead>
            <TableHead className="border-b border-black text-black bg-white">Age Given</TableHead>
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
              .map(({ record, tracking }, index, array) => {
                const isCurrentRecord = record.chhist_id === chhistId;
                const isLastRow = index === array.length - 1;
                const vaccinationHistory = tracking.vachist_details || {};
                const vaccineStock = vaccinationHistory.vaccine_stock || {};
                const vaccineDetails = vaccineStock.vaccinelist || {};
                const childDOB = extractDOBFromRecord(record); // Extract DOB

                // Format dose number with suffix
                const doseNumber = vaccinationHistory.vachist_doseNo;
                const doseSuffix = doseNumber === 1 ? "1st dose" : doseNumber === 2 ? "2nd dose" : doseNumber === 3 ? "3rd dose" : `${doseNumber}th dose`;

                return (
                  <TableRow key={`${tracking.imt_id}-${vaccinationHistory.vachist_id || ""}`} className={`hover:bg-inherit ${isCurrentRecord ? "font-medium" : ""}`}>
                    <TableCell className={`border-r border-black ${!isLastRow ? "border-b" : ""}`}>{vaccinationHistory.created_at && isValid(new Date(vaccinationHistory.created_at)) ? format(new Date(vaccinationHistory.created_at), "MMM dd, yyyy") : "N/A"}</TableCell>
                    <TableCell className={`border-r border-black ${!isLastRow ? "border-b" : ""}`}>{vaccineDetails.vac_name || vaccinationHistory?.vac_details?.vac_name}</TableCell>
                    <TableCell className={`border-r border-black ${!isLastRow ? "border-b" : ""}`}>{doseSuffix}</TableCell>
                    <TableCell className={`${!isLastRow ? "border-b border-black" : ""}`}>{childDOB && record.created_at ? `${calculateAgeFromDOB(childDOB, record.created_at).ageString} months` : "N/A"}</TableCell>
                  </TableRow>
                );
              })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
