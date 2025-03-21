import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import MedicineListEdit from "../editListModal/EditMedicineModal";
import EditFirstAidModal from "../editListModal/EditFirstAidModal";
import EditCommodityModal from "../editListModal/EditCommodityModal";

export type MedicineRecords = {
  id: number;
  medicineName: string;
};

export const Medcolumns = (
  setIsDialog: (isOpen: boolean) => void,
  setMedToDelete: (id: number) => void,
  setIsDeleteConfirmationOpen: (isOpen: boolean) => void
): ColumnDef<MedicineRecords>[] => [
  { accessorKey: "id", header: "Medicine ID" },
  { accessorKey: "medicineName", header: "Medicine Name" },
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
            <MedicineListEdit
              initialData={row.original}
              setIsDialog={setIsDialog}
            />
          }
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setMedToDelete(row.original.id); // Set the medicine ID to delete
            setIsDeleteConfirmationOpen(true); // Open the confirmation dialog
          }}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];


// ------------------------



export type FirstAidRecords = {
  id: number;
  firstAidName: string;
};

export const FirstAidColumns = (
  setIsDialog: (isOpen: boolean) => void,
  setFaToDelete: (id: number) => void,
  setIsDeleteConfirmationOpen: (isOpen: boolean) => void
): ColumnDef<FirstAidRecords>[] => [
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
    accessorKey: "firstAidName",
    header: "Item Name",
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
            <EditFirstAidModal
              initialData={row.original}
              setIsDialog={setIsDialog}
            />
          }
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setFaToDelete(row.original.id); // Set the first aid item ID to delete
            setIsDeleteConfirmationOpen(true); // Open the confirmation dialog
          }}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];





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