import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Info, Calendar, Trash2, Plus, Pencil } from "lucide-react";
import {
  VitalSignType,
  VaccineRecord,
  ExistingVaccineRecord,
} from "./ImmunizationSchema";

interface ColumnsProps {
  editingRowIndex?: number | null;
  isLoading?: boolean;
  historicalNotes?: any[];
  handleStartEdit?: (index: number, data: any) => void;
  deleteVac?: (vacStck_id: string) => void;
  deleteExistingVac?: (vac_id: string) => void;
}

export const createImmunizationColumns = (props: ColumnsProps) => {
  const {
    historicalNotes = [],
    handleStartEdit = () => {},
    deleteVac = () => {},
    deleteExistingVac = () => {},
  } = props;

  const vitalSignsColumns: ColumnDef<VitalSignType>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => row.original.date,
    },
    {
      accessorKey: "age",
      header: "Age",
      cell: ({ row }) => row.original.age,
    },
    {
      accessorKey: "ht",
      header: "Height (cm)",
      cell: ({ row }) => row.original.ht || "-",
    },
    {
      accessorKey: "wt",
      header: "Weight (kg)",
      cell: ({ row }) => (
        <div className="flex justify-center">{row.original.wt || "-"}</div>
      ),
    },
    {
      accessorKey: "temp",
      header: "Temp (°C)",
      cell: ({ row }) => (
        <div className="flex justify-center">{row.original.temp || "-"}</div>
      ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const displayNotes = row.original.notes || "";

        return (
            
          <div className="flex flex-col justify-center">
            <div className="text-left">
              {historicalNotes.length > 0 ? (
                <div className="space-y-4">
                  {historicalNotes.map((note, index) => (
                    <div key={index}>
                      {note.notes && (
                        <div className="mt-2">
                          <p className="text-gray-600 whitespace-pre-wrap">
                            {note.notes}
                          </p>
                        </div>
                      )}

                      <div>
                        {note.follov_description && (
                          <p className="text-gray-600">
                            Follow up Reason: {note.follov_description}
                          </p>
                        )}
                        {note.followUpVisit && (
                          <p className="mt-1 flex flex-col text-xs text-gray-500">
                            Schedule on {note.followUpVisit} (
                            {note.followv_status || "N/A"})
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No notes found
                </div>
              )}
            </div>

            <div className="max-w-[200px] text-left mt-4">
              <p className="whitespace-pre-wrap">{displayNotes}</p>
              {row.original.follov_description && (
                <p className="text-gray-600">
                  Follow up Reason: {row.original.follov_description}
                </p>
              )}
              {row.original.followUpVisit && (
                <p className="mt-1 flex flex-col text-xs text-gray-500">
                  <span>
                    Schedule on {row.original.followUpVisit} (
                    {row.original.followv_status || "pending"})
                  </span>
                </p>
              )}
            </div>
          </div>
        );
      },
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
      },
    },
  ];

  const vaccineColumns: ColumnDef<VaccineRecord>[] = [
    {
      accessorKey: "vaccineType",
      header: "Vaccine Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="font-medium">{row.original.vaccineType}</span>
        </div>
      ),
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Dose {row.original.dose}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date Administered",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original.date
              ? new Date(row.original.date).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => deleteVac(row.original.vacStck_id || "")}
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  const existingVaccineColumns: ColumnDef<ExistingVaccineRecord>[] = [
    {
      accessorKey: "vaccineType",
      header: "Vaccine Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-500" />
          <span className="font-medium">{row.original.vaccineType}</span>
        </div>
      ),
    },
    {
      accessorKey: "dose",
      header: "Dose",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800">
          Dose {row.original.dose}
        </Badge>
      ),
    },
    {
      accessorKey: "date",
      header: "Date Administered",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {row.original.date
              ? new Date(row.original.date).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => deleteExistingVac(row.original.vac_id || "")}
          className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return {
    vitalSignsColumns,
    vaccineColumns,
    existingVaccineColumns,
  };
};
