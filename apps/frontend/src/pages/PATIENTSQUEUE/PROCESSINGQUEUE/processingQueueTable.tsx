import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import VaccinationForm from "./vaccinationModal";

type ProcessingQueueRec = {
  id: string;
  patient: {
    firstName: string;
    lastName: string;
    middlename: string;
    gender: string;
    age: number;
  };
  address: string;
  service: string;
  date: string;
};

export const sampledata: ProcessingQueueRec[] = [
  {
    id: "1",
    patient: {
      firstName: "Juan",
      lastName: "Dela Cruz",
      middlename: "Santos",
      gender: "F",
      age: 20,
    },
    address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
    service: "Vaccination",
    date: "2022-01-01",
  },
  {
    id: "2",
    patient: {
      firstName: "Maria",
      lastName: "Santos",
      middlename: "Dela Cruz",
      gender: "F",
      age: 25,
    },
    address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
    service: "Prenatal",
    date: "2022-01-01",
  },
  {
    id: "3",
    patient: {
      firstName: "Pedro",
      lastName: "Penduko",
      middlename: "Santos",
      gender: "M",
      age: 30,
    },
    address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
    service: "Postpartum",
    date: "2022-01-01",
  },
  {
    id: "4",
    patient: {
      firstName: "Ana",
      lastName: "Perez",
      middlename: "Santos",
      gender: "F",
      age: 5,
    },
    address: "Brgy. San Isidro, San Jose City, Nueva Ecija",
    service: "Child",
    date: "2022-01-01",
  },
];

const columns: ColumnDef<ProcessingQueueRec>[] = [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-lightBlue text-darkBlue1 w-auto px-3 py-1 rounded-md text-center font-semibold">
          {row.original.id}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "patient",
    header: () => <div className="text-center">Patient</div>, // Center-align header
    cell: ({ row }) => {
      const patient = row.original.patient;
      const fullName =
        `${patient.lastName}, ${patient.firstName} ${patient.middlename}`.trim();

      return (
        <div className="flex flex-col items-center text-center">
          {" "}
          {/* Center-align cell content */}
          <div className="font-medium whitespace-normal">{fullName}</div>
          <div className="text-sm text-darkGray">
            {patient.gender}, {patient.age} yr old
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "service",
    header: "Service",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const service = row.original.service;

      return (
        <div className="flex gap-2 justify-center min-w-[120px] px-2">
          <TooltipLayout
            trigger={
              <div>
                {service === "Vaccination" ? (
                  <VaccinationForm />
                ) : service === "Prenatal" ? (
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700"
                    onClick={() => console.log("Prenatal record:", row.original.id)}
                    style={{ pointerEvents: 'none' }}
                  >
                     <Check/>
                  </Button>
                ) : service === "Postpartum" ? (
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700"
                    onClick={() => console.log("Postpartum record:", row.original.id)}
                    style={{ pointerEvents: 'none' }}
                  >
                    <Check/>
                  </Button>
                ) : service === "Child" ? (
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700"
                    onClick={() => console.log("Child record:", row.original.id)}
                    style={{ pointerEvents: 'none' }}
                  >
                     <Check/>
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700"
                    onClick={() => console.log("Unknown service:", row.original.id)}
                    style={{ pointerEvents: 'none' }}
                  >
                     <Check/>
                  </Button>
                )}
              </div>
            }
            content="Assess"
          />
        </div>
      );
    },
  },
];

const categoryOptions = [
  { id: "electronics", label: "Electronics", checked: false },
  { id: "fashion", label: "Fashion", checked: false },
  { id: "home", label: "Home", checked: false },
];

function CategoryFilter() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategoryChange = (id: string, checked: boolean) => {
    setSelectedCategories((prev) =>
      checked ? [...prev, id] : prev.filter((category) => category !== id)
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
  };

  return (
    <FilterAccordion
      title="Filter"
      options={categoryOptions.map((option) => ({
        ...option,
        checked: selectedCategories.includes(option.id),
      }))}
      selectedCount={selectedCategories.length}
      onChange={handleCategoryChange}
      onReset={handleReset}
    />
  );
}

export default function ProcessingQueueTable() {
  const data = sampledata;

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <CardHeader className="border-b  ">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-2xl font-semibold pl-4 border-l-8 border-blue">
            Processing Queue
          </CardTitle>
        </div>
      </CardHeader>
      <div className="flex flex-col md:flex-row gap-4 w-full relative pt-10 pb-5">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto md:absolute md:left-1/3 md:ml-4 z-30">
          <CategoryFilter />
        </div>
      </div>
      <CardContent className="pt-6">
        <DataTable columns={columns} data={data} />
      </CardContent>
    </div>
  );
}