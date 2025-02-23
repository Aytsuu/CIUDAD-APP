import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ChrRecords = {
  id: number;
  // patientName: string;
  patient: {
    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    age: number;
    ageTime: string;
  };
  address: string;
  purok: string;
  type: string;
};
const columns: ColumnDef<ChrRecords>[] = [
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
    accessorKey: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const patient = row.original.patient;
      const fullName = `${patient.lastName}, ${patient.firstName} ${patient.middleName}`.trim();
      
      return (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">
              {fullName}
            </div>
            <div className="text-sm text-darkGray">
              {patient.gender}, {patient.age} {patient.ageTime} old
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="flex justify-start min-w-[200px] px-2">
        <div className="w-full truncate">
          {row.original.address}
        </div>
      </div>
    )
  },
  {
    accessorKey: "purok",
    header: "Purok",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[120px] px-2">
        <div className="text-center w-full">
          {row.original.purok}
        </div>
      </div>
    )
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex justify-center min-w-[100px] px-2">
        <div className="text-center w-full">
          {row.original.type}
        </div>
      </div>
    )
  },
  
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex gap-2 justify-center min-w-[120px]">
        <Button
          variant="outline"
          className="hover:bg-blue-50"
          onClick={() => console.log("View record:", row.original.id)}
        >
          View 
        </Button>
      </div>
    ),
  },
];

export const sampleData: ChrRecords[] = [
  {
    id: 1,

    patient: {
      lastName: "Caballes",
      firstName: "Katrina Shin",
      middleName: "Dayuja",
      gender: "Female",
      age: 10,
      ageTime: "yr",
    },
    address: "BOnsai Bolinawan Carcar City",
    purok: "Bolinawan",
    type: "transient"
  },

  {
    id: 2,

    patient: {
      lastName: "Caballes",
      firstName: "Katrina",
      middleName: "Dayuja",
      gender: "Female",
      age: 10,
      ageTime: "yr",
    },
    address: "BOnsai Bolinawan Carcar City",
    purok: "Bolinawan",
    type: "transient"
    
  },

  {
    id: 3,

    patient: {
      lastName: "Caballes",
      firstName: "Katrina",
      middleName: "Dayuja",
      gender: "Female",
      age: 10,
      ageTime: "yr",
    },
    address: "BOnsai Bolinawan Carcar City",
    purok: "Bolinawan",
    type: "transient"
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
      title="Categories"
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

export default function AllMedicalConRecords() {
  const [searchTerm, setSearchTerm] = useState("");

  const data = sampleData;

  return (


<div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
        Medical Consultation Records
          </CardTitle>

        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Left Side: Search Input and Category Filter */}
            <div className="flex flex-col md:flex-row gap-4 w-full relative">
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

            {/* Right Side: Add New Record Button */}
            <div className="w-full md:w-auto">
              <Button className=" w-full md:w-auto">
                New Record
              </Button>
            </div>
          </div>

          <DataTable columns={columns} data={data} />
        </div>
      </CardContent>
    </div>

   
  );
}