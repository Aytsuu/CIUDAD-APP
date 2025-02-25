import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout.tsx";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Check, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormControl,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import FeedbackForm from "./rejectModal";

export default function AppointmentTable() {
  type AppointmentRecords = {
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

  const sampleData: AppointmentRecords[] = [
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

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSuccessfulModal, setIsSuccessfulModal] = useState(false);

  const handeleClose = () => {
    setIsDialogOpen(false);
  };
  const handeSave = () => {
    setIsDialogOpen(false);
    setIsSuccessfulModal(true);

    setTimeout(() => {
      setIsSuccessfulModal(false);
    }, 800);
  };

  const columns: ColumnDef<AppointmentRecords>[] = [
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
      cell: ({}) => (
        <div>
          <div className="flex gap-2 justify-center min-w-[120px]">
            <TooltipLayout
              trigger={
                <DialogLayout
                  trigger={
                    <div className="bg-white hover:bg-[#f3f2f2]  text-green-600 border border-green-700 px-4 py-2 rounded cursor-pointer">
                      <Check size={16} />
                    </div>
                  }
                  mainContent={
                    <>
                      <div className="p-6 text-center">
                        <h3 className="text-lg font-semibold">Confirmation</h3>
                        <p className="mt-2 text-gray-600">
                          Are you sure you want to proceed?
                        </p>
                        <div className="flex  gap-2 justify-center">
                          <Button
                            variant={"outline"}
                            onClick={handeleClose}
                            className="mt-6 w-[120px]"
                          >
                            No
                          </Button>
                          <Button
                            onClick={handeSave}
                            className="mt-6 w-[120px]"
                          >
                            Yes
                          </Button>
                        </div>
                      </div>
                    </>
                  }
                  isOpen={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                />
              }
              content="Confirm"
            />

            <TooltipLayout
              trigger={
                <div>
                  {/* <X size={16} /> */}

                  <FeedbackForm />
                </div>
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

  const [searchTerm, setSearchTerm] = useState("");

  const data = sampleData;

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

          <DataTable columns={columns} data={data} />

          {/* Success Modal as a Div at the Top */}
          {showSuccessfulModal && (
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 transition-all duration-300 ease-out transform translate-y-0 opacity-100">
              <div className="bg-snow border border-blue p-4 sm:p-6 rounded-lg text-center mx-4 sm:mx-auto w-full sm:w-auto sm:min-w-[320px] max-w-md">
                <h3 className="text-lg font-semibold">Feedback Saved</h3>
                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Your feedback has been successfully saved.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </div>
  );
}
