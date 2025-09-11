import { useNavigate } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { FamilyRecord, MemberRecord } from "../ProfilingTypes";
import { calculateAge } from "@/helpers/ageCalculator";
import React from "react";
import { useLoading } from "@/context/LoadingContext";import { Combobox } from "@/components/ui/combobox";
import { useResidentsFamSpecificList } from "../queries/profilingFetchQueries";
import { formatResidents } from "../ProfilingFormats";
import ViewButton from "@/components/ui/view-button";
import { formatDate } from "@/helpers/dateHelper";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { Button } from "@/components/ui/button/button";
import { useUpdateFamilyRole } from "../queries/profilingUpdateQueries";
import { capitalize } from "@/helpers/capitalize";

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
      const { data: residentsFamSpecificList, isLoading } = useResidentsFamSpecificList(row.original.fam_id);
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
          value={row.original.members}
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
    header: "Household Occupancy",
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
      formatDate(row.original.fam_date_registered, "short" as any)
    )
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        // const familyData = await getFamilyData(row.original.fam_id);
        // const members = await getFamilyMembers(row.original.fam_id);
        // const households = await getHouseholdList();
        navigate("/profiling/family/view", {
          state: {
            params: {
              fam_id: row.original.fam_id,
            }
          }
        })

      }

      return (
        <ViewButton onClick={handleViewClick} />
      )
    },
  },
];

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyMembersCol = (
  family: Record<string, any>
): ColumnDef<MemberRecord>[] => [
  {
    accessorKey: "rp_id",
    header: "Resident ID"
  },
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "sex",
    header: "Sex"
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: ({row}) => (
      calculateAge(row.original.dob)
    )
  },
  {
    accessorKey: "status",
    header: "Status"
  },
  {
    accessorKey: "dob",
    header: "Date of Birth"
  },
  {
    accessorKey: "fc_role",
    header: "Role",
    cell: ({row}) => {
      const [isChanging, setIsChanging] = React.useState<boolean>(false)
      const { mutateAsync: updateFamilyRole } = useUpdateFamilyRole() 
      const buttonStyle = ("h-6 rounded-full bg-blue-200 shadow-none border" +
              "border-blue-300 text-blue-700 hover:bg-blue-300" +
              "focus-visible:ring-0")
      const role = row.original.fc_role
      const handleRoleChange = async (value: string) => {
        if(value == role?.toLowerCase()) return;

        try {
          setIsChanging(true)
          await updateFamilyRole({
            familyId: family.fam_id,
            residentId: row.original.rp_id,
            fc_role: capitalize(value)
          });
          setIsChanging(false)
        }catch (err) {
          console.error(err)
          setIsChanging(false)
        }
      }
      
      return (
        isChanging ? (<Button className={buttonStyle}>
            <Loader2 className="w-5 h-5 animate-spin"/>
          </Button>) : (
          <DropdownLayout
            trigger={<Button className={buttonStyle}>{role as string} </Button>}
            options={[
              {id: "mother", name: "Mother"}, 
              {id: "father", name: "Father"},
              {id: "guardian", name: "Guardian"},
              {id: "dependent" , name: "Dependent"},
            ]}
            onSelect={handleRoleChange}
          />
        )
      )
    }
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({row}) => {
      const navigate = useNavigate()

      const handleViewClick = () => {
        console.log('clicked')
        navigate("/profiling/resident/view/personal", {
          state: {
            params: {
              type: 'viewing',
              data: {
                residentId: row.original.rp_id,
                familyId: family.fam_id,
              },
            }
          }
        });
      }

      return (
        <ViewButton onClick={handleViewClick} />
      )
    }
  }
];
