import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { Eye, Search, Trash } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

// Define Patient Type
type Patient = {
  id: number;
  fname: string;
  lname: string;
  gender: string;
  age: string;
  date: string;
  transient: boolean;
  exposure: string;
  siteOfExposure: string;
  bitingAnimal: string;
  actions: string;
};

// Sample Data
const samplePatients: Patient[] = [
  {
    id: 1,
    fname: "Jane",
    lname: "Bil",
    age: "25",
    gender: "Female",
    date: "2024-02-06",
    exposure: "Non-bite",
    transient: true,
    siteOfExposure: "Feet",
    bitingAnimal: "Cat",
    actions: "Wound Cleaned",
  },
  {
    id: 2,
    fname: "Kurt",
    lname: "Cobain",
    age: "25",
    gender: "Male",
    date: "2024-02-06",
    exposure: "Non-bite",
    transient: true,
    siteOfExposure: "Feet",
    bitingAnimal: "Cat",
    actions: "Wound Cleaned",
  },
];

function AnimalBites() {
  const [patients, setPatients] = useState<Patient[]>(samplePatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Define Columns for DataTable
  const columns: ColumnDef<Patient>[] = [
    { accessorKey: "id", header: "#" },
    {
      accessorKey: "fullName",
      header: "Patient",
      cell: ({ row }) => {
        const patient = row.original;
        const fullName = `${patient.lname}, ${patient.fname}`;
        return (
          <div className="flex justify-start min-w-[200px] px-2">
            <div className="flex flex-col w-full">
              <div className="font-medium truncate">{fullName}</div>
              <div className="text-sm text-darkGray">
                {patient.gender}, {patient.age} years old
              </div>
            </div>
          </div>
        );
      },
    },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "exposure", header: "Exposure" },
    { accessorKey: "siteOfExposure", header: "Site of Exposure" },
    {
      accessorKey: "transient",
      header: "Transient",
      cell: ({ row }) => (row.original.transient ? "Yes" : "No"),
    },
    { accessorKey: "bitingAnimal", header: "Biting Animal" },
    { accessorKey: "actions", header: "Actions Taken" },
    {
      accessorKey: "actionsMenu",
      header: "Actions",
      cell: ({ row }) => (
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

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filtering logic
  const filteredPatients = patients.filter((patient) => {
    const searchString = `${patient.fname} ${patient.lname} ${patient.age} ${patient.gender} ${patient.date} ${patient.exposure} ${patient.siteOfExposure} ${patient.transient} ${patient.bitingAnimal}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header Section */}
      <div className="flex-col items-center mb-4">
        <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
          Animal Bite Records
        </h1>
        <p className="text-xs sm:text-sm text-darkGray">
          Manage and view patient information
        </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Search, Filter & Button Section */}
      <div className="relative w-full hidden lg:flex justify-between items-center mb-4">
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <div className="flex gap-x-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black"
                size={17}
              />
              <Input
                placeholder="Search..."
                className="pl-10 w-72 bg-white"
                value={searchQuery}
                onChangeCapture={handleSearchChange}
              />
            </div>

            <SelectLayout
              placeholder="Filter by"
              label=""
              className="w-full md:w-[200px] bg-white"
              options={[
                { id: "All", name: "All" },
                { id: "Bite", name: "Bite" },
                { id: "Non-bite", name: "Non-bite" },
              ]}
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
            />
          </div>
        </div>

        {/* New Record Button */}
        <div className="flex justify-end">
          <Button className="font-medium py-2 px-4 rounded-md shadow-sm">
            New Record
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        <div className="w-full bg-white overflow-x-auto">
          <DataTable columns={columns} data={filteredPatients} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-{filteredPatients.length} of {filteredPatients.length} rows
          </p>
        </div>
      </div>
    </div>
  );
}

export default AnimalBites;
