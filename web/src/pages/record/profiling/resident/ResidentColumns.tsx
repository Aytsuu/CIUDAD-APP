import { Link, useNavigate } from "react-router";
import { ArrowUpDown, Building, CircleAlert, CircleUserRound, House, UserRoundPlus, UsersRound } from "lucide-react";
import { ResidentFamilyRecord, ResidentRecord, ResidentBusinessRecord} from "../profilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import ViewButton from "@/components/ui/view-button";
import { Badge } from "@/components/ui/badge";

export const residentColumns: ColumnDef<ResidentRecord>[] = [
  {
    accessorKey: "rp_id",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Resident No.
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: "lname",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("lname")}
      </div>
    ),
  },
  {
    accessorKey: "fname",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        First Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {row.getValue("fname")}
      </div>
    ),
  },
  {
    accessorKey: "mname",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Middle Name
        <ArrowUpDown size={14} />
      </div>
    ),
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
    cell: ({ row }) => {
      const registeredBy = row.getValue("registered_by") as string;
      return (
        <div className="text-center">
          {registeredBy || "-"}
        </div>
      );
    },
  },
  {
    accessorKey: "rp_date_registered",
    header: "Date Registered"
  },
  {
    accessorKey: "completed_profiles",
    header: "Completed Profile",
    cell: ({row}) => {
      const profiles = [
        {id: 'account', icon: CircleUserRound},
        {id: 'household', icon: House, tooltip: "ID: " + row.original.household_no},
        {id: 'family', icon: UsersRound, tooltip: "ID: " + row.original.family_no},
        {id: 'business', icon: Building},
      ]
      const completed: any[] = [];

      row.original.has_account && completed.push('account')
      row.original.household_no && completed.push('household')
      row.original.family_no && completed.push('family')
      row.original.business_owner && completed.push('business')

      return (
        <div className="flex items-center justify-between px-5">
          {profiles.map((profile: any) => (
            completed.includes(profile.id) ? (
              <TooltipLayout
                key={profile.id}
                trigger={
                  <profile.icon size={20} 
                    className="text-blue-600"
                  />
                }
                content={profile.tooltip}
              />
            ) : (
              <profile.icon 
                key={profile.id}
                size={20} 
                className="text-gray-300"
              />
            )
          ))}
        </div>
      )
    }
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        navigate("/resident/view", {
          state: {
            params: {
              type: 'viewing',
              data: {
                residentId: row.original.rp_id,
                familyId: row.original.family_no
              },
            }
          }
        });
      }
    
      return (
        <ViewButton onClick={handleViewClick} />
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
];

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const familyDetailsColumns = (residentId: string, familyId: string): ColumnDef<ResidentFamilyRecord>[] => [
  {
    accessorKey: 'rp_id',
    header: 'Resident No.'
  },
  {
    accessorKey: 'name',
    header: 'Name'
  },
  {
    accessorKey: 'sex',
    header: 'Sex'
  },
  {
    accessorKey: 'dob',
    header: 'Birthdate'
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({row}) => (
      <Badge>
        {row.original.fc_role === null ? "Family Member" : row.original.fc_role}
      </Badge>
    )
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const navigate = useNavigate();

      const handleViewClick = async () => {
        navigate("/resident/view", {
          state: {
            params: {
              type: 'viewing',
              data: {
                residentId: row.original.rp_id,
                familyId: familyId
              },
            }
          },
          replace: true
        });
      }

      if(row.original.rp_id === residentId) {
        return (
          <Badge className="bg-black/20 text-black/70 hover:bg-black/20">
            Viewing
          </Badge>
        )
      }
    
      return (
        <ViewButton onClick={handleViewClick} />
      )
    },
    enableSorting: false,
    enableHiding: false,
  }
]

export const businessDetailsColumns = (): ColumnDef<ResidentBusinessRecord>[] => [
  {
    accessorKey: 'bus_id',
    header: 'Business No.'
  },
  {
    accessorKey: 'bus_name',
    header: 'Name'
  },
  {
    accessorKey: 'location',
    header: 'Location'
  },
  {
    accessorKey: 'bus_gross_sales',
    header: 'Gross Sales'
  },
  {
    accessorKey: 'bus_date_registered',
    header: 'Date Registered'
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        
      }

      return (
        <ViewButton onClick={handleViewClick} />
      )
    },
    enableSorting: false,
    enableHiding: false,
  }
]