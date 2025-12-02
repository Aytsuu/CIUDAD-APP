import { useNavigate } from "react-router";
import { ArrowUpDown } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import ViewButton from "@/components/ui/view-button";
import { Badge } from "@/components/ui/badge";
import { ResidentRecord, ResidentFamilyRecord, ResidentBusinessRecord, ResidentHouseholdRecord } from "../ProfilingTypes";
import { calculateAge } from "@/helpers/ageCalculator";
import { useLinkToVoter } from "../queries/profilingUpdateQueries";
import { showErrorToast } from "@/components/ui/toast";
import { formatCurrency } from "@/helpers/currencyFormat";
import { formatDate } from "@/helpers/dateHelper";
import React from "react";
import { Combobox } from "@/components/ui/combobox";
import { useLoading } from "@/context/LoadingContext";
import { useFamFilteredByHouse } from "../queries/profilingFetchQueries";
import { formatFamilies } from "../ProfilingFormats";

// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const residentColumns: ColumnDef<ResidentRecord>[] = [
  {
    accessorKey: "rp_id",
    header: ({ column }) => (
      <div
        className="flex w-full items-center gap-2 cursor-pointer"
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
        className="flex w-full items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Last Name
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="hidden lg:block max-w-xs truncate">
        {`${row.original.lname}${row.original.suffix ? (' ' + row.original.suffix) : ''}`}
      </div>
    ),
  },
  {
    accessorKey: "fname",
    header: ({ column }) => (
      <div
        className="flex w-full items-center gap-2 cursor-pointer"
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
        className="flex w-full items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Middle Name
        <ArrowUpDown size={14} />
      </div>
    ),
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
    size: 70
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
        case "LINK":
          return (
            <div className="flex justify-center">
              <div className="bg-green-500 px-5 py-1 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                onClick={link}
              >
                <p className="text-white font-medium">{status}</p>
              </div>
            </div>
          )
        case "REVIEW":
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
    },
    size: 70
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

export const houseDetailsColumns = (): ColumnDef<ResidentHouseholdRecord>[] => [
  {
    accessorKey: 'hh_id',
    header: ({ column }) => (
      <div
        className="flex w-full items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Household No.
        <ArrowUpDown size={14} />
      </div>
    ),
  },
  {
    accessorKey: 'total_families',
    header: ({ column }) => (
      <div
        className="flex w-full items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Families
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      const { showLoading, hideLoading } = useLoading();
      const { data: famFilteredByHouse, isLoading } = useFamFilteredByHouse(row.getValue('hh_id'));
      const formattedFamilies = React.useMemo(() => formatFamilies(famFilteredByHouse), [famFilteredByHouse]);

      React.useEffect(() => {
        if(isLoading) {
          showLoading();
        } else {
          hideLoading();
        }
      }, [isLoading])

      return (
        <Combobox 
          options={formattedFamilies}
          value={row.getValue('total_families')}
          placeholder="Search family"
          emptyMessage="No family found"
          staticVal={true}
          size={300}
        />
      )
    }
  },
  {
    accessorKey: 'sitio',
    header: ({ column }) => (
      <div
        className="flex w-full items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sitio
        <ArrowUpDown size={14} />
      </div>
    ),
  },  
  {
    accessorKey: 'street',
    header: 'Street Address',
  },
  {
    accessorKey: 'nhts',
    header: 'NHTS',
    size: 100
  },
  {
    accessorKey: 'date_registered',
    header: 'Registered',
    cell: ({row}) => (
      formatDate(row.original.date_registered, "short" as any)
    )
  },
  {
    accessorKey: 'action',
    header: '',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        navigate("/profiling/household/view", {
          state: {
            params: {
              hh_id: row.original.hh_id
            }
          }
        })
        
      }
      return (
        <ViewButton onClick={handleViewClick} />
      ) 
    }
  },
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