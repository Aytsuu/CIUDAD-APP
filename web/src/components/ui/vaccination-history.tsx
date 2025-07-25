import { Activity } from "lucide-react";
import { format } from "date-fns";
import { useMemo, useCallback, useState } from "react";
import { DataTable } from "@/components/ui/table/history-table-col";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { VaccinationRecord } from "@/pages/healthServices/vaccination/tables/columns/types";



export type VaccinationHistory = {
  vachist_id: string;
  vachist_doseNo: number;
  vachist_status: string;
  created_at: string;
  vaccine_name: string;
  vital_signs: {
    vital_bp_systolic: string;
    vital_bp_diastolic: string;
    vital_temp: string;
    vital_RR: string;
    vital_o2: string;
    vital_pulse: string;
  };
  vaccine_details: {
    no_of_doses: number;
  };
  follow_up_visit: {
    followv_id: number;
    followv_date: string;
    followv_status: string;
  } | null;
  vachist_age: string;
  vacrec_id: number;
};

type VaccinationHistoryProps = {
  relevantHistory: VaccinationRecord[];
  currentVaccinationId?: string;
  loading?: boolean;
  error?: string | null;
};

export function VaccinationHistoryRecord({
  relevantHistory,
  currentVaccinationId,
  loading = false,
  error = null,
}: VaccinationHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 4;

  const hasHistory = useMemo(() => {
    return relevantHistory.length > 0;
  }, [relevantHistory]);

  const tableData = useMemo(() => {
    if (!hasHistory) return [];

    const tableRows = [
      { attribute: "Date", type: "heading" },
      { attribute: "Vaccine Name", type: "data" },
      { attribute: "Dose", type: "data" },
      { attribute: "Status", type: "data" },
      { attribute: "Age at Vaccination", type: "data" },
      { attribute: "Blood Pressure", type: "data" },
      { attribute: "Temperature", type: "data" },
      { attribute: "Pulse Rate", type: "data" },
      { attribute: "Oxygen Saturation", type: "data" },
    ];

    return tableRows.map((row) => {
      const rowData: any = {
        attribute: row.attribute,
        type: row.type,
      };

      relevantHistory.forEach((record) => {
        const recordId = `record_${record.vachist_id}`;

        if (row.attribute === "Date") {
          rowData[recordId] = format(
            new Date(record.created_at ),
            "MMM d, yyyy"
          );
        } else if (row.attribute === "Vaccine Name") {
          rowData[recordId] = record.vaccine_name;
        } else if (row.attribute === "Dose") {
          rowData[recordId] =
            Number(record.vachist_doseNo) === 1
              ? "1st Dose"
              : Number(record.vachist_doseNo) === 2
              ? "2nd Dose"
              : Number(record.vachist_doseNo) === 3
              ? "3rd Dose"
              : `${record.vachist_doseNo}th Dose`;
        } else if (row.attribute === "Status") {
          rowData[recordId] = record.vachist_status;
        } else if (row.attribute === "Age at Vaccination") {
          rowData[recordId] = record.vachist_age;
        } else if (row.attribute === "Blood Pressure") {
          rowData[
            recordId
          ] = `${record.vital_signs.vital_bp_systolic}/${record.vital_signs.vital_bp_diastolic} mmHg`;
        } else if (row.attribute === "Temperature") {
          rowData[recordId] = `${record.vital_signs.vital_temp} °C`;
        } else if (row.attribute === "Pulse Rate") {
          rowData[recordId] = record.vital_signs.vital_pulse;
        } else if (row.attribute === "Oxygen Saturation") {
          rowData[recordId] = `${record.vital_signs.vital_o2}%`;
        }
      });

      return rowData;
    });
  }, [relevantHistory, hasHistory]);

  const columns = useMemo<ColumnDef<any>[]>(() => {
    const cols: ColumnDef<any>[] = [
      {
        accessorKey: "attribute",
        header: "",
        cell: ({ row }) => {
          const rowType = row.original.type;
          return rowType === "heading" ? (
            <div className="font-semibold text-gray-900 text-base">
              {row.getValue("attribute")}
            </div>
          ) : (
            <div className="font-medium text-gray-700 text-base">
              {row.getValue("attribute")}
            </div>
          );
        },
      },
    ];

    relevantHistory
      .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
      .forEach((record) => {
        const recordId = `record_${record.vachist_id}`;
        const isCurrent = record.vachist_id === currentVaccinationId;

        cols.push({
          id: recordId,
          accessorKey: recordId,
          header: () => {
            return (
              <div className=" text-black font-bold px-3 py-2 rounded-lg text-sm ">
                {isCurrent ? (
                  <span className=" text-black font-bold px-3 py-2 rounded-lg text-sm ">
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

            if (rowData.attribute === "Status") {
              const statusClass = value === "completed";

              return (
                <span className={`  text-sm  text-gray-600 ${statusClass}`}>
                  {value}
                </span>
              );
            }

            return <div className="text-base">{value || "N/A"}</div>;
          },
        });
      });

    return cols;
  }, [relevantHistory, currentPage, recordsPerPage, currentVaccinationId]);

  const { totalPages } = useMemo(() => {
    const totalPages = Math.ceil(relevantHistory.length / recordsPerPage);
    return { totalPages };
  }, [relevantHistory, recordsPerPage]);

  const paginate = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return (
    <div className="mt-4 w-full">
      <div className="flex items-center gap-2 mb-4">
        {loading ? (
          <Skeleton className="h-4 w-4 rounded-full" />
        ) : (
          <Activity className="text-darkBlue1" size={16} />
        )}
        <h2 className="font-semibold text-base text-darkBlue1">
          {loading ? <Skeleton className="h-4 w-48" /> : "Vaccination History"}
        </h2>
      </div>

      {loading ? (
        <div className="space-y-4">
       
  
          {/* Table row skeletons */}
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-4 w-full">
              <Skeleton className="h-6  w-24" />
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </div>
          ))}
          
          
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <p className="text-xl text-red-600 font-medium">{error}</p>
        </div>
      ) : relevantHistory.length > 1 ? (
        <div>
          <div className="overflow-x-auto">
            {tableData.length > 0 && (
              <DataTable columns={columns} data={tableData} />
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-3">
              <Button
                variant="outline"
                onClick={prevPage}
                disabled={currentPage === 1}
                className="text-sm px-4 py-2 h-auto font-medium"
              >
                <ChevronLeft className="px-2 mr-2" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {Array.from(
                  { length: totalPages },
                  (_, i) => i + 1
                ).map((number) => (
                  <Button
                    key={number}
                    variant={
                      currentPage === number ? "default" : "outline"
                    }
                    className="w-8 h-8 text-sm font-medium"
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="text-sm px-4 py-2 h-auto font-medium"
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-300">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-xl text-gray-600 font-medium">
            No previous vaccination history found for this vaccine.
          </p>
        </div>
      )}
    </div>
  );
}