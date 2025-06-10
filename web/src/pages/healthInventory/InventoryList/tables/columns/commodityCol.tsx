
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EditCommodityModal from "../../editListModal/EditCommodityModal";
import { Link
  
 } from "react-router";
export type CommodityRecords = {
  id: string;
  com_name: string;
  cat_id: string;
  cat_name: string; // Add this
};

export const CommodityColumns = (
  setComToDelete: (id: string) => void,
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
    accessorKey: "com_name",
    header: "Commodity Name",
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
       <Button variant="outline">
          <Link
            to="/editCommodityList"
            state={{
              params: {
                initialData: row.original, // Pass entire row data
              },
            }}
          >
     
            <Edit size={16} />
          </Link>
        </Button>
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

