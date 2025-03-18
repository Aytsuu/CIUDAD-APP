import { BsChevronLeft } from "react-icons/bs";
import { Link } from "react-router";
import { Input } from "@/components/ui/input";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { ArrowUpDown, Search } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";

// Define the type for the Report object
type Report = {
  id: string;
  category: string;
  location: string;
  description: string;
  incidentTime: string;
  reportedBy: string;
  timeReported: string;
  date: string;
};

// Define the columns for the data table
export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: "category",
    header: ({ column }) => (
      <div
        className="flex w-full justify-center items-center gap-2 cursor-pointer"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Category
        <ArrowUpDown size={14} />
      </div>
    ),
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("category")}</div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
  },
  {
    accessorKey: "description",
    header: "Description",
    // Hide description on small screens
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate">
        {row.getValue("description")}
      </div>
    ),
  },
  {
    accessorKey: "incidentTime",
    header: "Time of Incident",
  },
  {
    accessorKey: "reportedBy",
    header: "Reported By",
  },
  {
    accessorKey: "timeReported",
    header: "Time Reported",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Link to='/resident-information'>
        <Button>
          View
        </Button>
      </Link>
    ),
    enableSorting: false,
    enableHiding: false,
  },
];

// Sample data for the reports
export const reports: Report[] = [
  {
    id: "Lorem",
    category: "Lorem",
    location: "Lorem",
    description: "Lorem",
    incidentTime: "Lorem",
    reportedBy: "Lorem",
    timeReported: "Lorem",
    date: "Lorem",
  },
  {
    id: "Lorem",
    category: "Aorem",
    location: "Lorem",
    description: "Lorem",
    incidentTime: "Lorem",
    reportedBy: "Lorem",
    timeReported: "Lorem",
    date: "Lorem",
  },
];

export default function ProfilingRequest() {
  const data = reports;
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        {/* Header - Stacks vertically on mobile */}
        <Button 
          className="text-black p-2 self-start"
          variant={"outline"}
          onClick={() => navigate(-1)}
        >
          <BsChevronLeft />
        </Button>
        <div className="flex flex-col">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Awaiting Approval
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Submissions under review and pending authorization
          </p>
        </div>  
      </div>

      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Search and filters - Stacks on mobile */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-x-2 mb-4">
        <div className="relative flex w-full sm:w-auto bg-white">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17}/>
          <Input placeholder="Search..." className="pl-10 w-full sm:w-72" />
        </div>

        <div className="flex gap-2 sm:gap-x-2">
          <SelectLayout 
              placeholder="Filter by"
              label=""
              className="bg-white"
              options={[]}
              value=""
              onChange={() => {}}
          />
        </div>
      </div>

      {/* Table Layout */}
      <div className="mt-2 sm:mt-4 overflow-x-auto">
        <div className="w-full h-auto bg-white p-3">
            <div className="flex gap-x-2 items-center">
                <p className="text-xs sm:text-sm">Show</p>
                    <Input type="number" className="w-14 h-8" defaultValue="10" />
                <p className="text-xs sm:text-sm">Entries</p>
            </div>
        </div>

        {/* Wrap the DataTable in a scrollable container */}
        <div className="min-w-full overflow-hidden overflow-x-auto bg-white">
          <DataTable columns={columns} data={data} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-10 of 150 rows
          </p>

          {/* Pagination */}
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout />
          </div>
        </div>
      </div>
    </div>
  );
}
