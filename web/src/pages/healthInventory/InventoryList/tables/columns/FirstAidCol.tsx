import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";

export type FirstAidRecords = {
  id: string;
  fa_name: string;
  cat_id: string;
  cat_name: string;
};

interface FirstAidColumnsProps {
  onEdit: (firstAid: FirstAidRecords) => void;
  onDelete: (id: string) => void;
}

export const FirstAidColumns = ({
  onEdit,
  onDelete
}: FirstAidColumnsProps): ColumnDef<FirstAidRecords>[] => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md text-center font-semibold">
          {row.original.id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "fa_name",
    header: "Item Name",
  },
  {
    accessorKey: "cat_name",
    header: "Category",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline"
          onClick={() => onEdit(row.original)}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(row.original.id)}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];