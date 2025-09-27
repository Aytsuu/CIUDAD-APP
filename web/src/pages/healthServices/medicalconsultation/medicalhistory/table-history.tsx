// table-history.tsx
import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/history-table-col";
import { History, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button/button";
import { useConsultationHistory } from "../queries/fetchQueries";

export function ConsultationHistoryTable({
  patientId,
  currentConsultationId,

}: {
  patientId: string;
  currentConsultationId: number | undefined;
}) {

  let   pageSize = 3;
  const [currentPage, setCurrentPage] = useState(1);

  // Call the hook directly here
  const { data, isLoading } = useConsultationHistory(patientId, currentPage, pageSize);

  // Process the data with safe access
  const relevantHistory = useMemo(() => {
    if (!data?.results) return [];

    return data.results.map((history: any) => ({
      ...history,
      patrec: history.patrec,
      medrec_id: history.medrec_id,
      medrec_status: history.medrec_status,
      medrec_chief_complaint: history.medrec_chief_complaint,
      created_at: history.created_at,
      medrec_age: history.medrec_age,
      vital_signs: history.vital_signs || {},
      bmi_details: history.bmi_details || {},
      staff_details: history.staff_details || {},
      find_details: history.find_details || {}
    }));
  }, [data]);

  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const tableData = useMemo(() => {
    if (relevantHistory.length <= 0) return [];

    const tableRows = [
      { attribute: "Bhw Assigned", type: "bhw" },
      { attribute: "Chief Complaint", type: "data" },
      { attribute: "Blood Pressure", type: "data" },
      { attribute: "Temperature", type: "data" },
      { attribute: "Pulse Rate", type: "data" },
      { attribute: "Respiratory Rate", type: "data" },
      { attribute: "HT", type: "data" },
      { attribute: "WT", type: "data" },
      { attribute: "Subjective Summary", type: "data" },
      { attribute: "Objective Summary", type: "data" },
      { attribute: "Plan Treatment Summary", type: "data" },
      { attribute: "Diagnosis", type: "data" },
    ];

    return tableRows.map((row) => {
      const rowData: any = {
        attribute: row.attribute,
        type: row.type,
      };

      relevantHistory.forEach((record:any) => {
        const recordId = `record_${record.medrec_id}`;

        // Safe access with fallbacks
        if (row.attribute === "Date") {
          rowData[recordId] = format(
            new Date(record.created_at || Date.now()),
            "MMM d, yyyy"
          );
        } else if (row.attribute === "Chief Complaint") {
          rowData[recordId] = record.medrec_chief_complaint || "N/A";
        } else if (row.attribute === "Status") {
          rowData[recordId] = record.medrec_status || "N/A";
        } else if (row.attribute === "Blood Pressure") {
          const systolic = record.vital_signs?.vital_bp_systolic ?? "N/A";
          const diastolic = record.vital_signs?.vital_bp_diastolic ?? "N/A";
          rowData[recordId] = `${systolic}/${diastolic} mmHg`;
        } else if (row.attribute === "Temperature") {
          rowData[recordId] = `${record.vital_signs?.vital_temp ?? "N/A"} °C`;
        } else if (row.attribute === "Pulse Rate") {
          rowData[recordId] = `${record.vital_signs?.vital_pulse ?? "N/A"} bpm`;
        } else if (row.attribute === "Respiratory Rate") {
          rowData[recordId] = `${record.vital_signs?.vital_RR ?? "N/A"} per min`;
        } else if (row.attribute === "HT") {
          rowData[recordId] = record.bmi_details?.height ?? "N/A";
        } else if (row.attribute === "WT") {
          rowData[recordId] = record.bmi_details?.weight ?? "N/A";
        } else if (row.attribute === "Subjective Summary") {
          rowData[recordId] = record.find_details?.subj_summary || "N/A";
        } else if (row.attribute === "Objective Summary") {
          rowData[recordId] = record.find_details?.obj_summary || "N/A";
        } else if (row.attribute === "Plan Treatment Summary") {
          rowData[recordId] = record.find_details?.plantreatment_summary || "N/A";
        } else if (row.attribute === "Diagnosis") {
          rowData[recordId] = record.find_details?.assessment_summary || "N/A";
        } else if (row.attribute === "bhw") {
          const staff = record.staff_details?.rp?.per || {};
          rowData[recordId] = `${staff.per_fname || ""} ${staff.per_mname || ""} ${staff.per_lname || ""} ${staff.per_suffix || ""}`.trim() || "N/A";
        } else {
          rowData[recordId] = "N/A";
        }
      });

      return rowData;
    });
  }, [relevantHistory]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      {
        accessorKey: "attribute",
        header: "",
        cell: ({ row }) => {
          const rowType = row.original.type;
          return rowType === "heading" ? (
            <div className="font-semibold text-gray-900 text-sm sm:text-base w-[200px] min-w-[200px] max-w-[200px]">
              {row.getValue("attribute")}
            </div>
          ) : (
            <div className="font-medium text-gray-700 text-sm sm:text-base px-4">
              {row.getValue("attribute")}
            </div>
          );
        },
      },
    ];

    relevantHistory.forEach((record:any) => {
      const recordId = `record_${record.medrec_id}`;
      const isCurrent = record.medrec_id === currentConsultationId;

      cols.push({
        id: recordId,
        accessorKey: recordId,
        header: () => {
          return (
            <div className="text-black font-bold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm">
              {isCurrent ? (
                <span className="text-black font-bold px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm">
                  {format(new Date(record.created_at || Date.now()), "MMM d, yyyy")} (Current)
                </span>
              ) : (
                format(new Date(record.created_at || Date.now()), "MMM d, yyyy")
              )}
            </div>
          );
        },
        cell: ({ row }) => {
          const value = row.getValue(recordId) as string;
          const rowData = row.original;

          if (rowData.attribute === "Chief Complaint") {
            const formattedValue = value && value !== "N/A" 
              ? value.split(",").map((item) => item.trim()).filter(Boolean)
              : [];
            return (
              <div className="text-justify pr-4">
                {formattedValue.length > 0 ? (
                  <ul className="list-disc list-inside text-sm sm:text-base">
                    {formattedValue.map((item, index) => (
                      <li key={index} className="whitespace-normal break-words">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm sm:text-base break-words whitespace-normal">
                    N/A
                  </span>
                )}
              </div>
            );
          }

          if (rowData.attribute === "Objective Summary") {
            const formattedValue = value && value !== "N/A" 
              ? value.split("-").map((item) => item.trim()).filter(Boolean)
              : [];
            
            const grouped: { [key: string]: string[] } = {};
            
            formattedValue.forEach((item) => {
              const colonIndex = item.indexOf(':');
              if (colonIndex > -1) {
                const keyword = item.substring(0, colonIndex).trim();
                const itemValue = item.substring(colonIndex + 1).trim();
                if (!grouped[keyword]) {
                  grouped[keyword] = [];
                }
                grouped[keyword].push(itemValue);
              } else {
                if (!grouped['Other']) {
                  grouped['Other'] = [];
                }
                grouped['Other'].push(item);
              }
            });
            
            const groupedArray = Object.entries(grouped).map(([keyword, values]) => ({
              keyword,
              content: keyword !== 'Other' ? values.join(', ') : values.join(', '),
              hasKeyword: keyword !== 'Other'
            }));
            
            return (
              <div className="text-start">
                {groupedArray.length > 0 ? (
                  <ul className="list-disc list-inside text-sm sm:text-base">
                    {groupedArray.map((item, index) => (
                      <li key={index} className="whitespace-normal break-words">
                        {item.hasKeyword ? (
                          <>
                            <strong>{item.keyword}:</strong> {item.content}
                          </>
                        ) : (
                          item.content
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm sm:text-base break-words whitespace-normal">
                    N/A
                  </span>
                )}
              </div>
            );
          }

          if (rowData.attribute === "HT") {
            return (
              <div className="text-sm sm:text-base">
                {value && value !== "N/A" 
                  ? `${parseFloat(value).toFixed(2).endsWith(".00") ? parseInt(value) : value} cm`
                  : "N/A"}
              </div>
            );
          }

          if (rowData.attribute === "WT") {
            return (
              <div className="text-sm sm:text-base">
                {value && value !== "N/A" 
                  ? `${parseFloat(value).toFixed(2).endsWith(".00") ? parseInt(value) : value} kg`
                  : "N/A"}
              </div>
            );
          }

          if (rowData.attribute === "Diagnosis") {
            const formattedValue = value && value !== "N/A" 
              ? value.split(",").map((item) => item.trim()).filter(Boolean)
              : [];
            return (
              <div className="text-justify pr-4">
                {formattedValue.length > 0 ? (
                  <ul className="list-disc list-inside text-sm sm:text-base">
                    {formattedValue.map((item, index) => (
                      <li key={index} className="whitespace-normal break-words">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm sm:text-base break-words whitespace-normal">
                    N/A
                  </span>
                )}
              </div>
            );
          }

          if (rowData.attribute === "Plan Treatment Summary") {
            const formattedValue = value && value !== "N/A" 
              ? value.split(/[-,]/).map((item) => item.trim()).filter(Boolean)
              : [];
            return (
              <div className="text-justify pr-4">
                {formattedValue.length > 0 ? (
                  <ul className="list-disc list-inside text-sm sm:text-base">
                    {formattedValue.map((item, index) => (
                      <li key={index} className="whitespace-normal break-words">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-sm sm:text-base break-words whitespace-normal">
                    N/A
                  </span>
                )}
              </div>
            );
          }

          if (rowData.attribute === "bhw") {
            return (
              <div className="text-sm sm:text-base">
                {value || "N/A"}
              </div>
            );
          }

          return (
            <div className="text-sm sm:text-base min-w-[250px]">
              {value || "N/A"}
            </div>
          );
        },
      });
    });

    return cols;
  }, [relevantHistory, currentConsultationId]);

  // Pagination Controls Component
  const PaginationControls = () => {
    if (totalCount <= pageSize) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalCount);

    return (
      <div className="flex flex-col sm:flex-row items-center justify-between mt-6 p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2 sm:mb-0">
          Showing {startItem} to {endItem} of {totalCount} records
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-sm text-gray-600 mx-2">
            Page {currentPage} of {totalPages}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600">Loading consultation history...</p>
      </div>
    );
  }

  if (relevantHistory.length <= 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-gray-50">
        <div className="flex items-center justify-center mb-2">
          <History size={20} />
        </div>
        <p className="text-lg sm:text-lg text-gray-600">
          No consultation history found.
        </p>
      </div>
    );
  }

  return (
    <div>
      <DataTable
        columns={columns}
        data={tableData}
        pagination={false}
      />
      
      {/* Pagination Controls */}
      <PaginationControls />
    </div>
  );
}