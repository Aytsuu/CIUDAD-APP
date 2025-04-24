import { Link, useNavigate } from "react-router";
import { ArrowUpDown, CircleAlert, CircleChevronRight, UserRoundCheck, UserRoundX } from "lucide-react";
import { ResidentRecord } from "../profilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Label } from "@/components/ui/label";
import { getPersonalInfo } from "../restful-api/profilingGetAPI";
import { useLoading } from "@/context/LoadingContext";
// Define the columns for the data table
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const residentColumns = (residents: any[]): ColumnDef<ResidentRecord>[] => [
  {
    accessorKey: 'has_account',
    header: '',
    cell: ({ row }) => {
      const account = row.original.has_account

      return (
        <div className="w-7 h-7 flex items-center justify-center">
          {account ? (<UserRoundCheck size={18} className="text-green-500"/>) : (
            <TooltipLayout 
              trigger={
                <Link to="/account/create"
                  state={{
                    params: {
                      residentId: row.original.rp_id
                    }
                  }}
                >
                  <UserRoundX size={18} className="text-red-500"/>
                </Link> 
              }
              content="Account not registered"
            />
          )}
        </div>
      )
    }
  },
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
    accessorKey: "household_no",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Household No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
        const householdNo: string = row.getValue("household_no");
        
        return householdNo ? (<div>{householdNo}</div>) :
        (<div className="flex justify-center items-center">
          <TooltipLayout
              trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
              content="Family not registered"
          />
        </div>)
    },
  },
  {
    accessorKey: "family_no",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Family No.
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
        const familyNo: string = row.getValue("family_no");
        
        return familyNo ? (<div>{familyNo}</div>) :
        (<div className="flex justify-center items-center">
          <TooltipLayout
              trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
              content="Family not registered"
          />
        </div>)
    },
  },
  {
    accessorKey: "sitio_name",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Sitio
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      const sitio: string = row.getValue("sitio_name");
      
      return sitio ? (<div>{sitio}</div>) :
      (<div className="flex justify-center items-center">
        <TooltipLayout
            trigger={<CircleAlert size={24} className="fill-orange-500 stroke-white"/>}
            content="Family not registered"
        />
      </div>)
    },
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
    header: "Middle Name",
  },
  {
    accessorKey: "suffix",
    header: "Suffix"
  },
  {
    accessorKey: "rp_date_registered",
    header: "Date Registered"
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
          const resident = await getPersonalInfo(row.original.rp_id);
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
    enableSorting: false,
    enableHiding: false,
  },
];