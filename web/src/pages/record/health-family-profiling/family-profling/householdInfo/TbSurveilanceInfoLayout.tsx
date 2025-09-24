import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import TbSurveilanceForm from "./TbSurveilanceForm";
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
  tbSurveilanceSchema?: {
    srcAntiTBmeds: string;
    noOfDaysTakingMeds: string;
    tbStatus: string;
  };
};

export default function TbSurveilanceInfoLayout({
  form,
  residents,
  selectedResidentId,
  setSelectedResidentId
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any[]; // Family members array
  selectedResidentId: string;
  setSelectedResidentId: React.Dispatch<React.SetStateAction<string>>;
}) {
  const tbRecords = form.watch("tbRecords.list");
  
  // Ensure residents is always an array
  const safeResidents = residents || [];
  
  // Debug logging
  React.useEffect(() => {
    console.log('TbSurveilanceInfoLayout - residents:', safeResidents);
  }, [safeResidents]);
  
  // Structure residents data for the form
  const structuredResidents = {
    default: safeResidents,
    formatted: safeResidents.map(member => ({
      ...member,
      // Use rp_id as the ID and format name properly
      id: `${member.rp_id} - ${member.per?.per_fname || member.firstName || ''} ${member.per?.per_lname || member.lastName || ''}`
    }))
  };
  
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
      accessorKey: "tbSurveilanceSchema.srcAntiTBmeds", 
      header: "Source of Anti TB Meds" 
    },
    { 
      accessorKey: "tbSurveilanceSchema.noOfDaysTakingMeds", 
      header: "Days Taking Meds" 
    },
    { 
      accessorKey: "tbSurveilanceSchema.tbStatus", 
      header: "TB Status" 
    },
    {
      id: "action",
      header: "Actions",
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
    form.setValue("tbRecords.list", 
      tbRecords.filter((record: PersonInfo) => record.id !== id)
    );
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="space-y-6">
        {/* TB Surveillance Information */}
        <TbSurveilanceForm
          residents={structuredResidents}
          form={form}
          selectedResidentId={selectedResidentId}
          onSelect={setSelectedResidentId}
          prefix="tbRecords"
          title="TB Surveillance Information"
        />

        <Separator className="my-6" />

        <div className="mb-4">
          <h3 className="font-semibold text-lg">TB Patient Records</h3>
          <p className="text-xs text-black/50">Manage TB Surveilance Records</p>
        </div>

        <DataTable
          columns={columns}
          data={tbRecords || []}
        />
      </div>
    </div>
  );
}