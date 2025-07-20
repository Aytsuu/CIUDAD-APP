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

interface VitalSignsTableProps {
  fullHistoryData: ChildHealthHistoryRecord[];
  chhistId: string;
}
export const VitalSignsTable: React.FC<VitalSignsTableProps> = ({
  fullHistoryData,
  chhistId,
}) => {
  return (
    <div className="border  overflow-hidden">
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader className="bg-gray-100">
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[100px] border-r">Date</TableHead>
            <TableHead className="border-r">Age</TableHead>
            <TableHead className="border-r">Weight (kg)</TableHead>
            <TableHead className="border-r">Height (cm)</TableHead>
            <TableHead className="border-r">Temp (°C)</TableHead>
            <TableHead className="border-r">WFA</TableHead>
            <TableHead className="border-r">LHFA</TableHead>
            <TableHead className="border-r">WFL</TableHead>
            <TableHead className="border-r">MUAC</TableHead>
            <TableHead className="border-r">Notes</TableHead>
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
                  new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
              .map((record) => {
                const isCurrentRecord = record.chhist_id === chhistId;
                const vitalSigns = record.child_health_vital_signs?.[0] || {};
                const bmDetails = vitalSigns.bm_details || {};
                const nutritionStatus = record.nutrition_statuses?.[0] || {};
                
                // Get the latest note and follow-up details
                let latestNoteContent: string | null = null;
                let followUpDescription = "";
                let followUpDate = "";
                let followUpStatus = "";

                if (record.child_health_notes && record.child_health_notes.length > 0) {
                  const sortedNotes = [...record.child_health_notes].sort(
                    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                  );
                  latestNoteContent = sortedNotes[0].chn_notes || null;
                  
                  if (sortedNotes[0].followv_details) {
                    followUpDescription = sortedNotes[0].followv_details.followv_description || "";
                    followUpDate = sortedNotes[0].followv_details.followv_date || "";
                    followUpStatus = sortedNotes[0].followv_details.followv_status || "";
                  }
                }

                return (
                  <TableRow
                    key={record.chhist_id}
                    className={`hover:bg-inherit ${isCurrentRecord ? "font-medium" : ""}`}
                  >
                    <TableCell className="border-r">
                      {record.created_at && isValid(new Date(record.created_at))
                        ? format(new Date(record.created_at), "MMM dd, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="border-r">{bmDetails.age || "N/A"}</TableCell>
                    <TableCell className="border-r">{bmDetails.weight || "N/A"}</TableCell>
                    <TableCell className="border-r">{bmDetails.height || "N/A"}</TableCell>
                    <TableCell className="border-r">{vitalSigns.temp || "N/A"}</TableCell>
                    <TableCell className="border-r">{nutritionStatus.wfa || "N/A"}</TableCell>
                    <TableCell className="border-r">{nutritionStatus.lhfa || "N/A"}</TableCell>
                    <TableCell className="border-r">{nutritionStatus.wfl || "N/A"}</TableCell>
                    <TableCell className="border-r">{nutritionStatus.muac || "N/A"}</TableCell>
                    <TableCell className="min-w-[200px] max-w-[300px] border-r hover:bg-inherit">
                      <div>
                        {/* Main Note */}
                        {latestNoteContent ? (
                          <p className="text-sm mb-2">{latestNoteContent}</p>
                        ) : (
                          <p className="text-gray-500 text-sm mb-2">No notes</p>
                        )}

                        {/* Follow-up Section */}
                        {(followUpDescription || followUpDate) && (
                          <div className="border-t pt-2 mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-600">Follow-up:</span>
                              <span 
                                className={`text-xs px-2 py-1 rounded ${
                                  followUpStatus === 'completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : followUpStatus === 'missed' 
                                      ? 'bg-red-100 text-red-800' 
                                      : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {followUpStatus || 'pending'}
                              </span>
                            </div>
                            
                            {followUpDescription && (
                              <p className="text-xs text-gray-600 break-words">
                                {followUpDescription.split('|').map((part, i) => (
                                  <span key={i}>
                                    {part.trim()}
                                    {i < followUpDescription.split('|').length - 1 && <br />}
                                  </span>
                                ))}
                              </p>
                            )}
                            
                            {followUpDate && (
                              <p className="text-xs text-gray-600 mt-1">
                                <span className="font-medium">Date:</span> {followUpDate}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
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