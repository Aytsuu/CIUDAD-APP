import { format } from "date-fns";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/table/history-table-col";
import { ClipboardList } from "lucide-react";
import { useMemo } from "react";

export type MedicalConsultationHistory = {
  patrec:number,
  medrec_id: number;
  medrec_status: string;
  medrec_chief_complaint: string;
  medrec_age: string;
  created_at: string;
  vital_signs: {
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_RR: string;
    vital_o2: string;
    vital_pulse: string;
  };
  bmi_details: {
    age: string;
    height: string;
    weight: string;
    bmi: string;
  };
  find_details: {
    diagnosis: string;
    treatment: string;
    notes: string;
  } | null;
};

export const medicalConsultationCache: Record<string, MedicalConsultationHistory[]> = {};

export function ConsultationHistoryTable({
  relevantHistory,
  currentConsultationId,
  currentPage,
  totalPages,
  onPaginate,
}: {
  relevantHistory: MedicalConsultationHistory[];
  currentConsultationId: number | undefined;
  currentPage: number;
  totalPages: number;
  onPaginate: (page: number) => void;
}) {
  const recordsPerPage = 3;
  
  const tableData = useMemo(() => {
    if (relevantHistory.length <= 0) return [];

    const tableRows = [
      { attribute: "Chief Complaint", type: "data" },
      { attribute: "Blood Pressure", type: "data" },
      { attribute: "Temperature", type: "data" },
      { attribute: "Pulse Rate", type: "data" },
      { attribute: "Respiratory Rate", type: "data" },
      { attribute: "BMI", type: "data" },
      { attribute: "Diagnosis", type: "data" },
    ];

    return tableRows.map((row) => {
      const rowData: any = {
        attribute: row.attribute,
        type: row.type,
      };

      relevantHistory.forEach((record) => {
        const recordId = `record_${record.medrec_id}`;

        if (row.attribute === "Date") {
          rowData[recordId] = format(
            new Date(record.created_at),
            "MMM d, yyyy"
          );
        } else if (row.attribute === "Chief Complaint") {
          rowData[recordId] = record.medrec_chief_complaint;
        } else if (row.attribute === "Status") {
          rowData[recordId] = record.medrec_status;
        } else if (row.attribute === "Blood Pressure") {
          rowData[
            recordId
          ] = `${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} mmHg`;
        } else if (row.attribute === "Temperature") {
          rowData[recordId] = `${record.vital_signs.vital_temp} °C`;
        } else if (row.attribute === "Pulse Rate") {
          rowData[recordId] = `${record.vital_signs.vital_pulse} bpm`;
        } else if (row.attribute === "Respiratory Rate") {
          rowData[recordId] = `${record.vital_signs.vital_RR} per min`;
        } else if (row.attribute === "BMI") {
          rowData[recordId] = record.bmi_details.bmi;
        } else if (row.attribute === "Diagnosis") {
          rowData[recordId] = record.find_details?.diagnosis || "N/A";
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

    relevantHistory
      .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
      .forEach((record) => {
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
                    Current
                  </span>
                ) : (
                  format(new Date(record.created_at), "MMM d, yyyy")
                )}
              </div>
            );
          },
          cell: ({ row }) => {
            const value = row.getValue(recordId) as string;
            const rowData = row.original;

            if (rowData.attribute === "Chief Complaint") {
              const formattedValue = value
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

            return <div className="text-sm sm:text-base  min-w-[250px]">{value || "N/A"}</div>;
          },
        });
      });

    return cols;
  }, [relevantHistory, currentPage, currentConsultationId]);

  if (relevantHistory.length <= 1) {
    return (
      <div className="text-center p-4 sm:p-6 md:p-8 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200 sm:border-gray-300">
        <ClipboardList className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 text-gray-400 mx-auto mb-2 sm:mb-3 md:mb-4" />
        <p className="text-lg sm:text-xl text-gray-600 font-medium">
          No previous consultation history found.
        </p>
      </div>
    );
  }

  return (
    <DataTable 
      columns={columns} 
      data={tableData}
      pagination={true}
      manualPagination={{
        currentPage,
        totalPages,
        onPageChange: onPaginate
      }}
    />
  );
}