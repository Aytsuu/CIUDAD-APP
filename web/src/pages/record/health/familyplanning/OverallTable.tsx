import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { SelectLayout } from "@/components/ui/select/select-layout";

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
  const [patients, setPatients] = useState<FamPlanningPatient[]>(samplePatients);
  const [searchQuery, setSearchQuery] = useState("");

  // Table Columns
  const columns: ColumnDef<FamPlanningPatient>[] = [
    {
      accessorKey: "id",
      header: "#",
      cell: ({ row }) => (
        <div className="flex justify-center">
          <div className="bg-lightBlue text-darkBlue1 px-3 py-1 rounded-md w-8 text-center font-semibold">
            {row.original.id}
          </div>
        </div>
      ),
    },
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
      accessorKey: "action",
      header: "Action",
      cell: () => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <div className="bg-white hover:bg-[#f3f2f2] border text-black px-4 py-2 rounded cursor-pointer">
                <Eye size={15} />
              </div>
            }
            content="View"
          />

          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-[#ff2c2c] hover:bg-[#ff4e4e] text-white px-4 py-2 rounded cursor-pointer">
                    <Trash size={16} />
                  </div>
                }
                className=""
                mainContent={<></>}
              />
            }
            content="Delete"
          />
        </div>
      ),
    },
  ];
  const [selectedFilter, setSelectedFilter] = useState("all");
  // Function to add a new patient
  const handleAddPatient = (newPatient: FamPlanningPatient) => {
    setPatients((prevPatients) => [...prevPatients, newPatient]);
  };

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
  <div className="flex flex-col md:flex-row gap-4 w-full">
    <div className="flex gap-x-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
          size={17}
        />
        <Input
          placeholder="Search..."
          className="pl-10 w-72 bg-white"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Filter Dropdown */}
      <SelectLayout
        className="w-full md:w-[200px] bg-white"
        label=""
        placeholder="Select"
        options={[
          { id: "All", name: "All" },
          { id: "Resident", name: "Resident" },
          { id: "Non-Resident", name: "Non-Resident" },
        ]}
        value={selectedFilter}
        onChange={setSelectedFilter}
      />
    </div>
  </div>


        {/* New Record Button */}
        <div className="flex justify-end">
          <Link to={`/FamPlanning_main/`}>
            <Button variant="default">New record</Button>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
        <div className="flex gap-x-2 items-center">
          <p className="text-xs sm:text-sm">Show</p>
          <Input type="number" className="w-14 h-8" defaultValue="10" />
          <p className="text-xs sm:text-sm">Entries</p>
        </div>
      </div>

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
        <div className="w-full sm:w-auto flex justify-center"></div>
      </div>
    </div>
  );
}

export default FamPlanningTable;
