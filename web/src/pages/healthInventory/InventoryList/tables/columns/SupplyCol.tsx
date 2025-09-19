// columns/supplyColumns.ts
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";

export const SupplyColumns = (
  onEdit: (supply: any) => void,
  onDelete: (id: number) => void
): ColumnDef<any>[] => [
  {
    accessorKey: "supplyName",
    header: "Supply Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("supplyName")}</div>
    ),
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