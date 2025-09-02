import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table/table";
import { ChildHealthHistoryRecord } from "../types";
import { format, isValid, isBefore, isSameDay } from "date-fns";

interface BFCheckTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const BFCheckTable: React.FC<BFCheckTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  // Find the current record and its date
  const currentRecord = fullHistoryData.find(record => record.chhist_id === chhistId);
  
  if (!currentRecord) {
    return (
      <div className="border overflow-hidden">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="text-center text-gray-500 p-3">
                No record found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  const currentRecordDate = new Date(currentRecord.created_at);

  // Extract and filter BF checks - only from current and previous records
  const filteredBfChecks = fullHistoryData
    .flatMap(record => {
      const recordDate = new Date(record.created_at);
      
      // Only include records that are on or before the current record date
      if (isBefore(recordDate, currentRecordDate) || isSameDay(recordDate, currentRecordDate)) {
        return record.exclusive_bf_checks?.map(bfCheck => ({
          recordDate,
          bfCheck,
          bfDate: bfCheck.ebf_date && isValid(new Date(bfCheck.ebf_date))
            ? format(new Date(bfCheck.ebf_date), "MMM dd, yyyy")
            : "Not recorded",
          createdAt: isValid(new Date(bfCheck.created_at))
            ? format(new Date(bfCheck.created_at), "MMM dd, yyyy")
            : "N/A",
          isCurrentRecord: record.chhist_id === chhistId
        })) || [];
      }
      return [];
    })
    .sort((a, b) => a.recordDate.getTime() - b.recordDate.getTime());

  return (
    <div className="border overflow-hidden">
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableBody>
          {/* Created At Dates Row */}
          <TableRow className="border-b hover:bg-inherit">
            <TableCell className="font-medium bg-gray-100 border-r p-3 w-32">
              Created At
            </TableCell>
            {filteredBfChecks.length > 0 ? (
              filteredBfChecks.map((check, index) => (
                <TableCell 
                  key={`created-${index}`} 
                  className={`border-r p-3 last:border-r-0 ${
                    check.isCurrentRecord ? " font-medium" : ""
                  }`}
                >
                  {check.createdAt}
                </TableCell>
              ))
            ) : (
              <TableCell colSpan={1} className="text-center text-gray-500 p-3">
                No BF checks available
              </TableCell>
            )}
          </TableRow>

          {/* BF Dates Row */}
          <TableRow>
            <TableCell className="font-medium bg-gray-100 border-r p-3 w-32">
              BF Dates
            </TableCell>
            {filteredBfChecks.length > 0 ? (
              filteredBfChecks.map((check, index) => (
                <TableCell 
                  key={`bfdate-${index}`} 
                  className={`border-r p-3 last:border-r-0 hover:bg-inherit ${
                    check.isCurrentRecord ? " font-medium" : ""
                  }`}
                >
                  {check.bfDate}
                </TableCell>
              ))
            ) : (
              <TableCell colSpan={1} className="text-center text-gray-500 p-3">
                No BF dates recorded
              </TableCell>
            )}
          </TableRow>

        
        </TableBody>
      </Table>
    </div>
  );
};