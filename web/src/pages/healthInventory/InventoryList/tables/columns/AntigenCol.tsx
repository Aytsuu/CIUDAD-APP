import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Edit, Trash } from "lucide-react";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import EditVaccineListModal from "../../editListModal/EditVaccineModal";
import EditImmunizationSupplies from "../../editListModal/EditImmunizationSuppies";
import { Link } from "react-router";

export type VaccineRecords = {
  id: number;
  vaccineName: string;
  vaccineType: string;
  ageGroup: string;
  doses: number | string;
  schedule: string;
  category: string;
  agegrp_id:string,
  noOfDoses?: number | string;
  doseDetails: {
    doseNumber: number;
    interval?: number;
    unit?: string;
  }[];
};
export const VaccineColumns = (
  setVaccineToDelete: React.Dispatch<React.SetStateAction<number | null>>,
  setIsDeleteConfirmationOpen: React.Dispatch<React.SetStateAction<boolean>>
): ColumnDef<VaccineRecords>[] => [
  {
    accessorKey: "vaccineName",
    header: "Vaccine Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("vaccineName")}</div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
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
      <div className="capitalize">{row.getValue("ageGroup") || "N/A"}</div>
    ),
  },
  {
    accessorKey: "doses",
    header: "Total Doses",
    cell: ({ row }) => {
      const value = row.getValue("doses");
      return (
        <div className="text-center">
          {value === "N/A" ? (
            <span className="text-gray-500">N/A</span>
          ) : (
            String(value)
          )}
        </div>
      );
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
                .filter((dose) => dose.doseNumber > 1)
                .map((dose, index) => (
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
    header: "Action",
    cell: ({ row }) => {
      const vaccine = row.original;
      const category = String(vaccine.category).toLowerCase().trim();
      const isVaccine = category === "vaccine";
     
      return (
        <div className="flex justify-center gap-2">
          {/* <DialogLayout
            trigger={
              <Button variant="outline">
                <Edit size={16} />
              </Button>
            }
            mainContent={
              isVaccine ? (
                <EditVaccineListModal
                  vaccineData={vaccine}
                  setIsDialog={setIsDialog}
                />
              ) : (
                <EditImmunizationSupplies
                  initialData={vaccine}
                  setIsDialog={setIsDialog}
                />
              )
            }
          /> */}
          <Button variant="outline" asChild>
            <Link
              to={isVaccine ? "/editVaccineModal" : "/editImmunizationSupplies"}
              state={{ initialData: vaccine }}
            >
              <Edit size={16} />
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setVaccineToDelete(row.original.id);
              setIsDeleteConfirmationOpen(true);
            }}
          >
            <Trash />
          </Button>
        </div>
      );
    },
  },
];
