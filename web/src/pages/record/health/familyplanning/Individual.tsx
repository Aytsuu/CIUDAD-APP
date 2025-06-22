import { useState } from "react";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Eye, Search, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import DialogLayout from "@/components/ui/dialog/dialog-layout";

type FamPlanningPatient = {
  id: number;
  patient: {
    fname: string;
    lname: string;
    mname: string;
    age: string;
  };
  address: string;
  purok: string;
  methodUsed: string;
  type: string;
  createdAt: string;
};

const samplePatients: FamPlanningPatient[] = [
  {
    id: 1,
    patient: {
      fname: "Jane",
      lname: "Bil",
      mname: "G",
      age: "25",
    },
    address: "Minglanilla",
    purok: "Cat",
    methodUsed: "COC",
    type: "Resident",
    createdAt: "2024-02-06",
  },
];

function IndividualFamPlanningTable() {
  const [patients, setPatients] = useState<FamPlanningPatient[]>(samplePatients);
  const [searchQuery, setSearchQuery] = useState("");

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
        const { fname, lname, mname } = row.original.patient;
        return <span>{`${lname}, ${fname}, ${mname}`.trim()}</span>;
      },
    },
    {
      accessorKey: "patient.age",
      header: "Age",
      cell: ({ row }) => <span>{row.original.patient.age}</span>,
    },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "purok", header: "Purok" },
    { accessorKey: "type", header: "Type" },
    { accessorKey: "methodUsed", header: "Method Used" },
    { accessorKey: "createdAt", header: "Created At" },
    {
      accessorKey: "action",
      header: "Action",
      cell: () => (
        <div className="flex justify-center gap-2">
          <TooltipLayout
            trigger={
              <div className="bg-white hover:bg-gray-200 border text-black px-4 py-2 rounded cursor-pointer">
                <Eye size={15} />
              </div>
            }
            content="View"
          />
          {/* <TooltipLayout
            trigger={
              <DialogLayout
                trigger={
                  <div className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded cursor-pointer">
                    <Trash size={16} />
                  </div>
                }
                className=""
                mainContent={<></>}
              />
            }
            content="Delete"
          /> */}
        </div>
      ),
    },
  ];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredPatients = patients.filter((patient) => {
    const searchString = `${patient.patient.fname} ${patient.patient.lname} ${patient.patient.age} ${patient.address} ${patient.purok} ${patient.type} ${patient.createdAt}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-col items-center mb-4">
          <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
            Family Planning 
          </h1>
          <p className="text-xs sm:text-sm text-darkGray">
            Manage and view family planning individual records
          </p>
        </div>
      </div>
      <hr className="border-gray mb-6 sm:mb-10" />
      <div className="relative w-full flex justify-between items-center mb-4">
        <div className="flex gap-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={17} />
            <Input
              placeholder="Search..."
              className="pl-10 w-72 bg-white"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Link to={`/FamPlanning_main/`}>
            <Button variant="default">New record</Button>
          </Link>
        </div>
      </div>
      <div className="bg-white w-full overflow-x-auto">
        <DataTable columns={columns} data={filteredPatients} />
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between w-full py-3 gap-3 sm:gap-0">
        <p className="text-xs sm:text-sm font-normal text-darkGray pl-0 sm:pl-4">
          Showing 1-{filteredPatients.length} of {patients.length} records
        </p>
      </div>
    </div>
  );
}

export default IndividualFamPlanningTable;
