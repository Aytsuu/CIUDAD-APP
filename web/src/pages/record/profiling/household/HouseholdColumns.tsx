import { useNavigate } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CircleChevronRight } from "lucide-react";
import { HouseholdFamRecord, HouseholdRecord } from "../profilingTypes";
import { Label } from "@/components/ui/label";
import { useLoading } from "@/context/LoadingContext";
import { getFamFilteredByHouse, getFamilyData, getFamilyMembers, getHouseholdList } from "../restful-api/profilingGetAPI";
import { Badge } from "@/components/ui/badge";

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
        Head
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
    header: 'Date Registered'
  },
  {
    accessorKey: 'registered_by',
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
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const {showLoading, hideLoading} = useLoading();
      const household = {
        hh_id: row.original.hh_id,
        nhts: row.original.nhts,
        head: row.original.head,
        sitio: row.original.sitio,
        street: row.original.street,
        date_registered: row.original.date_registered,
        registered_by: row.original.registered_by
      }

      const handleViewClick = async () => {
        showLoading();
        try {
          const families = await getFamFilteredByHouse(row.original.hh_id);
          navigate("/household/view", {
            state: {
              params: {
                families: families,
                household: household
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
    }
  },
]

// -----------------------------------------------------------------------------------------------------------------------------------------------------------

export const householdFamColumns: ColumnDef<HouseholdFamRecord>[] = [
  {
    accessorKey: 'data',
    header: '',
    cell: ({ row }) => {
      const navigate = useNavigate();
      const { showLoading, hideLoading } = useLoading();
      const family = row.getValue('data') as any;
      
      const handleViewClick = async () => {
        showLoading();
        try {
          const [familyData, members, households] = await Promise.all([
            getFamilyData(family.fam_id),
            getFamilyMembers(family.fam_id),
            getHouseholdList()
          ]);
          
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
          });
        } finally {
          hideLoading();
        }
      };

      return (
        <CardContainer>
          <div className="w-full grid grid-cols-7 items-center justify-center">
            <InfoCell value={<Badge>{family.fam_id}</Badge>}/>
            <InfoCell value={
              <Badge className="bg-black/10 text-black/70 hover:bg-black/10">{family.total_members}</Badge>
            }/>
            <InfoCell value={
              <Badge className="bg-green-500 hover:bg-green-500">{family.fam_building}</Badge>
            }/>      
            <InfoCell value={family.fam_indigenous} />
            <InfoCell value={family.fam_date_registered} />
            <InfoCell value={family.registered_by} />
          </div>
          
          <div className="w-1/12 flex justify-end items-center">
            <ViewButton onClick={handleViewClick} />
          </div>
        </CardContainer>
      );
    }
  },
];
