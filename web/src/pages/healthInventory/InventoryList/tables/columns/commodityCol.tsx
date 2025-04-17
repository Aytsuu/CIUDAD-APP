
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EditCommodityModal from "../../editListModal/EditCommodityModal";

export type CommodityRecords = {
  id: number;
  commodityName: string;
};

export const CommodityColumns = (
  setIsDialog: (isOpen: boolean) => void,
  setComToDelete: (id: number) => void,
  setIsDeleteConfirmationOpen: (isOpen: boolean) => void
): ColumnDef<CommodityRecords>[] => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
          {row.original.id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "commodityName",
    header: "Commodity Name",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex justify-center gap-2">
        <DialogLayout
          trigger={
            <Button variant="outline">
              <Edit size={16} />
            </Button>
          }
          mainContent={
            <EditCommodityModal
              initialData={row.original}
              setIsDialog={setIsDialog}
            />
          }
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setComToDelete(row.original.id); // Set the commodity ID to delete
            setIsDeleteConfirmationOpen(true); // Open the confirmation dialog
          }}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];

