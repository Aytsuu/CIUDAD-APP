import { Link } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleAlert, CircleCheck, CircleChevronRight, CircleMinus, Loader2 } from "lucide-react";
import { FamilyRecord, MemberRecord } from "../profilingTypes";
import { Label } from "@/components/ui/label";
import { calculateAge } from "@/helpers/ageCalculator";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteFamilyComposition } from "../queries/profilingDeleteQueries";
import React from "react";
import { toast } from "sonner";

// Define the columns for family data tables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyColumns = (
  residents: any[],
  families: any[],
  households: any[]
): ColumnDef<FamilyRecord>[] => [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family No.
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "noOfMembers",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Members
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "building",
    header: "Building",
  },
  {
    accessorKey: "indigenous",
    header: "Indigenous",
  },
  {
    accessorKey: "dateRegistered",
    header: "Date Registered",
  },
  {
    accessorKey: "registeredBy",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Registered By
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to="/family/view"
        state={{
          params: {
            residents: residents,
            family: families.find((family) => family.fam_id == row.original.id),
            households: households
          },
        }}
      >
        <div className="group flex justify-center items-center gap-2 px-3 py-2
                rounded-lg border-none shadow-none hover:bg-muted
                transition-colors duration-200 ease-in-out">
        <Label className="text-black/40 cursor-pointer group-hover:text-buttonBlue
                transition-colors duration-200 ease-in-out">
          View
        </Label> 
        <CircleChevronRight
          size={35}
          className="stroke-1 text-black/40 group-hover:fill-buttonBlue 
              group-hover:stroke-white transition-all duration-200 ease-in-out"
        />
      </div>
      </Link>
    ),
  },
];

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyViewColumns = (
  residents: any[],
  family: Record<string, any>,
  setComposition: React.Dispatch<React.SetStateAction<any>>
): ColumnDef<MemberRecord>[] => [
  {
    accessorKey: "data",
    header: "",
    cell: ({ row }) => {
      const data = row.getValue("data") as any;
      const role = data.comp.fc_role;
      const profile = data.comp.rp;
      const personal = profile.per;

      return (
        <div className="w-full border shadow-md flex px-4 py-2 rounded-lg">
          <div className="w-full grid grid-cols-9 items-center justify-center">
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="w-[90%] py-1.5 text-black/70 bg-muted rounded-full">
                {profile.rp_id}
              </Label>
            </div>
            <div className="w-full flex flex-col col-span-2 items-start gap-1">
              <Label className="text-black/70">
              {`${personal.per_lname}, ${personal.per_fname} 
                ${personal.per_mname ? personal.per_mname[0] + "." : ""}`}
              </Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{personal.per_sex}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1 opac">
              <Label className="text-black/70">
                {calculateAge(personal.per_dob)}
              </Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{personal.per_dob}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="text-black/70">{personal.per_status}</Label>
            </div>
            <div className="w-full flex flex-col items-start gap-1">
              <Label className="w-[90%] py-1.5 text-white rounded-full bg-green-500 cursor-pointer">
                {role}
              </Label>
            </div>
          </div>
          <div className="w-1/12 flex justify-end items-center">
            <Link to="/resident/view"
              state={{
                params: {
                  type: 'viewing',
                  title: 'Resident Details',
                  description: 'Information is displayed in a clear, organized, and secure manner.',
                  data: residents.find((resident) => resident.rp_id === profile.rp_id),
                }
              }}
            >
              <div className="group flex justify-center items-center gap-2 px-3 py-2
                        rounded-lg border-none shadow-none hover:bg-muted
                        transition-colors duration-200 ease-in-out">
                <Label className="text-black/40 cursor-pointer group-hover:text-buttonBlue
                        transition-colors duration-200 ease-in-out">
                  View
                </Label> 
                <CircleChevronRight 
                  size={35}
                  className="stroke-1 text-black/40 group-hover:fill-buttonBlue 
                      group-hover:stroke-white transition-all duration-200 ease-in-out"
                />
              </div>
            </Link>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const data = row.getValue("data") as any;
      const familyMembers = data.members;
      const residentId = data.comp.rp.rp_id;
      const [isRemoving, setIsRemoving] = React.useState<boolean>(false);
      const { mutateAsync: deleteFamilyComposition, isPending: isDeleting } = useDeleteFamilyComposition();

      const remove = async () => {
        setIsRemoving(true);
        
        // Cancel if member(s) doesn't exceed 1
        if(familyMembers.length === 1) {
          setIsRemoving(false);
          toast('Family must have atleast 1 member(s)', {
           icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
          })
          return;
        }

        await deleteFamilyComposition({
          familyId: family.fam_id,
          residentId: residentId
        });

        if(!isDeleting) {
          setIsRemoving(false);
          toast("A member has been deleted successfully", {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
          })

          setComposition((prev: any) => 
            prev.filter((p: any) => p.rp.rp_id !== residentId)
          )
        }

      };

      return (
        <div className="flex justify-center items-center">
          {!isRemoving ? (<ConfirmationModal 
            trigger= {
              <CircleMinus 
                size={27}
                className="fill-red-500 stroke-white cursor-pointer"
              />
            }
            title="Confirm Removal"
            description="Are you sure you want to remove this member?"
            actionLabel="Confirm"
            onClick={remove}
            variant="destructive"
          />) : (
            <Loader2 className="animate-spin "/>
          )}
        </div>
      )
    }
  }
];
