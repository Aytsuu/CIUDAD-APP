import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
// import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

type FamPlanningPatient = {
  id: number;
  fname: string;
  lname: string;
  age: string;
  address: string;
  purok: string;
  type: string;
  createdAt: string;
};

// Sample Data
const samplePatients: FamPlanningPatient[] = [
  {
    id: 1,
    fname: "Jane",
    lname: "Bil",
    age: "25",
    address: "Feet",
    purok: "Cat",
    type: "Resident",
    createdAt: "2024-02-06",
  },
  {
    id: 2,
    fname: "John",
    lname: "Doe",
    age: "30",
    address: "Legs",
    purok: "Sibuyas",
    type: "Non-Resident",
    createdAt: "2024-02-07",
  },
];

function FamPlanningTable() {
  const [patients] = useState<FamPlanningPatient[]>(samplePatients);
  const [searchQuery, setSearchQuery] = useState("");

  // Table Columns
  const columns: ColumnDef<FamPlanningPatient>[] = [
    {
      accessorKey: "fullName",
      header: "Patient",
      cell: ({ row }) => {
        const { fname, lname } = row.original;
        return `${lname}, ${fname}`;
      },
    },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "purok", header: "Purok" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "createdAt", header: "Created At" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <Link to={`/FamPlanning_view/${row.original.id}`}>
            <Button variant="outline">View</Button>
          </Link>
        </div>
      ),
    },
  ];

  // Function to add a new patient
  // const handleAddPatient = (newPatient: FamPlanningPatient) => {
  //   setPatients((prevPatients) => [...prevPatients, newPatient]);
  // };

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter patients based on search query
  const filteredPatients = patients.filter((patient) => {
    const searchString = `${patient.fname} ${patient.lname} ${patient.age} ${patient.address} ${patient.purok} ${patient.type} ${patient.createdAt}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Family Planning Records
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view family planning records
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />

      {/* Search & New Record Button */}
      <div className="relative w-full flex justify-between items-center mb-4">
        {/* Search Input */}
        <div className="flex gap-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 w-72 bg-white"
              value={searchQuery}
              onChangeCapture={handleSearchChange}
            />
          </div>
        </div>

        {/* New Record Button */}
        <div className="flex justify-end">
        <Link to={`/FamPlanning_form/`}>
            <Button variant="default">New record</Button>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="h-full w-full rounded-md bg-white p-4">
        {/* Table */}
        <div className="bg-white w-full overflow-x-auto">
          <DataTable columns={columns} data={filteredPatients} />
        </div>

        {/* Pagination & Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-{filteredPatients.length} of {patients.length} records
          </p>

          {/* Pagination */}
          <div className="w-full sm:w-auto flex justify-center">
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default FamPlanningTable;
