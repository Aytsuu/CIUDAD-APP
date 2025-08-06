import { useNavigate } from "react-router";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { HouseholdFamRecord, HouseholdRecord } from "../ProfilingTypes";
import { Label } from "@/components/ui/label";
import { useLoading } from "@/context/LoadingContext";
import { getFamFilteredByHouse, getFamilyData, getFamilyMembers, getHouseholdList } from "../restful-api/profilingGetAPI";
import { Badge } from "@/components/ui/badge";
import ViewButton from "@/components/ui/view-button";
import { Combobox } from "@/components/ui/combobox";
import React from "react";
import { useFamFilteredByHouse } from "../queries/profilingFetchQueries";
import { formatFamiles } from "../ProfilingFormats";
import { Button } from "@/components/ui/button/button";
import DropdownLayout from "@/components/ui/dropdown/dropdown-layout";
import { capitalize } from "@/helpers/capitalize";
import { useUpdateFamily } from "../queries/profilingUpdateQueries";
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
      const { data: famFilteredByHouse, isLoading } = useFamFilteredByHouse(row.getValue('hh_id'));
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
    header: 'Date Registered',
    cell: ({row}) => (
      formatDate(row.original.date_registered, "long")
    )
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
        head_id: row.original.head_id,
        sitio: row.original.sitio,
        street: row.original.street,
        date_registered: row.original.date_registered,
        registered_by: row.original.registered_by
      }

      const handleViewClick = async () => {
        showLoading();
        try {
          const families = await getFamFilteredByHouse(row.original.hh_id);
          navigate("/profiling/household/view", {
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
        <ViewButton onClick={handleViewClick} />
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
      const { mutateAsync: updateFamily } = useUpdateFamily();
      const family = row.getValue('data') as any;
      const [building, setBuilding] = React.useState<string | null>(family.fam_building);
      
      const handleViewClick = async () => {
        showLoading();
        try {
          const [familyData, members, households] = await Promise.all([
            getFamilyData(family.fam_id),
            getFamilyMembers(family.fam_id),
            getHouseholdList()
          ]);
          
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
          });
        } finally {
          hideLoading();
        }
      };

      const handleBuildingChange = (value: string) => {
        if(value !== building?.toLowerCase()){
          setBuilding(capitalize(value));

          const data = {
            fam_building: capitalize(value),
          }
          updateFamily({
            data: data,
            familyId: family.fam_id,
            oldHouseholdId: ""
          }, {
            onError: () => {
              setBuilding(family.fam_building);
            }
          })
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
              <DropdownLayout
                trigger={<Button className="w-full h-6">{building} </Button>}
                options={[
                  {id: "owner", name: "Owner"}, 
                  {id: "renter", name: "Renter"},
                  {id: "other", name: "Other"}
                ]}
                onSelect={handleBuildingChange}
              />
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
