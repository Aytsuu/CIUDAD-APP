// columns/vaccineColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";

export const VaccineColumns = (
  onEdit: (vaccine: any) => void,
  onDelete: (id: number) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "vaccineName",
    header: "Vaccine Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("vaccineName")}</div>
    ),
  },
  {
    accessorKey: "vaccineType",
    header: "Type",
    cell: ({ row }) => {
      const value = row.getValue("vaccineType");
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            value === "Routine"
              ? "bg-blue-100 text-blue-800"
              : value === "Primary Series"
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {String(value)}
        </span>
      );
    },
  },
  {
    accessorKey: "ageGroup",
    header: "Age Group",
    cell: ({ row }) => (
      <div className="text-sm">{row.getValue("ageGroup") || "N/A"}</div>
    ),
  },
  {
    accessorKey: "doses",
    header: "Total Doses",
    cell: ({ row }) => {
      return <div className="text-center">{String(row.getValue("doses"))}</div>;
    },
  },
  {
    accessorKey: "doseDetails",
    header: "Dose Schedule",
    cell: ({ row }) => {
      const vaccine = row.original;
      const doseDetails = vaccine.doseDetails;

      if (doseDetails.length === 0) {
        return <div className="text-sm text-gray-500">N/A</div>;
      }

      return (
        <div className="flex flex-col gap-1">
          {vaccine.vaccineType === "Routine" ? (
            <div className="text-sm">
              Every {doseDetails[0]?.interval} {doseDetails[0]?.unit}
            </div>
          ) : (
            <>
              <div className="text-sm">
                Dose 1: Starts at {vaccine.ageGroup}
              </div>
              {doseDetails
                .filter((dose:any) => dose.doseNumber > 1)
                .map((dose:any, index:any) => (
                  <div key={index} className="text-sm">
                    Dose {dose.doseNumber}: After {dose.interval} {dose.unit}
                  </div>
                ))}
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Actions",
    cell: ({ row }) => {
      const record = row.original;

      return (
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(record)}
          >
            <Edit size={16} />
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(record.id)}
          >
            <Trash size={16} />
          </Button>
        </div>
      );
    },
  },
];