import React, { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FilterAccordion } from "@/components/ui/filter-accordion";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PatientQueueForm from "./patientQueueForm";
import { Check, TimerOff } from 'lucide-react';
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

type PatQueueRec = {
    id: string;
    // patientName: string;
    patient: {
        firstName: string;
        lastName: string;
        middleName: string;
        gender: string;
        age: number;
        ageTime: string;
        category: string
    };

    address: string;
    purok: string;
    service: string
    mode: string;
    time: string

};
const columns: ColumnDef<PatQueueRec>[] = [
    {
        accessorKey: "id",
        header: "#",
        cell: ({ row }) => (
            <div className="flex justify-center">
                <div className="bg-lightBlue text-darkBlue1 w-auto px-3 py-1 rounded-md w-8 text-center font-semibold">
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
                <div className="flex  w-[180px]">
                    <div className="flex flex-col w-full">
                        <div className="w-full whitespace-pre-wrap break-words font-medium">
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
            <div className="flex justify-start w-[180px] ">
                <div className="w-full whitespace-pre-wrap break-words">
                    {row.original.address}
                </div>
            </div>
        )
    },

    {
        accessorKey: "purok",
        header: "Purok",
        cell: ({ row }) => (
            <div className="flex justify-center px-2">
                <div className="text-center w-full">
                    {row.original.purok}
                </div>
            </div>
        )
    },


    {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) => (
            <div className="flex justify-center px-2">
                <div className="text-center w-full">
                    {row.original.service}
                </div>
            </div>
        )
    },
    {
        accessorKey: "mode",
        header: "Mode",
        cell: ({ row }) => (
            <div className="flex justify-center px-2">
                <div className="text-center w-full">
                    {row.original.mode}
                </div>
            </div>
        )
    },
    {
        accessorKey: "time",
        header: "Time",
        cell: ({ row }) => (
            <div className="flex justify-center px-2">
                <div className="text-center w-full">
                    {row.original.time}
                </div>
            </div>
        )
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <div className="flex gap-2 justify-center min-w-[120px] px-2">
                <TooltipLayout
                    trigger={

                        <Button
                            variant="outline"
                            className=" border-green-600 text-green-700"
                            onClick={() => console.log("View record:", row.original.id)}
                            style={{ pointerEvents: 'none' }}

                        >
                            <Check />
                        </Button>

                    }
                    content="Assess"

                />


                <TooltipLayout
                    trigger={
                        <Button
                            variant="outline"
                            className="border-red-600 text-red-400"
                            onClick={() => console.log("View record:", row.original.id)}
                            style={{ pointerEvents: 'none' }}
                        >
                            <TimerOff />
                        </Button>
                    }

                    content="Not Arrived"
                />
            </div>

        )
    },
];

export const sampleData: PatQueueRec[] = [

    {
        id: "S11",

        patient: {
            lastName: "Caballes",
            firstName: "Katrina",
            middleName: "Dayuja",
            gender: "Female",
            age: 10,
            ageTime: "yr",
            category: "Senior"

        },
        address: "BOnsai  Carcar City",
        purok: "Bolinawan",
        service: "Prenatal",
        mode: "Walkin",
        time: "AM"

    },

    {
        id: "P12",

        patient: {
            lastName: "Caballes",
            firstName: "Katrina",
            middleName: "Dayuja",
            gender: "Female",
            age: 10,
            ageTime: "yr",
            category: "Senior"
        },
        address: "BOnsai Bolinawan Carcar City",
        purok: "Bolinawan",
        service: "Prenatal",

        mode: "Walkin",
        time: "AM"

    },
    {
        id: "R1",

        patient: {
            lastName: "Caballes",
            firstName: "Katrina",
            middleName: "Dayuja",
            gender: "Female",
            age: 10,
            ageTime: "yr",
            category: "Senior"

        },

        address: "BOnsai Bolinawan Carcar City",
        purok: "Bolinawan",
        service: "Prenatal",

        mode: "Walkin",

        time: "AM"

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

export default function PatientsQueueTable() {
    const [searchTerm, setSearchTerm] = useState("");

    const data = sampleData;

    return (





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
                        <PatientQueueForm />
                    </div>
                </div>

                <DataTable columns={columns} data={data} />
            </div>
        </CardContent>


    );
}