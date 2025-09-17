import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash, ArrowUpDown } from "lucide-react";

export type CommodityRecords = {
  id: string;
  com_name: string;
  user_type: string;
  gender_type: string;
};

export const CommodityColumns = (
  setComToDelete: (id: string) => void,
  setIsDeleteConfirmationOpen: (isOpen: boolean) => void,
  setSelectedCommodity: (commodity: CommodityRecords) => void,
  setModalMode: (mode: 'add' | 'edit') => void,
  setShowCommodityModal: (show: boolean) => void
): ColumnDef<CommodityRecords>[] => [
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
    accessorKey: "com_name",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Commodity Name <ArrowUpDown size={15} />
      </div>
    ),
  },
  {
    accessorKey: "user_type",
    header: "User Type",
  },
  {
    accessorKey: "gender_type",
    header: "For Gender",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <Button 
          variant="outline"
          onClick={() => {
            setSelectedCommodity(row.original);
            setModalMode('edit');
            setShowCommodityModal(true);
          }}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setComToDelete(row.original.id);
            setIsDeleteConfirmationOpen(true);
          }}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];