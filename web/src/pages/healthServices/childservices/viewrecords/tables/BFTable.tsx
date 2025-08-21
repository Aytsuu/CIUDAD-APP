import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table/table";
import { ChildHealthHistoryRecord } from "../types";
import { format, isValid } from "date-fns";

interface BFCheckTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}

export const BFCheckTable: React.FC<BFCheckTableProps> = ({
  fullHistoryData,
  // chhistId,
}) => {
  // Extract and flatten all BF checks with their created_at dates
  const allBfChecks = fullHistoryData
    .flatMap(record => 
      record.exclusive_bf_checks?.map(bfCheck => ({
        bfDate: bfCheck.ebf_date && isValid(new Date(bfCheck.ebf_date))
          ? format(new Date(bfCheck.ebf_date), "MMM dd, yyyy")
          : "Not recorded",
        createdAt: isValid(new Date(bfCheck.created_at))
          ? format(new Date(bfCheck.created_at), "MMM dd, yyyy")
          : "N/A"
      })) || []
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="border  overflow-hidden">
      <Table className="border-collapse [&_tr:hover]:bg-inherit"> {/* Add this hover override */}
      <TableBody>
          {/* Created At Dates Row */}
          <TableRow className="border-b hover:bg-inherit"> {/* Add hover:bg-inherit */}
            <TableCell className="font-medium bg-gray-100 border-r p-3 w-32">
              Created At
            </TableCell>
            {allBfChecks.length > 0 ? (
              allBfChecks.map((check, index) => (
                <TableCell 
                  key={`created-${index}`} 
                  className="border-r p-3 last:border-r-0"
                >
                  {check.createdAt}
                </TableCell>
              ))
            ) : (
              <TableCell 
                colSpan={1} 
                className="text-center text-gray-500 p-3 hover:bg-inherit" 
              >
                No BF checks available
              </TableCell>
            )}
          </TableRow>

          {/* BF Dates Row */}
          <TableRow>
            <TableCell className="font-medium bg-gray-100 border-r p-3 w-32">
              BF Dates
            </TableCell>
            {allBfChecks.length > 0 ? (
              allBfChecks.map((check, index) => (
                <TableCell 
                  key={`bfdate-${index}`} 
                  className="border-r p-3 last:border-r-0 hover:bg-inherit"
                >
                  {check.bfDate}
                </TableCell>
              ))
            ) : (
              <TableCell 
                colSpan={1} 
                className="text-center text-gray-500 p-3"
              >
                No BF dates recorded
              </TableCell>
            )}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};