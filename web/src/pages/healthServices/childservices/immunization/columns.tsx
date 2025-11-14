import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Calendar, Trash2, Pencil } from "lucide-react";
import { VitalSignType, VaccineRecord, ExistingVaccineRecord } from "../../../../form-schema/ImmunizationSchema";

interface ColumnsProps {
  editingRowIndex?: number | null;
  isLoading?: boolean;
  historicalNotes?: any[];
  handleStartEdit?: (index: number, data: any) => void;
  deleteVac?: (id: number) => void;
  deleteExistingVac?: (id: number) => void;
}

export const createImmunizationColumns = (props: ColumnsProps) => {
  const { historicalNotes = [], handleStartEdit = () => {}, deleteVac = () => {}, deleteExistingVac = () => {} } = props;

  const vitalSignsColumns: ColumnDef<VitalSignType>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => row.original.age
    },
    {
      accessorKey: "ht",
      header: "Height (cm)",
      cell: ({ row }) => row.original.ht || "-"
    },
    {
      accessorKey: "wt",
      header: "Weight (kg)",
      cell: ({ row }) => <div className="flex justify-center">{row.original.wt || "-"}</div>
    },
    {
      accessorKey: "temp",
      header: "Temp (°C)",
      cell: ({ row }) => <div className="flex justify-center">{row.original.temp || "-"}</div>
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const displayNotes = row.original.notes || "";
        const displayFollowDescription = row.original.follov_description || "";
        const displayFollowUpVisit = row.original.followUpVisit || "";
        const currentDate = row.original.date;
        // Filter notes to only show those matching the current row's date
        const filteredNotes = historicalNotes.filter((note) => new Date(note.date).toISOString().split("T")[0] === currentDate);

        // Check if we have any content to display
        const hasCurrentData = displayNotes || displayFollowDescription || displayFollowUpVisit;
        const hasHistoricalData = filteredNotes.length > 0;

        if (!hasCurrentData && !hasHistoricalData) {
          return <div className="text-center py-2 text-gray-400 italic">No notes</div>;
        }

        return (
          <div className="flex flex-col justify-center space-y-4">
            {/* Current/Form Notes (from localStorage or form state) */}
            {hasCurrentData && (
              <div className="max-w-[200px] text-left">
                {displayNotes && (
                  <div className="mb-2">
                    <p className="text-gray-800 whitespace-pre-wrap font-medium">{displayNotes}</p>
                  </div>
                )}
                {displayFollowDescription && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-semibold">Follow up Reason:</span> {displayFollowDescription}
                  </p>
                )}
                {displayFollowUpVisit && (
                  <p className="mt-1 text-xs text-gray-500">
                    <span className="font-semibold">Schedule on:</span> {displayFollowUpVisit} ({row.original.followv_status || "pending"})
                  </p>
                )}
              </div>
            )}

            {/* Historical Notes (from database) */}
            {hasHistoricalData && (
              <div className="text-left border-t pt-2">
                <p className="text-xs text-gray-400 mb-2 italic">Historical:</p>
                <div className="space-y-3">
                  {filteredNotes.map((note, index) => (
                    <div key={index} className="text-sm">
                      {note.notes && (
                        <div className="mb-1">
                          <p className="text-gray-600 whitespace-pre-wrap">{note.notes}</p>
                        </div>
                      )}
                      {note.follov_description && (
                        <p className="text-gray-500 text-xs">
                          <span className="font-semibold">Follow up Reason:</span> {note.follov_description}
                        </p>
                      )}
                      {note.followUpVisit && (
                        <p className="mt-1 text-xs text-gray-400">
                          <span className="font-semibold">Schedule on:</span> {note.followUpVisit} ({note.followv_status || "N/A"})
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return (
          <Button
            size="sm"
            onClick={() => {
              handleStartEdit(row.index, row.original);
            }}
            className="px-2 py-1"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Notes
          </Button>
        );
      }
    }
  ];

  const vaccineColumns: ColumnDef<VaccineRecord>[] = [
    {
      accessorKey: "vaccineType",
      header: "Vaccine Type",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-medium">{row.original.vaccineType}</span>
        </div>
      )
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Dose {row.original.dose}
        </Badge>
      )
    },
    {
      accessorKey: "nextdose",
      header: "Next Dose",
      cell: ({ row }) => (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Dose {row.original.nextFollowUpDate || "No more Next dose"}
        </Badge>
      )
    },
    {
      accessorKey: "date",
      header: "Date Administered",
      cell: ({ row }) => (
        <div className="flex justify-center items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.date ? new Date(row.original.date).toLocaleDateString() : "N/A"}</span>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => deleteVac(row.index)} // Pass the row index
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  const existingVaccineColumns: ColumnDef<ExistingVaccineRecord>[] = [
    {
      accessorKey: "vaccineType",
      header: "Vaccine Type",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Info className="h-4 w-4 text-amber-500" />
          <span className="font-medium">{row.original.vaccineType}</span>
        </div>
      )
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Dose {row.original.dose}
        </Badge>
      )
    },
    {
      accessorKey: "date",
      header: "Date Administered",
      cell: ({ row }) => (
        <div className="flex justify-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{row.original.date ? new Date(row.original.date).toLocaleDateString() : "N/A"}</span>
        </div>
      )
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => deleteExistingVac(row.index)} // Pass the row index
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return {
    vitalSignsColumns,
    vaccineColumns,
    existingVaccineColumns
  };
};
