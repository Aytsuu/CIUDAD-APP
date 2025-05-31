import { Link, useNavigate } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleAlert, CircleCheck, CircleChevronRight, CircleMinus, Loader2 } from "lucide-react";
import { FamilyRecord, MemberRecord } from "../profilingTypes";
import { Label } from "@/components/ui/label";
import { calculateAge } from "@/helpers/ageCalculator";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteFamilyComposition } from "../queries/profilingDeleteQueries";
import React from "react";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { getFamilyData, getFamilyMembers, getHouseholdList, getPersonalInfo } from "../restful-api/profilingGetAPI";
import { Badge } from "@/components/ui/badge";

// Reusables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

const CardContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full border shadow-md flex px-4 py-2 rounded-lg">
    {children}
  </div>
);

const IdBadge = ({ id, className = '' }: { id: string; className?: string }) => (
  <Label className={`w-[90%] py-1.5 text-black/70 bg-muted rounded-full ${className}`}>
    {id}
  </Label>
);

const RoleBadge = ({ role }: { role: string }) => (
  <Label className="w-[90%] py-1.5 text-white rounded-full bg-green-500 cursor-pointer">
    {role}
  </Label>
);

const NameDisplay = ({ lname, fname, mname }: { lname: string; fname: string; mname?: string }) => (
  <Label className="text-black/70">
    {`${lname}, ${fname} ${mname ? mname[0] + "." : ""}`}
  </Label>
);

const ViewButton = ({ onClick }: { onClick: () => void }) => (
  <div 
    className="group flex justify-center items-center gap-2 px-3 py-2
              rounded-lg border-none shadow-none hover:bg-muted
              transition-colors duration-200 ease-in-out cursor-pointer"
    onClick={onClick}
  >
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
);

const InfoCell = ({ value, className = '' }: { value: string | number | React.ReactNode; className?: string }) => (
  <div className={`w-full flex flex-col items-start gap-1 ${className}`}>
    <Label className="text-black/70">{value}</Label>
  </div>
);

// Define the columns for family data tables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyColumns: ColumnDef<FamilyRecord>[] = [
  {
    accessorKey: "fam_id",
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
    accessorKey: "members",
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
    accessorKey: "fam_building",
    header: "Building",
  },
  {
    accessorKey: "fam_indigenous",
    header: "Indigenous",
  },
  {
    accessorKey: "fam_date_registered",
    header: "Date Registered",
  },
  {
    accessorKey: "registered_by",
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
    cell: ({ row }) => {
      const navigate = useNavigate();
      const { showLoading, hideLoading } = useLoading();

      const handleViewClick = async () => {
        showLoading();
        try {
          const familyData = await getFamilyData(row.original.fam_id);
          const members = await getFamilyMembers(row.original.fam_id);
          const households = await getHouseholdList();
          navigate("/family/view", {
            state: {
              params: {
                family: {
                  ...familyData,
                  members: members
                },
                households: households
              }
            }
          })
        } finally {
          hideLoading();
        }
      }

      return (
          <div className="group flex justify-center items-center gap-2 px-3 py-2
                  rounded-lg border-none shadow-none hover:bg-muted
                  transition-colors duration-200 ease-in-out cursor-pointer"
            onClick={handleViewClick}        
          >
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
      )
    },
  },
];

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyViewColumns = (
  family: Record<string, any>,
  setComposition: React.Dispatch<React.SetStateAction<any>>
): ColumnDef<MemberRecord>[] => [
  {
    accessorKey: "data",
    header: "",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const data = row.getValue("data") as any;
      const { showLoading, hideLoading } = useLoading();

      const handleViewClick = async () => {
        showLoading();
        try {
          const resident = await getPersonalInfo(data.rp_id);
            navigate("/resident/view", {
              state: {
                params: {
                  type: 'viewing',
                  data: resident,
                }
              }
            });
        } finally {
          hideLoading();
        }
      }

      return (
        <CardContainer>
          <div className="w-full grid grid-cols-9 items-center justify-center">
            <InfoCell value={<Badge className="bg-black/10 text-black/80 hover:bg-black/10">{data.rp_id}</Badge>}/>
            <InfoCell 
              value={<NameDisplay lname={data.lname} fname={data.fname} mname={data.mname} />}  
              className="col-span-2"
            />
            <InfoCell value={data.sex} />
            <InfoCell value={calculateAge(data.dob)} className="opac" />
            <InfoCell value={data.dob} /> 
            <InfoCell value={data.status} />
            <InfoCell value={
              <Badge className="bg-green-500 hover:bg-green-500">{data.fc_role}</Badge>} 
            />
          </div>
          
          <div className="w-1/12 flex justify-end items-center">
            <ViewButton onClick={handleViewClick} />
          </div>
        </CardContainer>
      );
    },
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const data = row.getValue("data") as any;
      const familyMembers = data;
      const residentId = data.rp_id;
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
          toast("A member has been removed successfully", {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
          })

          setComposition((prev: any) => 
            prev.filter((p: any) => p.rp_id !== residentId)
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
