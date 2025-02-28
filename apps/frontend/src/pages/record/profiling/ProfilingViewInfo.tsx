import { Link } from "react-router";
import { BsChevronLeft } from "react-icons/bs";
import { Input } from "@/components/ui/input";
import { Information } from "./_types";
import { Dependent } from "./_types";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const personal: Information[] = [
  {id: "lname", label: "Last Name", value: "Lorem"},
  {id: "fname", label: "First Name", value: "Lorem"},
  {id: "mname", label: "Middle Name", value: "Lorem"},
  {id: "suffix", label: "Suffix", value: "Lorem"},
  {id: "sex", label: "Sex", value: "Lorem"},
  {id: "dateOfBirth", label: "Date of Birth", value: "Lorem"},
  {id: "maritalStatus", label: "Marital Status", value: "Lorem"},
  {id: "placeOfBirth", label: "Place of Birth", value: "Lorem"},
  {id: "citizenship", label: "Citizenship", value: "Lorem"},
  {id: "contact", label: "Contact", value: "Lorem"},
  {id: "religion", label: "Religion", value: "Lorem"},
] 

const father: Information[] = [
  {id: "lname", label: "Last Name", value: "Lorem"},
  {id: "fname", label: "First Name", value: "Lorem"},
  {id: "mname", label: "Middle Name", value: "Lorem"},
  {id: "suffix", label: "Suffix", value: "Lorem"},
  {id: "dateOfBirth", label: "Date of Birth", value: "Lorem"},
  {id: "maritalStatus", label: "Marital Status", value: "Lorem"},
  {id: "religion", label: "Religion", value: "Lorem"},
  {id: "education", label: "Educational Attainment", value: "Lorem"},
] 

const mother: Information[] = [
  {id: "lname", label: "Last Name", value: "Lorem"},
  {id: "fname", label: "First Name", value: "Lorem"},
  {id: "mname", label: "Middle Name", value: "Lorem"},
  {id: "suffix", label: "Suffix", value: "Lorem"},
  {id: "dateOfBirth", label: "Date of Birth", value: "Lorem"},
  {id: "maritalStatus", label: "Marital Status", value: "Lorem"},
  {id: "religion", label: "Religion", value: "Lorem"},
  {id: "education", label: "Educational Attainment", value: "Lorem"},
] 

const dependents: Dependent[] = [
  {
    id: "Lorem",
    lname: "Lorem",
    fname: "Lorem",
    mname: "Lorem",
    suffix: "Lorem",
    dateOfBirth: "Lorem",
    maritalStatus: "Lorem"
  }
]


// Data Table
const columns: ColumnDef<Dependent>[] = [
  {
    accessorKey: "lname",
    header: "Last Name"
  },
  {
    accessorKey: "fname",
    header: "First Name"
  },
  {
    accessorKey: "mname",
    header: "Middle Name"
  },
  {
    accessorKey: "suffix",
    header: "Suffix"
  },
  {
    accessorKey: "dateOfBirth",
    header: "Date of Birth"
  },
  {
    accessorKey: "maritalStatus",
    header: "Marital Status"
  },
]



export default function ProfileViewInfo() {
  {/* Sample Data */}
  const data = dependents;
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            {/* Header - Stacks vertically on mobile */}
            <Button 
              className="text-black p-2 self-start"
              variant={"outline"}
              onClick={() => navigate(-1)}
            >
              <BsChevronLeft />
            </Button>
            <div className="flex flex-col">
              <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
                Resident Details
              </h1>
              <p className="text-xs sm:text-sm text-darkGray">
                View resident information
              </p>
            </div>  
          </div>
      </div>

      <hr className="h-2 bg-darkBlue1 my-6 rounded-full" />
      
      {/* Sections */}
      <div className="w-full space-y-6 bg-white rounded-lg shadow-sm">
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="bg-gray-200 rounded-full w-24 h-24 flex items-center justify-center">
              <span className="text-sm text-gray-500">No Image</span>
            </div>
            <div>
              <h3 className="text-lg font-medium">Christian</h3>
              <span className="text-sm text-gray-600">ID: RES-2023-001</span>
            </div>
          </div>
        </section>

        {/* Personal Information */}
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Personal Information
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {
              personal.map((info) => (
                <div key={info.id}>
                  <label className="block text-sm font-medium text-darkGray mb-1">
                    {info.label}
                  </label>
                  <Input
                    type="text"
                    value={info.value}
                    readOnly
                  />
                </div>
              ))
            }
          </div>
        </section>

        {/* Parents Information */}
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          {/* Father's Information */}
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Father's Information
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {
              father.map((info) => (
                <div key={info.id}>
                  <label className="block text-sm font-medium text-darkGray mb-1">
                    {info.label}
                  </label>
                  <Input
                    type="text"
                    value={info.value}
                    readOnly
                  />
                </div>
              ))
            }
          </div>
        </section>

        {/* Mother's Information */}
        <section className="p-4 md:p-6 border-b-2 border-darkBlue1">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Mother's Information
          </h2>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {
              mother.map((info) => (
                <div key={info.id}>
                  <label className="block text-sm font-medium text-darkGray mb-1">
                    {info.label}
                  </label>
                  <Input
                    type="text"
                    value={info.value}
                    readOnly
                  />
                </div>
              ))
            }
          </div>
        </section>

        {/*Dependents Information */}
        <section className="p-4 md:p-6">
          <h2 className="font-semibold text-xl text-darkBlue2 mb-4">
            Dependent's Information
          </h2>

          {/* Table */}
          <div className="border rounded-md">
            <DataTable columns={columns} data={data} />
          </div>
        </section>
      </div>
    </div>
  );
}