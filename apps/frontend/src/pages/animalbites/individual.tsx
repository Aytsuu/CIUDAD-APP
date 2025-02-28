import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
import ReferralFormModal from "@/pages/animalbites/referralform"; // Import Form Modal
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SelectLayout } from "@/components/ui/select/select-layout";

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

// Define Columns for DataTable
export const columns: ColumnDef<Patient>[] = [
  { accessorKey: "lname", header: "Last Name" },
  { accessorKey: "fname", header: "First Name" },
  { accessorKey: "age", header: "Age" },
  { accessorKey: "gender", header: "Gender" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "exposure", header: "Exposure" },
  { accessorKey: "siteOfExposure", header: "Site of Exposure" },
  { accessorKey: "bitingAnimal", header: "Biting Animal" },
  { accessorKey: "actions", header: "Actions" },
];

// Sample Data
const samplePatients: Patient[] = [
  {
    id: 1,
    fname: "Jane",
    lname: "Bil",
    age: "25",
    gender: "Female",
    date: "2024-02-06",
    exposure: "Scratch",
    siteOfExposure: "Feet",
    bitingAnimal: "Cat",
    actions: "Wound Cleaned, Vaccine Given",
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
    actions: "Antibiotics Given",
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
    actions: "Antibiotics Given",
  },
  
];

function AnimalBites() {
  const [patients, setPatients] = useState<Patient[]>(samplePatients); // State for patient data

  // Function to add a new patient
  const handleAddPatient = (newPatient: Patient) => {
    console.log("Received new patient in parent:", newPatient); // Debugging log
    setPatients((prevPatients) => [...prevPatients, newPatient]);
  };

  return (
    <div className="w-full h-full bg-gray-100 flex flex-col justify-center items-center">
      {/* Container */}
      <div className="w-full h-full flex flex-col">
        <div className="w-full h-full bg-white border border-gray-300 rounded-lg p-5 shadow-md">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Animal Bites Records</h1>
          </div> 
          
          {/* Search, Filter & Button Section */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 items-center">
            <div className="flex flex-1 gap-4 w-full">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
                <Input placeholder="Search..." className="pl-10 w-full bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500" />
              </div>

              {/* Filter Dropdown */}
              <div className="w-48">
                <SelectLayout 
                  placeholder="Filter by"
                  label=""
                  className="bg-white border-gray-300 w-full"
                  options={[]}
                  value=""
                  onChange={() => {}}
                />
              </div>
            </div>

            {/* New Record Button */}
            <div className="flex justify-end w-full sm:w-auto">
              <DialogLayout
                trigger={<Button className="font-medium py-2 px-4 rounded-md shadow-sm">New Record</Button>}
                className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"
                mainContent={
                  <ReferralFormModal
                    onAddPatient={handleAddPatient}
                    onClose={() => console.log("Closing modal")} // Ensure modal closes
                  />
                }
                title={""}
                description={""}
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto">
            <DataTable columns={columns} data={patients} /> {/* Use the state variable */}
          </div>
        </div>

        {/* Pagination */}
        
          <PaginationLayout className="text-sm mt-4 justify-end" />
        
      </div>
    </div>
  );
}

export default AnimalBites;