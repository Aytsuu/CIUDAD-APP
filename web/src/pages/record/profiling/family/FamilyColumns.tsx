import { useNavigate } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleAlert, CircleCheck, CircleMinus, Loader2 } from "lucide-react";
import { FamilyRecord, MemberRecord } from "../ProfilingTypes";
import { Label } from "@/components/ui/label";
import { calculateAge } from "@/helpers/ageCalculator";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useDeleteFamilyComposition } from "../queries/profilingDeleteQueries";
import React from "react";
import { toast } from "sonner";
import { useLoading } from "@/context/LoadingContext";
import { getFamilyData, getFamilyMembers, getHouseholdList, getPersonalInfo } from "../restful-api/profilingGetAPI";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { useResidentsFamSpecificList } from "../queries/profilingFetchQueries";
import { formatResidents } from "../ProfilingFormats";
import ViewButton from "@/components/ui/view-button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { Button } from "@/components/ui/button/button";
import { capitalize } from "@/helpers/capitalize";
import { useUpdateFamilyRole } from "../queries/profilingUpdateQueries";
import { formatDate } from "@/helpers/dateHelper";

// Reusables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

const CardContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full border shadow-md flex px-4 py-2 rounded-lg">
    {children}
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
    cell: ({ row }) => {
      const {showLoading, hideLoading} = useLoading();
      const { data: residentsFamSpecificList, isLoading } = useResidentsFamSpecificList(row.getValue('fam_id'));
      const formattedResidents = React.useMemo(() => 
        formatResidents(residentsFamSpecificList)
      , [residentsFamSpecificList])

      React.useEffect(() => {
        if(isLoading) {
          showLoading();
        } else {
          hideLoading();
        }
      }, [isLoading])

      return (
        <Combobox
          options={formattedResidents}
          value={row.getValue('members')}
          placeholder="Search member"
          emptyMessage="No resident found"
          staticVal={true}
          size={400}
        />
      )
    }
  },
  {
    accessorKey: "fam_building",
    header: "Building",
  },
  {
    accessorKey: "father",
    header: "Father",
  },
  {
    accessorKey: "mother",
    header: "Mother",
  },
  {
    accessorKey: "guardian",
    header: "Guardian",
  },
  {
    accessorKey: "fam_date_registered",
    header: "Date Registered",
    cell: ({row}) => (
      formatDate(row.original.fam_date_registered, "long")
    )
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
          navigate("/profiling/family/view", {
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
        <ViewButton onClick={handleViewClick} />
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
      const { mutateAsync: updateFamilyRole } = useUpdateFamilyRole();
      const [role, setRole] = React.useState<string | null>(data.fc_role);

      const handleViewClick = async () => {
        showLoading();
        try {
          const personalInfo = await getPersonalInfo(data.rp_id);
            navigate("/profiling/resident/view", {
              state: {
                params: {
                  type: 'viewing',
                  data: {
                    personalInfo: personalInfo,
                    residentId: data.rp_id,
                    familyId: family.fam_id,
                  },
                }
              }
            });
        } finally {
          hideLoading();
        }
      }

      const handleRoleChange = (value: string) => {
        if(value !== role?.toLowerCase()) {
          setRole(capitalize(value));
          updateFamilyRole({
            familyId: family.fam_id,
            residentId: data.rp_id,
            fc_role: capitalize(value)
          }, {
            onError: (status) => {
              setRole(data.fc_role);
              throw status;
            }
          })
        }
      }

      return (
        <CardContainer>
          <div className="w-full grid grid-cols-9 items-center justify-center">
            <InfoCell value={<Badge className="bg-black/10 text-black/80 hover:bg-black/10">{data.rp_id}</Badge>}/>
            <InfoCell 
              value={data.name}  
              className="col-span-2"
            />
            <InfoCell value={data.sex} />
            <InfoCell value={calculateAge(data.dob)}/>
            <InfoCell value={data.dob} /> 
            <InfoCell value={data.status} />
            <InfoCell value={
              <DropdownLayout
                  trigger={<Button className="w-full h-6">{role} </Button>}
                  options={[
                    {id: "mother", name: "Mother"}, 
                    {id: "father", name: "Father"},
                    {id: "guardian", name: "Guardian"},
                    {id: "dependent" , name: "Dependent"},
                  ]}
                  onSelect={handleRoleChange}
                />
            } 
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
