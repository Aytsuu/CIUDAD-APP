import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { format, isValid } from "date-fns";

interface SupplementStatusTableProps {
  fullHistoryData: any[];
  chhistId: string;
}

export const SupplementStatusTable: React.FC<SupplementStatusTableProps> = ({ fullHistoryData, chhistId }) => {
  // Check if there are any supplement status records
  const hasSupplementRecords = fullHistoryData.some((record) => record.supplements_statuses && record.supplements_statuses.length > 0);

  return (
    <div className="border border-black mb-6">
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader>
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[120px] border-r border-b border-black text-black bg-white">Date Seen</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Anemic/BirthWt</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Birth Weight</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Iron Given</TableHead>
            <TableHead className="border-b border-black text-black bg-white">Date Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!hasSupplementRecords ? (
            <TableRow className="hover:bg-inherit">
              <TableCell colSpan={5} className="text-center text-gray-600 py-4 border-b border-black">
                No supplement given.
              </TableCell>
            </TableRow>
          ) : (
            fullHistoryData
              .flatMap(
                (record) =>
                  record.supplements_statuses?.map((status: any) => ({
                    record,
                    status
                  })) || []
              )
              .filter(({ record }) => {
                const recordDate = new Date(record.created_at).getTime();
                const currentRecordDate = new Date(fullHistoryData.find((r) => r.chhist_id === chhistId)?.created_at || 0).getTime();
                return recordDate <= currentRecordDate;
              })
              .sort((a, b) => new Date(a.status.date_seen).getTime() - new Date(b.status.date_seen).getTime())
              .map(({ record, status }, index, array) => {
                const isCurrentRecord = record.chhist_id === chhistId;
                const isLastRow = index === array.length - 1;

                return (
                  <TableRow key={`${status.chssupplementstat_id}-${index}`} className={`hover:bg-inherit ${isCurrentRecord ? "font-medium" : ""}`}>
                    <TableCell className={`border-r border-black ${!isLastRow ? "border-b" : ""}`}>{status.date_seen && isValid(new Date(status.date_seen)) ? format(new Date(status.date_seen), "MMM dd, yyyy") : "N/A"}</TableCell>
                    <TableCell className={`border-r border-black ${!isLastRow ? "border-b" : ""}`}>
                      <span className={`px-2 py-1 rounded text-xs ${status.status_type === "completed" ? "bg-green-100 text-green-800" : status.status_type === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"}`}>{status.status_type || "N/A"}</span>
                    </TableCell>
                    <TableCell className={`border-r border-black ${!isLastRow ? "border-b" : ""}`}>{status.birthwt ? (status.birthwt.toString().endsWith(".00") ? `${status.birthwt.toString().slice(0, -3)} kg` : `${status.birthwt} kg`) : "N/A"}</TableCell>
                    <TableCell className={`border-r border-black ${!isLastRow ? "border-b" : ""}`}>{status.date_given_iron && isValid(new Date(status.date_given_iron)) ? format(new Date(status.date_given_iron), "MMM dd, yyyy") : "Not given"}</TableCell>
                    <TableCell className={`${!isLastRow ? "border-b border-black" : ""}`}>{status.date_completed && isValid(new Date(status.date_completed)) ? format(new Date(status.date_completed), "MMM dd, yyyy") : ""}</TableCell>
                  </TableRow>
                );
              })
          )}
        </TableBody>
      </Table>
    </div>
  );
};
