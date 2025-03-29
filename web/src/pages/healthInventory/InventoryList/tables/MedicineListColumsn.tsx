import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import MedicineListEdit from "../editListModal/EditMedicineModal";
import EditFirstAidModal from "../editListModal/EditFirstAidModal";
import EditCommodityModal from "../editListModal/EditCommodityModal";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip/tooltip"
import EditVaccineListModal from "../editListModal/EditVaccineModal";

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




export type VaccineRecords = {
  id: number;
  vaccineName: string;
  vaccineType: 'Routine' | 'Primary Series';
  ageGroup: string;
  doses: number;
  specifyAge: string;
  category: string;
  noOfDoses: number;
  interval: {
    interval: number;
    timeUnits: string;
  };
  doseDetails: {
    doseNumber: number;
    interval?: number;
    unit?: string;
  }[];
};

export const VaccineColumns = (
  setIsDialog: (isOpen: boolean) => void,
  setVaccineToDelete: React.Dispatch<React.SetStateAction<number | null>>,
  setIsDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>
): ColumnDef<VaccineRecords>[] => [
  {
    accessorKey: "vaccineName",
    header: "Vaccine Name",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.getValue("vaccineName")}
      </div>
    ),
  },
  {
    accessorKey: "vaccineType",
    header: "Type",
    cell: ({ row }) => (
      <span className={`px-2 py-1 rounded-full text-xs ${
        row.getValue("vaccineType") === 'Routine' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-purple-100 text-purple-800'
      }`}>
        {row.getValue("vaccineType")}
      </span>
    ),
  },
  {
    accessorKey: "ageGroup",
    header: "Age Group",
    cell: ({ row }) => (
      <div className="capitalize">
        {row.getValue("ageGroup")}
      </div>
    ),
  },
  {
    accessorKey: "doses",
    header: "Total Doses",
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("doses")}
      </div>
    ),
  },
  {
    accessorKey: "doseDetails",
    header: "Dose Schedule",
    cell: ({ row }) => {
      const vaccine = row.original;
      const doseDetails = vaccine.doseDetails;
      
      return (
        <div className="flex flex-col gap-1">
          {vaccine.vaccineType === 'Routine' ? (
            <div className="text-sm">
              Every {doseDetails[0]?.interval} {doseDetails[0]?.unit}
            </div>
          ) : (
            <>
              <div className="text-sm">
                Dose 1: Starts at {vaccine.specifyAge}
              </div>
              {doseDetails
                .filter(dose => dose.doseNumber > 1)
                .map((dose, index) => (
                  <div key={index} className="text-sm">
                    Dose {dose.doseNumber}: After {dose.interval} {dose.unit}
                  </div>
                ))
              }
            </>
          )}
        </div>
      );
    },
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
            // <EditVaccineListModal
            //   initialData={row.original}
            //   setIsDialog={setIsDialog}
            // />
            <></>
          }
        />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            setVaccineToDelete(row.original.id); // Set the commodity ID to delete
            setIsDeleteConfirmationOpen(true); // Open the confirmation dialog
          }}
        >
          <Trash />
        </Button>
      </div>
    ),
  },
];