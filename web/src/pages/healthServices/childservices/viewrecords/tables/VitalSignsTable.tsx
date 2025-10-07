import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { format, isValid } from "date-fns";
import { calculateAgeFromDOB } from "@/helpers/ageCalculator"; // Import the helper

interface VitalSignsTableProps {
  fullHistoryData: any[];
  chhistId: string;
}

export const VitalSignsTable: React.FC<VitalSignsTableProps> = ({ fullHistoryData, chhistId }) => {
  // Helper function to extract DOB from the nested record structure
  const extractDOBFromRecord = (record: any): string => {
    return record?.chrec_details?.patrec_details?.pat_details?.personal_info?.per_dob || "";
  };

  return (
    <div className="border border-black mb-6">
      <Table className="border-collapse [&_tr:hover]:bg-inherit">
        <TableHeader>
          <TableRow className="hover:bg-inherit">
            <TableHead className="w-[100px] border-r border-b border-black text-black bg-white">Date</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Age</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Weight (kg)</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Height (cm)</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Temp (°C)</TableHead>
            <TableHead className="border-r border-b border-black text-black bg-white">Findings</TableHead>
            <TableHead className="border-b border-black text-black bg-white">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fullHistoryData.length === 0 ? (
            <TableRow className="hover:bg-inherit">
              <TableCell colSpan={7} className="text-center text-black py-4 border-b border-black">
                No vital signs records available.
              </TableCell>
            </TableRow>
          ) : (
            fullHistoryData
              .filter((record) => {
                const recordDate = new Date(record.created_at).getTime();
                const currentRecordDate = new Date(fullHistoryData.find((r) => r.chhist_id === chhistId)?.created_at || 0).getTime();
                return recordDate <= currentRecordDate;
              })
              .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
              .map((record, index, array) => {
                const isCurrentRecord = record.chhist_id === chhistId;
                const isLastRow = index === array.length - 1;
                const vitalSigns = record.child_health_vital_signs?.[0] || {};
                const bmDetails = vitalSigns.bm_details || {};
                const childDOB = extractDOBFromRecord(record); // Extract DOB

                // Get the latest note and follow-up details
                let latestNoteContent: string | null = null;
                let followUpDescription = "";
                let followUpDate = "";
                let followUpStatus = "";

                if (record.child_health_notes && record.child_health_notes.length > 0) {
                  const sortedNotes = [...record.child_health_notes].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                  latestNoteContent = sortedNotes[0].chn_notes || null;

                  if (sortedNotes[0].followv_details) {
                    followUpDescription = sortedNotes[0].followv_details.followv_description || "";
                    followUpDate = sortedNotes[0].followv_details.followv_date || "";
                    followUpStatus = sortedNotes[0].followv_details.followv_status || "";
                  }
                }

                return (
                  <TableRow key={record.chhist_id} className={`hover:bg-inherit ${isCurrentRecord ? "font-medium" : ""}`}>
                    <TableCell className={`border-r border-black text-black ${!isLastRow ? "border-b" : ""}`}>{record.created_at && isValid(new Date(record.created_at)) ? format(new Date(record.created_at), "MMM dd, yyyy") : "N/A"}</TableCell>
                    <TableCell className={`border-r border-black text-black ${!isLastRow ? "border-b" : ""}`}>
                      {/* Replace bmDetails.age with calculated age */}
                      {childDOB && record.created_at ? calculateAgeFromDOB(childDOB, record.created_at).ageString : "N/A"}
                    </TableCell>
                    <TableCell className={`border-r border-black text-black ${!isLastRow ? "border-b" : ""}`}>{bmDetails.weight || "N/A"}</TableCell>
                    <TableCell className={`border-r border-black text-black ${!isLastRow ? "border-b" : ""}`}>{bmDetails.height || "N/A"}</TableCell>
                    <TableCell className={`border-r border-black text-black ${!isLastRow ? "border-b" : ""}`}>{vitalSigns.temp || "N/A"}</TableCell>
                    <TableCell className={`border-r border-black w-[200px] max-w-[300px] text-xs text-black ${!isLastRow ? "border-b" : ""}`}>
                      {vitalSigns.find_details ? (
                        <>
                          {vitalSigns.find_details.subj_summary && (
                            <div className="flex flex-col gap-1">
                              <span>Subjective:</span>
                              <span className="pl-4">• {vitalSigns.find_details.subj_summary}</span>
                            </div>
                          )}

                          {vitalSigns.find_details.assessment_summary && (
                            <div className="flex flex-col gap-1 pt-2">
                              <span>Assessment/Diagnoses:</span>
                              <span className="pl-4">
                                {vitalSigns.find_details.assessment_summary.split(",").map((item: string, index: number) => (
                                  <span key={index}>
                                    • {item.trim()}
                                    <br />
                                  </span>
                                ))}
                              </span>
                            </div>
                          )}

                          {vitalSigns.find_details.obj_summary && (
                            <div className="pt-3">
                              <span className="font-medium">Objective</span>
                              <div className="pl-4">
                                {vitalSigns.find_details.obj_summary
                                  .split("-")
                                  .filter((item: string) => item.trim())
                                  .map((item: string, index: number) => (
                                    <div key={index}>• {item.trim()}</div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {vitalSigns.find_details.plantreatment_summary && (
                            <div className="pt-3">
                              <span className="font-medium">Plan Treatment</span>
                              <div className="pl-4">
                                {vitalSigns.find_details.plantreatment_summary
                                  .split(/[-,]/)
                                  .filter((item: string) => item.trim())
                                  .map((item: string, index: number) => (
                                    <div key={index}>• {item.trim()}</div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </>
                      ) : null}
                    </TableCell>
                    <TableCell className={`min-w-[200px] max-w-[300px] text-black ${!isLastRow ? "border-b border-black" : ""}`}>
                      <div>
                        {/* Main Note */}
                        {latestNoteContent ? <p className="text-sm mb-2">{latestNoteContent}</p> : <p className="text-gray-500 text-sm mb-2">No notes</p>}

                        {/* Follow-up Section */}
                        {(followUpDescription || followUpDate) && (
                          <div className="border-t border-black pt-2 mt-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-black">Follow-up:</span>
                                <span className="text-xs px-2 py-1 rounded text-black">{followUpStatus || "pending"}</span>
                            </div>

                            {followUpDescription && (
                              <p className="text-xs text-black break-words">
                                {followUpDescription.split("|").map((part, i) => (
                                  <span key={i}>
                                    {part.trim()}
                                    {i < followUpDescription.split("|").length - 1 && <br />}
                                  </span>
                                ))}
                              </p>
                            )}

                            {followUpDate && (
                              <p className="text-xs text-black mt-1">
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
