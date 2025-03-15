import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import { Pencil, Trash } from "lucide-react";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { DataTable } from "@/components/ui/table/data-table";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChildHealthFormSchema,
  FormData,
  VitalSignType,
} from "@/form-schema/chr-schema";
import { VitalSignsDialogForm } from "./VitalSignsDialogForm";
import { UpdateVitalSigns } from "./UpdateVitalSigns";

export default function LastPage({
  onPrevious4,
  onSubmit,
  updateFormData,
  formData,
}: {
  onPrevious4: () => void;
  onSubmit: (data: FormData) => void;
  updateFormData: (data: Partial<FormData>) => void;
  formData: FormData;
}) {
  const [vitalSigns, setVitalSigns] = useState<FormData["vitalSigns"]>(
    formData.vitalSigns ?? []
  );

  const form = useForm<FormData>({
    resolver: zodResolver(ChildHealthFormSchema),
    defaultValues: {
      ...formData,
      vitalSigns: vitalSigns,
    },
  });

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  const handleUpdateVitalSign = (index: number, values: VitalSignType) => {
    console.log("Updating vital sign at index:", index, "with values:", values); // Debugging

    // Create a copy of the vitalSigns array
    const updatedVitalSigns = [...(vitalSigns ?? [])];
    updatedVitalSigns[index] = values; // Update the specific row

    setVitalSigns(updatedVitalSigns); // Update local state
    form.setValue("vitalSigns", updatedVitalSigns); // Update form state
    updateFormData({ vitalSigns: updatedVitalSigns }); // Update parent state
  };

  const handleDialogSubmit = (values: VitalSignType) => {
    console.log("handleDialogSubmit called"); // Debugging

    // Add the new vital sign to the existing list
    const updatedVitalSigns = [...(vitalSigns ?? []), values];
    setVitalSigns(updatedVitalSigns); // Update local state
    form.setValue("vitalSigns", updatedVitalSigns); // Update form state
    updateFormData({ vitalSigns: updatedVitalSigns }); // Update parent state

    // Reset the vital signs form
    form.resetField("vitalSigns");
  };

  const handleDeleteVitalSign = (index: number) => {
    console.log("Deleting vital sign at index:", index); // Debugging

    // Create a copy of the vitalSigns array
    const updatedVitalSigns = [...(vitalSigns ?? [])];
    console.log("Vital signs before deletion:", updatedVitalSigns); // Debugging

    updatedVitalSigns.splice(index, 1); // Remove the specific row
    console.log("Vital signs after deletion:", updatedVitalSigns); // Debugging

    setVitalSigns(updatedVitalSigns); // Update local state
    form.setValue("vitalSigns", updatedVitalSigns); // Update form state
    updateFormData({ vitalSigns: updatedVitalSigns }); // Update parent state
  };

  const columns = useMemo<
    ColumnDef<NonNullable<FormData["vitalSigns"]>[number]>[]
  >(
    () => [
      { accessorKey: "date", header: "Date" },
      { accessorKey: "age", header: "Age" },
      { accessorKey: "ht", header: "Ht" },
      { accessorKey: "wt", header: "Wt" },
      { accessorKey: "temp", header: "Temp" },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => {
          const notes = row.original.notes || "No notes";
          const followUpVisit = row.original.followUpVisit
            ? ` (Follow Up: ${row.original.followUpVisit})`
            : "";
          return `${notes}${followUpVisit}`;
        },
      },
      {
        accessorKey: "findings",
        header: "Findings",
        cell: ({ row }) => {
          const findings = row.original.findings || "No findings";
          
          return `${findings}`;
        },
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <TooltipLayout
              trigger={
                <DialogLayout
                  trigger={
                    <Button variant="ghost">
                      <Pencil size={16} />
                    </Button>
                  }
                  title="Edit Details"
                  className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
                  description="Edit the vital sign details."
                  mainContent={
                    <UpdateVitalSigns
                      initialData={row.original} // Pass the row data to the form
                      onSubmit={(values) =>
                        handleUpdateVitalSign(row.index, values)
                      } // Handle form submission
                      onCancel={() => console.log("Edit canceled")} // Handle cancel
                    />
                  }
                />
              }
              content="Update"
            />
            <TooltipLayout
              trigger={
                <div
                role="button"
                tabIndex={0}
                className="destructive-button-style" // Add your CSS class here
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  // Add hover styles if needed
                }}
                onClick={() => handleDeleteVitalSign(row.index)}
              >
                <Trash size={16} />
              </div>
              }
              content="Delete"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
      },
    ],
    []
  );

  const handleFinalSubmit = (data: FormData) => {
    console.log("Submitting final form data:", data);
    onSubmit(data);
  };

  return (
    <div className="w-full max-w-6xl h-full my-10 mx-auto bg-white rounded-lg shadow p-4 md:p-6 lg:p-8">
      {/* Add Vital Signs Modal */}
      <div className="flex w-full justify-end mb-4">
        <DialogLayout
          trigger={<Button>Add Vital Signs</Button>}
          className="max-w-[55%] h-[540px] flex flex-col overflow-auto scrollbar-custom"
          title="Add Vital Signs"
          description="Fill out the form to add a new record."
          mainContent={
            <VitalSignsDialogForm
              onSubmit={handleDialogSubmit}
              onCancel={() => form.reset({ vitalSigns: [{}] })}
            />
          }
        />
      </div>

      {/* Display Vital Signs Table */}
      <DataTable columns={columns} data={vitalSigns || []} />

      {/* Navigation Buttons */}
      <div className="flex w-full justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious4}
          className="w-[100px]"
        >
          Previous
        </Button>
        <Button
          type="submit"
          className="w-[100px]"
          onClick={form.handleSubmit(handleFinalSubmit)}
        >
          Submit
        </Button>
      </div>
    </div>
  );
}