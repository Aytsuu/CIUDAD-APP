import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import PaginationLayout from "@/components/ui/pagination/pagination-layout";
import { Button } from "@/components/ui/button";
import ReferralFormModal from "@/pages/animalbites/referralform"; // Import Form Modal
import DialogLayout from "@/components/ui/dialog/dialog-layout";

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
];

function AnimalBites() {
  const [patients, setPatients] = useState<Patient[]>(samplePatients); // State for patient data

  const handleAddPatient = (newPatient: Patient) => {
    setPatients((prevPatients) => [...prevPatients, newPatient]); 
  };

  return (
    <div className="w-screen h-screen bg-gray-100  flex flex-col justify-center items-center">
      <div className="w-[80%] h-4/5 flex flex-col">
        <div className="w-full h-full bg-white border border-gray-300 rounded-lg p-5 shadow-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Animal Bites Records</h1>

            {/* Dialog Button */}
            <DialogLayout
              trigger={<Button className="bg-green-600 hover:bg-green-800 text-white text-sm font-medium">
                New Record
              </Button>}
              className="max-w-full sm:max-w-[50%] h-full sm:h-2/3 flex flex-col overflow-auto"


              mainContent={<ReferralFormModal
                onAddPatient={handleAddPatient} // Handle new patient addition
                onClose={function (): void {
                  throw new Error("Function not implemented.");
                } } />} title={""} description={""}            />
          </div>

          {/* Data Table */}
          <DataTable columns={columns} data={patients} /> {/* Use the state variable */}
        </div>
      </div>

      {/* Pagination */}
      <PaginationLayout className="text-sm mt-4" />
    </div>
  );
}

export default AnimalBites;
