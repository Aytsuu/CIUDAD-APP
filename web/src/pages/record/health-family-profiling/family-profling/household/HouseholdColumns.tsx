import { useNavigate } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { HouseholdFamRecord, HouseholdRecord } from "../../../profiling/ProfilingTypes";
import { useLoading } from "@/context/LoadingContext";
import ViewButton from "@/components/ui/view-button";
import { Combobox } from "@/components/ui/combobox";
import React from "react";
import { useFamFilteredByHouseHealth } from "../queries/profilingFetchQueries";
import { formatFamiles } from "../../../profiling/ProfilingFormats";
import { formatDate } from "@/helpers/dateHelper";

// Define the columns for household the data tables
// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const householdColumns: ColumnDef<HouseholdRecord>[] = [
  {
    accessorKey: 'hh_id',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
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
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Families
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => {
      const { showLoading, hideLoading } = useLoading();
      const { data: famFilteredByHouse, isLoading } = useFamFilteredByHouseHealth(row.getValue('hh_id'));
      const formattedFamilies = React.useMemo(() => formatFamiles(famFilteredByHouse), [famFilteredByHouse]);

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
          placeholder="Search member"
          emptyMessage="No resident found"
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
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
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
  },
  {
    accessorKey: 'head',
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Owner
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
        <div className="flex gap-4 justify-center items-center">
          {row.original.head}
        </div>
    )
  },
  {
    accessorKey: 'date_registered',
    header: 'Date Registered',
    cell: ({row}) => (
      formatDate(row.original.date_registered, "long" as any)
    )
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const handleViewClick = async () => {
        // const families = await getFamFilteredByHouse(row.original.hh_id);
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

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const householdFamColumns: ColumnDef<HouseholdFamRecord>[] = [
  {
    accessorKey: "fam_id",
    header: "Family ID"
  },
  {
    accessorKey: "total_members", 
    header: "No of Members"
  },
  {
    accessorKey: "fam_building", 
    header: "Household Occupancy"
  },
  {
    accessorKey: "fam_indigenous", 
    header: "Indigenous"
  },
  {
    accessorKey: "fam_date_registered", 
    header: "Date Registered",
    cell: ({row}) => (
      formatDate(row.original.fam_date_registered, "long" as any)
    )
  },
  {
    accessorKey: "action", 
    header: "Action",
    cell: ({row}) => {
      const navigate = useNavigate();
      const handleClickView = () => {
        navigate("/profiling/family/view", {
          state: {
            params: {
              fam_id: row.original.fam_id
            }
          }
        })
      }

      return (
        <ViewButton onClick={handleClickView} />
      )
    }
  },
];