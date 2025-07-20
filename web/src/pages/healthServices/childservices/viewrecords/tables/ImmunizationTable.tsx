import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table/table";
import { ChildHealthHistoryRecord } from "../types";
import { format, isValid } from "date-fns";

interface ImmunizationTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const ImmunizationTable: React.FC<ImmunizationTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  // Check if there are any immunization records
  const hasImmunizationRecords = fullHistoryData.some(
    (record) => record.immunization_tracking && record.immunization_tracking.length > 0
  );

  return (
    <div className="border overflow-hidden">
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader className="bg-gray-100">
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[100px] border-r">Date</TableHead>
            <TableHead className="border-r">Vaccine</TableHead>
            <TableHead className="border-r">Dose</TableHead>
            <TableHead className="border-r">Age Given</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!hasImmunizationRecords ? (
            <TableRow className="hover:bg-inherit">
              <TableCell
                colSpan={4}
                className="text-center text-gray-600 py-4 border-r hover:bg-inherit"
              >
                No vaccination records yet.
              </TableCell>
            </TableRow>
          ) : (
            fullHistoryData
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
                  fullHistoryData.find((r) => r.chhist_id === chhistId)
                    ?.created_at || 0
                ).getTime();
                return recordDate <= currentRecordDate;
              })
              .sort(
                (a, b) =>
                  new Date(a.record.created_at).getTime() -
                  new Date(b.record.created_at).getTime()
              )
              .map(({ record, tracking }) => {
                const isCurrentRecord = record.chhist_id === chhistId;
                const vaccinationHistory =
                  tracking.vacrec_details?.vaccination_histories?.[0] || {};
                const vaccineStock = vaccinationHistory.vaccine_stock || {};
                const vaccineDetails = vaccineStock.vaccinelist || {};

                return (
                  <TableRow
                    key={`${tracking.imt_id}-${
                      vaccinationHistory.vachist_id || ""
                    }`}
                    className={`hover:bg-inherit ${
                      isCurrentRecord ? "bg-blue-50 font-medium" : ""
                    }`}
                  >
                    <TableCell className="border-r">
                      {record.created_at && isValid(new Date(record.created_at))
                        ? format(new Date(record.created_at), "MMM dd, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {vaccineDetails.vac_name || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {vaccinationHistory.vachist_doseNo
                        ? `${vaccinationHistory.vachist_doseNo}${
                            ["th", "st", "nd", "rd"][
                              vaccinationHistory.vachist_doseNo % 10 > 3 ||
                              [11, 12, 13].includes(
                                vaccinationHistory.vachist_doseNo % 100
                              )
                                ? 0
                                : vaccinationHistory.vachist_doseNo % 10
                            ]
                          } dose`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {vaccinationHistory.vachist_age || "N/A"}
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