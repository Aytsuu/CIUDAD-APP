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

interface NutritionStatusTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}
export const NutrionaStatusTable: React.FC<NutritionStatusTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  return (
    <div className="border overflow-hidden mb-6 ">
      <div className="font-semibold bg-gray-100 p-2 border-b">
        OPT Tracking
      </div>
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader className="bg-gray-100">
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[100px] border-r">Date</TableHead>
            <TableHead className="border-r">Age</TableHead>
            <TableHead className="border-r">Weight (kg)</TableHead>
            <TableHead className="border-r">Height (cm)</TableHead>
            <TableHead className="border-r">WFA</TableHead>
            <TableHead className="border-r">LHFA</TableHead>
            <TableHead className="border-r">WFL</TableHead>
            <TableHead className="border-r">MUAC</TableHead>
            <TableHead className="border-r">MUAC Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fullHistoryData.length === 0 ? (
            <TableRow className="hover:bg-inherit">
              <TableCell
                colSpan={10}
                className="text-center text-gray-600 py-4 border-r hover:bg-inherit"
              >
                No vital signs records available.
              </TableCell>
            </TableRow>
          ) : (
            fullHistoryData
              .filter((record) => {
                const recordDate = new Date(record.created_at).getTime();
                const currentRecordDate = new Date(
                  fullHistoryData.find((r) => r.chhist_id === chhistId)
                    ?.created_at || 0
                ).getTime();
                return recordDate <= currentRecordDate;
              })
              .sort(
                (a, b) =>
                  new Date(a.created_at).getTime() -
                  new Date(b.created_at).getTime()
              )
              .map((record) => {
                const isCurrentRecord = record.chhist_id === chhistId;
                const vitalSigns = record.child_health_vital_signs?.[0] || {};
                const bmDetails = vitalSigns.bm_details || {};
                const nutritionStatus = record.nutrition_statuses?.[0] || {};

                return (
                  <TableRow
                    key={record.chhist_id}
                    className={`hover:bg-inherit ${
                      isCurrentRecord ? "font-medium" : ""
                    }`}
                  >
                    <TableCell className="border-r">
                      {record.created_at && isValid(new Date(record.created_at))
                        ? format(new Date(record.created_at), "MMM dd, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {bmDetails.age || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {bmDetails.weight || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {bmDetails.height || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {nutritionStatus.wfa || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {nutritionStatus.lhfa || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {nutritionStatus.wfl || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {nutritionStatus.muac || "N/A"}
                    </TableCell>
                    <TableCell className="border-r">
                      {nutritionStatus.muac_status || "N/A"}
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
