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

interface SupplementStatusTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const SupplementStatusTable: React.FC<SupplementStatusTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  return (
    <div className="border overflow-hidden mb-6">
      <div className="font-semibold bg-gray-100 p-2 border-b">
        Health Monitoring
      </div>
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader className="bg-gray-50">
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[120px] border-r">Date Seen</TableHead>
            <TableHead className="border-r">Anemic/BirthWt</TableHead>
            <TableHead className="border-r">Birth Weight</TableHead>
            <TableHead className="border-r">Iron Given</TableHead>
            <TableHead className="border-r">Date Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fullHistoryData.length === 0 ? (
            <TableRow className="hover:bg-inherit">
              <TableCell
                colSpan={6}
                className="text-center text-gray-600 py-4 border-r hover:bg-inherit"
              >
                No supplement status records available.
              </TableCell>
            </TableRow>
          ) : (
            fullHistoryData
              .flatMap(
                (record) =>
                  record.supplements_statuses?.map((status) => ({
                    record,
                    status,
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
                  new Date(a.status.date_seen).getTime() -
                  new Date(b.status.date_seen).getTime()
              )
              .map(({ record, status }, index) => {
                const isCurrentRecord = record.chhist_id === chhistId;
                const supplement = record.child_health_supplements?.find(
                  (s) => s.chsupplement_id === status.chsupplement
                );

                return (
                  <TableRow
                    key={`${status.chssupplementstat_id}-${index}`}
                    className={`hover:bg-inherit ${
                      isCurrentRecord ? "bg-blue-50 font-medium" : ""
                    }`}
                  >
                    <TableCell className="border-r">
                      {status.date_seen && isValid(new Date(status.date_seen))
                        ? format(new Date(status.date_seen), "MMM dd, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          status.status_type === "completed"
                            ? "bg-green-100 text-green-800"
                            : status.status_type === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {status.status_type || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="border-r">
                      {status.birthwt
                        ? status.birthwt.toString().endsWith(".00")
                          ? `${status.birthwt.toString().slice(0, -3)} kg`
                          : `${status.birthwt} kg`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {status.date_given_iron &&
                      isValid(new Date(status.date_given_iron))
                        ? format(
                            new Date(status.date_given_iron),
                            "MMM dd, yyyy"
                          )
                        : "Not given"}
                    </TableCell>
                    <TableCell className="border-r">
                      {status.date_completed &&
                      isValid(new Date(status.date_completed))
                        ? format(
                            new Date(status.date_completed),
                            "MMM dd, yyyy"
                          )
                        : ""}
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
