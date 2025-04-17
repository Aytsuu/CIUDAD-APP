import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import NonComDiseaseForm from "./NonComDiseaseForm";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Trash } from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

type PersonInfo = {
  id: string;
  lastName: string;
  firstName: string;
  middleName: string;
  suffix: string;
  sex: string;
  dateOfBirth: string;
  contact: string;
  ncdFormSchema?: {
    riskClassAgeGroup: string;
    comorbidities: string;
    lifestyleRisk: string;
    inMaintenance: string;
  };
};

export default function NoncomDiseaseFormLayout({
  form,
  residents,
  selectedResidentId,
  setSelectedResidentId
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedResidentId: string;
  setSelectedResidentId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const ncdRecords = form.watch("ncdRecords.list");
  
  // Updated columns with lifestyle risk and maintenance status
  const columns: ColumnDef<PersonInfo>[] = [
    { 
      accessorKey: "id", 
      header: "Resident ID" 
    },
    { 
      accessorKey: "lastName", 
      header: "Last Name" 
    },
    { 
      accessorKey: "firstName", 
      header: "First Name" 
    },
    { 
      accessorKey: "ncdFormSchema.riskClassAgeGroup", 
      header: "Risk class by age" 
    },
    { 
      accessorKey: "ncdFormSchema.comorbidities", 
      header: "Comorbidities" 
    },
    { 
      accessorKey: "ncdFormSchema.lifestyleRisk", 
      header: "Lifestyle Risk" 
    },
    { 
      accessorKey: "ncdFormSchema.inMaintenance", 
      header: "Maintenance Status",
      cell: ({ row }) => {
        const status = row.original.ncdFormSchema?.inMaintenance;
        return status === "yes" ? "Yes" : status === "no" ? "No" : "-";
      }
    },
    {
      id: "action",
      header: "",
      cell: ({ row }) => (
        <ConfirmationModal
          trigger={<Trash className="h-4 w-4 cursor-pointer" />}
          title="Confirm Deletion"
          description="Are you sure you want to delete this record?"
          actionLabel="Delete"
          onClick={() => handleDelete(row.original.id)}
        />
      )
    }
  ];

  const handleDelete = (id: string) => {
    form.setValue("ncdRecords.list", 
      ncdRecords.filter((record: PersonInfo) => record.id !== id)
    );
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-6">
        {/* Respondents Information */}
        <NonComDiseaseForm
          residents={residents}
          form={form}
          selectedResidentId={selectedResidentId}
          onSelect={setSelectedResidentId}
          prefix="ncdRecords"
          title="Non Communicable Disease Information"
        />

        <Separator className="my-6" />

        <div className="mb-4">
          <h3 className="font-semibold text-lg">NCD Patient Records</h3>
          <p className="text-xs text-black/50">Manage patient records</p>
        </div>

        <DataTable
          columns={columns}
          data={ncdRecords || []}
        />
      </div>
    </div>
  );
}