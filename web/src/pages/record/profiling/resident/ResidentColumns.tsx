import { useNavigate } from "react-router";
import { ArrowUpDown, Building, CircleUserRound, House, UsersRound } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import ViewButton from "@/components/ui/view-button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { ResidentRecord, ResidentFamilyRecord, ResidentBusinessRecord } from "../ProfilingTypes";
import { calculateAge } from "@/helpers/ageCalculator";
import { useLinkToVoter } from "../queries/profilingUpdateQueries";
import { showErrorToast } from "@/components/ui/toast";
import { formatCurrency } from "@/helpers/currencyFormat";
import { formatDate } from "@/helpers/dateHelper";

// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

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
    accessorKey: "suffix",
    header: "Suffix",
    size: 60
  },
  {
    accessorKey: "sex",
    header: "Sex",
    cell: ({row}) => (
      row.original.sex[0]
    ),
    size: 60
  },
    {
    accessorKey: "age",
    header: "Age",
    cell: ({row}) => (
      calculateAge(row.original.dob )
    ),
    size: 60
  },
  {
    accessorKey: "pwd",
    header: "Disability"
  },
  {
    accessorKey: "voter",
    header: "Voter", 
    cell: ({ row }) => {
      const status = row.original.voter
      const { mutateAsync: linkToVoter } = useLinkToVoter()

      const link = () => {
        try {
          linkToVoter(row.original.rp_id)
        } catch (err) {
          showErrorToast("Failed to link resident to voter.")
        }
      }

      switch(status) {
        case "Link":
          return (
            <div className="flex justify-center">
              <div className="bg-green-500 px-5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                onClick={link}
              >
                <p className="text-white font-medium">{status}</p>
              </div>
            </div>
          )
        case "Review":
          return (
            <div className="flex justify-center">
              <div className="bg-amber-500">
                <p className="text-white font-medium">{status}</p>
              </div>
            </div>
          )
        default:
          return status
      }
    }
  },
  {
    accessorKey: "completed_profiles",
    header: "Profile",
    cell: ({row}) => {
      const navigate = useNavigate();
      const profiles = [
        {
          id: 'account', 
          icon: CircleUserRound, 
          route: {
            create: {
              link: "/profiling/account/create",
              params: {
                residentId: row.original.rp_id
              }
            },
          }},
        {
          id: 'household', 
          icon: House, 
          tooltip: "ID: " + row.original.household_no, 
          route: {
            create: {
              link: "/profiling/household"
            },
            view: {
              link: "/profiling/household/view",
              params: {
                hh_id: row.original.household_no
              }
            }
          }},
        {
          id: 'family', 
          icon: UsersRound, 
          tooltip: "ID: " + row.original.family_no, 
          route: {
            create: "/profiling/family",
            view: {
              link: "/profiling/family/view",
              params: {
                fam_id: row.original.family_no
              }
            }
          }},
        {
          id: 'business', 
          icon: Building, 
          route: {
            view: ""
          }},
      ]
      const completed: any[] = [];

      row.original.has_account && completed.push('account')
      row.original.household_no && completed.push('household')
      row.original.family_no && completed.push('family')
      row.original.business_owner && completed.push('business')

      return (
        <div className="flex items-center justify-between px-5">
          {profiles.map((profile: any, idx: number) => (
            <React.Fragment key={idx}>
              {completed.includes(profile.id) ? (
                <TooltipLayout
                  trigger={
                    <profile.icon size={20} 
                      className="text-blue-600 cursor-pointer"
                      onClick={() => navigate(profile.route.view.link, {
                        state: {
                          params: profile.route.view.params
                        }
                      })}
                    />
                  }
                  content={profile.tooltip}
                />
              ) : (profile.id !== 'business' &&
                <profile.icon size={20} 
                  className="text-gray-300 cursor-pointer"
                  onClick={() => navigate(profile.route.create.link, {
                    state: {
                      params: profile.route.create.params
                    }
                  })}
                />
              )}
            </React.Fragment>
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
      const handleViewClick = () => {
        navigate("/profiling/resident/view/personal", {
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
    header: 'Birthdate',
    cell: ({ row }) => (
      formatDate(row.original.dob, "short")
    )
  },
  {
    accessorKey: 'status',
    header: 'Status'
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({row}) => (
      <Badge className="rounded-full bg-blue-50 border-blue-400 text-blue-700 hover:bg-blue-50">
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
        navigate("/profiling/resident/view/family", {
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
    accessorKey: "size",
    header: "Business Size",
    cell: ({ row }) => {
      const color: any = {
        MICRO: "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-50",
        SMALL: "bg-green-50 border-green-300 text-green-700 hover:bg-green-50",
        MEDIUM: "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-50",
        LARGE: "bg-red-50 border-red-300 text-red-700 hover:bg-red-50",
      };

      const tooltip: any = {
        MICRO:
          "Assets: <₱3M | Sales: <₱3M | Examples: Sari-sari stores, small neighborhood businesses",
        SMALL:
          "Assets: ₱3M-₱15M | Growing businesses with several employees | Local market focus",
        MEDIUM:
          "Assets: ₱15M-₱100M | Established businesses with structured operations | Regional reach",
        LARGE:
          "Assets: >₱100M | Major corporations | National/International operations",
      };

      const amount = row.original.bus_gross_sales;
      let size = "MICRO";
      if (+amount < 3000000) size = "MICRO";
      else if (+amount < 20000000) size = "SMALL";
      else if (+amount < 1000000000) size = "MEDIUM";
      else size = "LARGE";

      return (
        <TooltipLayout
          trigger={
            <div>
              <Badge className={`rounded-full ${color[size]}`}>{size}</Badge>
            </div>
          }
          content={tooltip[size]}
          contentClassName="w-64"
        />
      );
    },
  },
   {
    accessorKey: 'bus_gross_sales',
    header: 'Gross Sales',
    cell: ({ row }) => (
      formatCurrency(+row.original.bus_gross_sales)
    )
  },
  {
    accessorKey: 'bus_location',
    header: 'Location'
  },
  {
    accessorKey: 'bus_date_verified',
    header: 'Registered',
    cell: ({ row }) => (
      formatDate(row.original.bus_date_verified, "short")
    )
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        navigate("/profiling/business/record/form", {
          state: {
            params: {
              type: "viewing",
              busId: row.original.bus_id,
            }
          }
        })
      }

      return (
        <ViewButton onClick={handleViewClick} />
      )
    },
    enableSorting: false,
    enableHiding: false,
  }
]