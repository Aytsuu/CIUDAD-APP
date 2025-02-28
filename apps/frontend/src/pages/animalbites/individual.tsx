import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
import ReferralFormModal from "@/pages/animalbites/referralform";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Link } from "react-router-dom";

// Define Patient Type
type Patient = {
  id: number;
  fname: string;
  lname: string;
  age: string;
  gender: string;
  date: string;
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
    siteOfExposure: "Feet",
    bitingAnimal: "Cat",
    actions: "Wound Cleaned",
  },
  {
    id: 2,
    fname: "Bane",
    lname: "Gil",
    age: "30",
    gender: "Male",
    date: "2024-02-08",
    exposure: "Bite",
    siteOfExposure: "Hand",
    bitingAnimal: "Dog",
    actions: "Wound Cleaned, Medicine Given",
  },
  {
    id: 3,
    fname: "Lena",
    lname: "Smith",
    age: "28",
    gender: "Female",
    date: "2024-02-10",
    exposure: "Bite",
    siteOfExposure: "Leg",
    bitingAnimal: "Monkey",
    actions: "Antibiotic Given",
  },
];

function AnimalBites() {
  const [patients, setPatients] = useState<Patient[]>(samplePatients);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState("");

  // Define Columns for DataTable
  const columns: ColumnDef<Patient>[] = [
    {
      accessorKey: "fullName",
      header: "Patient",
      cell: ({ row }) => {
        const { fname, lname } = row.original;
        return `${lname}, ${fname}`;
      },
    },
    { accessorKey: "age", header: "Age" },
    { accessorKey: "gender", header: "Gender" },
    { accessorKey: "date", header: "Date" },
    { accessorKey: "exposure", header: "Exposure" },
    { accessorKey: "siteOfExposure", header: "Site of Exposure" },
    { accessorKey: "bitingAnimal", header: "Biting Animal" },
    { accessorKey: "actions", header: "Actions taken" },
    {
      accessorKey: "button",
      header: "",
      cell: ({ }) => (
        <div className="flex justify-center">
          <Link to={`/Animalbite_individual/`}>
            <Button variant="outline" className="">
              View details
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  // Function to add a new patient
  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prevPatients) => [...prevPatients, newPatient]);
  };

  // Function to handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredPatients = patients.filter((patient) => {
    const searchString = `${patient.fname} ${patient.lname} ${patient.age} ${patient.gender} ${patient.date} ${patient.exposure} ${patient.siteOfExposure} ${patient.bitingAnimal}`.toLowerCase();
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
              Manage and view patients information
          </p>
      </div>
      <hr className="border-gray mb-5 sm:mb-8" />

      {/* Search, Filter & Button Section */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
        <div className="flex flex-1 gap-4 w-full">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>

          {/* Filter Dropdown */}
          <div className="w-48">
            <SelectLayout
              placeholder="Filter by Exposure"
              label=""
              className="bg-white border-gray-300 w-full"
              options={[
                { id: "All", name: "All" },
                { id: "Bite", name: "Bite" },
                { id: "Scratch", name: "Scratch" },
              ]}
              value={filterValue}
              onChange={(value) => setFilterValue(value)}
            />
          </div>
        </div>

        {/* New Record Button */}
        <div className="flex justify-end w-full sm:w-auto">
          <DialogLayout
            trigger={<Button className="font-medium py-2 px-4 rounded-md shadow-sm">New Record</Button>}
            className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
            mainContent={<ReferralFormModal
              onAddPatient={handleAddPatient}
              onClose={() => console.log("Closing modal")} />} title={""} description={""} />
        </div>
      </div>

      {/* Table Container */}
      <div className="h-full w-full rounded-md">
        <div className="w-full h-auto sm:h-16 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 gap-3 sm:gap-0">
          <div className="flex gap-x-2 items-center">
            <p className="text-xs sm:text-sm">Show</p>
            <Input type="number" className="w-14 h-8" defaultValue="10" />
            <p className="text-xs sm:text-sm">Entries</p>
          </div>

        </div>
        <div className="bg-white w-full overflow-x-auto">
          {/* Table Placement */}
          <DataTable columns={columns} data={filteredPatients} />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
          {/* Showing Rows Info */}
          <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
            Showing 1-10 of 150 rows
          </p>

          {/* Pagination */}
          <div className="w-full sm:w-auto flex justify-center">
            <PaginationLayout className="" />
          </div>
        </div>
      </div>
    </div>
    
  );
}

export default AnimalBites;