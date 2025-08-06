import { useNavigate } from "react-router";
import { ArrowUpDown, Building, CircleUserRound, House, UsersRound } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import ViewButton from "@/components/ui/view-button";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { ResidentBusinessRecord, ResidentFamilyRecord, ResidentRecord } from "../ProfilingTypes";

// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

// export const residentColumns: ColumnDef<ResidentRecord>[] = [
//   {
//     accessorKey: 'has_account',
//     header: '',
//     cell: ({ row }) => {
//       const account = row.original.has_account

//       return (
//         <div className="flex items-center justify-center">
//           {!account && (
//             <TooltipLayout 
//               trigger={
//                 <Link to="/account/create"
//                   state={{
//                     params: {
//                       residentId: row.original.rp_id
//                     }
//                   }}
//                 >
//                   <UserRoundPlus size={18} className="text-orange-400"/>
//                 </Link> 
//               }
//               content="Account not registered"
//             />
//           )}
//         </div>
//       )
//     }
//   },
//   {
//     accessorKey: "rp_id",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Resident No.
//         <ArrowUpDown size={14} />
//       </div>
//     ),
//   },
//   {
//     accessorKey: "household_no",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Household No.
//         <ArrowUpDown size={14} />
//       </div>
//     ),
//     cell: ({ row }) => {
//         const householdNo: string = row.getValue("household_no");
        
//         return householdNo ? (<div>{householdNo}</div>) :
//         (<div className="flex justify-center items-center">
//           <TooltipLayout
//               trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
//               content="Family not registered"
//           />
//         </div>)
//     },
//   },
//   {
//     accessorKey: "family_no",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Family No.
//         <ArrowUpDown size={14} />
//       </div>
//     ),
//     cell: ({ row }) => {
//         const familyNo: string = row.getValue("family_no");
        
//         return familyNo ? (<div>{familyNo}</div>) :
//         (<div className="flex justify-center items-center">
//           <TooltipLayout
//               trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
//               content="Family not registered"
//           />
//         </div>)
//     },
//   },
//   {
//     accessorKey: "business_owner",
//     header: "Business Owner",
//     cell: ({ row }) => (
//       <div className="flex justify-center items-center">
//         {row.original.business_owner === true ? (
//         <Store className="w-4 h-4 text-green-500"/>
//         ) : (
//           <div className="w-2 h-2 rounded-full bg-red-500"/>
//         )}
//       </div>
      
//     ),
//   },
//   {
//     accessorKey: "lname",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         Last Name
//         <ArrowUpDown size={14} />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="hidden lg:block max-w-xs truncate">
//         {row.getValue("lname")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "fname",
//     header: ({ column }) => (
//       <div
//         className="flex w-full justify-center items-center gap-2 cursor-pointer"
//         onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//       >
//         First Name
//         <ArrowUpDown size={14} />
//       </div>
//     ),
//     cell: ({ row }) => (
//       <div className="hidden lg:block max-w-xs truncate">
//         {row.getValue("fname")}
//       </div>
//     ),
//   },
//   {
//     accessorKey: "mname",
//     header: ({ column }) => (
      //   <div
      //     className="flex w-full justify-center items-center gap-2 cursor-pointer"
      //     onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      //   >
      //     Middle Name
      //     <ArrowUpDown size={14} />
      //   </div>
      // ),
//   },
//   {
//     accessorKey: "rp_date_registered",
//     header: "Date Registered"
//   },
//   {
//     accessorKey: "action",
//     header: "Action",
//     cell: ({ row }) => {
//       const navigate = useNavigate();
//       const { showLoading, hideLoading } = useLoading();

//       const handleViewClick = async () => {
//         showLoading();
//         try {
//           const personalInfo = await getPersonalInfo(row.original.rp_id);
//           navigate("/resident/view", {
//             state: {
//               params: {
//                 type: 'viewing',
//                 data: {
//                   personalInfo: personalInfo,
//                   residentId: row.original.rp_id,
//                   familyId: row.original.family_no
//                 },
//               }
//             }
//           });
//         } finally {
//           hideLoading();
//         }
//       }
    
//       return (
//         <ViewButton onClick={handleViewClick} />
//       )
//     },
//     enableSorting: false,
//     enableHiding: false,
//   },
// ];

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
          {profiles.map((profile: any, idx: number) => (
            <React.Fragment key={idx}>
              {completed.includes(profile.id) ? (
                <TooltipLayout
                trigger={
                  <profile.icon size={20} 
                    className="text-blue-600"
                  />
                }
                content={profile.tooltip}
              />
              ) : (profile.id !== 'business' &&
                <profile.icon size={20} 
                  className="text-gray-300"
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
      const handleViewClick = async () => {
        navigate("/profiling/resident/view", {
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
        navigate("/profiling/resident/view", {
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
    header: 'Location',
    cell: ({row}) => (
      <p>{row.original.bus_street}, Sitio {row.original.sitio}</p>
    )
  },
  {
    accessorKey: 'bus_gross_sales',
    header: 'Gross Sales'
  },
  {
    accessorKey: 'bus_date_verified',
    header: 'Date Registered'
  },
  {
    accessorKey: "action",
    header: "",
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        navigate("/profiling/business/form", {
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