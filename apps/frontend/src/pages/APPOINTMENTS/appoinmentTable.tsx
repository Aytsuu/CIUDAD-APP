import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Pencil, Trash, Eye, Plus, Stamp, Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog/dialog"

type appointmentRecords = {
  id: string;
  patient: {
    firstName: string;
    lastName: string;
    middleName: string;
    gender: string;
    age: number;
    ageTime: string;
  };
  address: string;
  services: string;
  dateAppointed: string;
  appointment: string;
};

const sampleData: appointmentRecords[] = [
  {
    id: "S133",
    patient: {
      lastName: "Caballes",
      firstName: "Katrina Shin",
      middleName: "Dayuja",
      gender: "Female",
      age: 10,
      ageTime: "yr",
    },
    address: "BOnsai Bolinawan Carcar City",
    services: "123/45 mmhg",
    dateAppointed: "23 bpm",
    appointment: "34 cpm",
  },
  {
    id: "P2",
    patient: {
      lastName: "Caballes",
      firstName: "Katrina Shin",
      middleName: "Dayuja",
      gender: "Female",
      age: 10,
      ageTime: "yr",
    },
    address: "BOnsai Bolinawan Carcar City",
    services: "123/45 mmhg",
    dateAppointed: "23 bpm",
    appointment: "34 cpm",
  },
];

const columns = (setData: React.Dispatch<React.SetStateAction<appointmentRecords[]>>): ColumnDef<appointmentRecords>[] => [
  {
    accessorKey: "id",
    header: "#",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="bg-lightBlue text-darkBlue1 w-full p-1 rounded-md text-center font-semibold">
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
      const fullName =
        `${patient.lastName}, ${patient.firstName} ${patient.middleName}`.trim();

      return (
        <div className="flex justify-start min-w-[200px] px-2">
          <div className="flex flex-col w-full">
            <div className="font-medium truncate">{fullName}</div>
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
        <div className="w-full truncate">{row.original.address}</div>
      </div>
    ),
  },

  {
    accessorKey: "services",
    header: "Services",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="w-[90px]">{row.original.services}</div>
      </div>
    ),
  },
  {
    accessorKey: "dateAppointed",
    header: "Date Appointed",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="w-[50px]">{row.original.dateAppointed}</div>
      </div>
    ),
  },

  {
    accessorKey: "appointment",
    header: "Appointment",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <div className="w-[50px]">{row.original.appointment}</div>
      </div>
    ),
  },

  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div>
        <div className="flex gap-2 justify-center min-w-[120px]">
          <TooltipLayout
            trigger={
                <Button
                    className="bg-white hover:bg-[#f3f2f2] border text-green-600 px-4 py-2 rounded cursor-pointer"
                    onClick={() => {
                        const modal = document.createElement("div");
                        modal.className = "fixed top-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow-lg z-50";
                        modal.innerHTML = `
                            <div class="flex items-center">
                                <Check size={16} class="text-green-600 mr-2" />
                                <span>Action was successful!</span>
                            </div>
                        `;
                        document.body.appendChild(modal);
                        setTimeout(() => {
                            document.body.removeChild(modal);
                        }, 2000);
                        // Remove the row from the data
                        setData((prevData) => prevData.filter((item) => item.id !== row.original.id));
                    }}
                >
                    <Check size={16} />
                </Button>
            }
            content="Confirm"
          />
          <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-white hover:bg-[#f3f2f2] border text-red-600 px-4 py-2 rounded cursor-pointer">
                    {" "}
                    <X size={16} />
                  </div>
                }
                className=" flex flex-col overflow-auto scrollbar-custom"
                title="Feedback"
                description="Write you feedback."
                mainContent={
                  <>
                    <div>
                      <Textarea className="h-40"></Textarea>

                      <div className="flex  justify-end z-40 mt-10 gap-2">
                       
                        <Button type="submit" >
                          Save
                        </Button>{" "}
                      </div>
                    </div>
                  </>
                } // Replace with actual image path
              />
            }
            content="Reject"
          />
        </div>
      </div>
    ),
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
  

export default function AppointmentTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState(sampleData);

  return (
    <div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Appointment</CardTitle>
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
              <div className="w-full md:w-auto md:absolute md:left-1/3 md:ml-4 z-20">
                <CategoryFilter />
              </div>
            </div>

          
          </div>

          <DataTable columns={columns(setData)} data={data} />
        </div>
      </CardContent>
    </div>
  );
}
