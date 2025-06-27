import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import DependentForm from "./DependentForm";
import { DataTable } from "@/components/ui/table/data-table";
import { DependentRecord } from "../../profilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { CircleAlert, Trash } from "lucide-react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/AuthContext";
import { useAddFamilyHealth, useAddFamilyCompositionHealth } from "../queries/profilingAddQueries";
import { LoadButton } from "@/components/ui/button/load-button";
import { useSafeNavigate } from "@/hooks/use-safe-navigate";

export default function DependentsInfoLayout({
  form,
  residents,
  selectedParents,
  dependentsList,
  setDependentsList,
  back,
}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedParents: string[];
  dependentsList: DependentRecord[];
  setDependentsList: React.Dispatch<React.SetStateAction<DependentRecord[]>>
  defaultValues: Record<string, any>;
  back: () => void;
}) {

  const PARENT_ROLES = ["Mother", "Father", "Guardian"];
  const { user } = useAuth();
  const { safeNavigate } = useSafeNavigate(); 
  const { mutateAsync: addFamilyHealth } = useAddFamilyHealth();
  const { mutateAsync: addFamilyCompositionHealth } = useAddFamilyCompositionHealth();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {
    const dependents = form.getValues("dependentsInfo.list");

    if (Array.isArray(dependents)) {
      // Transform the list into an array of Dependent objects
      const transformedData = dependents.map((value) => ({
        id: value.id?.split(" ")[0] as string,
        lname: value.lastName,
        fname: value.firstName,
        mname: value.middleName,
        suffix: value.suffix,
        sex: value.sex,
        dateOfBirth: value.dateOfBirth,
      }));

      // Update the state with the transformed data
      if(transformedData.length > 0) {
        setDependentsList(transformedData);
      }
    }
  }, [form.watch("dependentsInfo.list")]); // Watch for changes in dependentsInfo.list

  const dependentColumns: ColumnDef<DependentRecord>[] = [
    { accessorKey: "id", header: "#" },
    { accessorKey: "lname", header: "Last Name" },
    { accessorKey: "fname", header: "First Name" },
    { accessorKey: "mname", header: "Middle Name" },
    { accessorKey: "suffix", header: "Suffix" },
    { accessorKey: "sex", header: "Sex" },
    { accessorKey: "dateOfBirth", header: "Birthday" },
    {
      accessorKey: "action",
      header: "",
      cell: ({ row }) => (
        <TooltipLayout
          trigger={
            <Trash
              size={17}
              className="fill-red-500 stroke-red-500 cursor-pointer"
              onClick={() => {
                handleDelete(row.original.id);
              }}
            />
          }
          content={"Remove"}
        />
      ),
    },
  ];

  const handleDelete = (id: string) => {
    setDependentsList((prevData) => {
      const newData = prevData.filter((dependent) => dependent.id !== id);

      // Update the form state with the new list of dependents
      form.setValue(
        "dependentsInfo.list",
        newData.map((dependent) => ({
          id: dependent.id,
          lastName: dependent.lname,
          firstName: dependent.fname,
          middleName: dependent.mname,
          suffix: dependent.suffix,
          sex: dependent.sex,
          dateOfBirth: dependent.dateOfBirth,
        }))
      );

      return newData;
    });
  };

  const submit = async () => { 
    setIsSubmitting(true);

    if(dependentsList.length === 0){
      setIsSubmitting(false);
      toast('Family Registration', {
        description: "Must have atleast one dependent.",
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
        style: {
          border: '1px solid rgb(225, 193, 193)',
          padding: '16px',
          color: '#b91c1c',
          background: '#fef2f2',
        },
      });
      return;
    }

    // Get form values
    const demographicInfo = form.getValues().demographicInfo;
    const dependentsInfo = form.getValues().dependentsInfo.list;

    // Store information to the database
    const family = await addFamilyHealth({
      demographicInfo: demographicInfo, 
      staffId: user?.staff?.staff_id || ""
    });

    let bulk_composition: {
      fam: string, 
      fc_role: string, 
      rp: string}[] = [];

    selectedParents.map((parentId, index) => {
      if(!parentId) return;
      bulk_composition = [
        ...bulk_composition,
        {
          fam: family.fam_id,
          fc_role: PARENT_ROLES[index],
          rp: parentId
        }
      ]
    });

    dependentsInfo.map((dependent) => {
      bulk_composition = [
        ...bulk_composition,
        {
          fam: family.fam_id,
          fc_role: 'Dependent',
          rp: dependent.id?.split(" ")[0] as string
        }
      ]
    })

    addFamilyCompositionHealth(bulk_composition,{
      onSuccess: () => {
        safeNavigate.back();
      }
    });
  }

  return (
    <div className="flex flex-col min-h-0 h-auto gap-10 md:p-10 rounded-lg overflow-auto">
      <div className="mt-8 flex flex-col justify-end gap-2 sm:gap-3">
        <DependentForm
          form={form}
          residents={residents}
          selectedParents={selectedParents}
          dependents={dependentsList}
        />
        <DataTable data={dependentsList} columns={dependentColumns} />
      </div>
      <div className="flex justify-end gap-3">
        {!isSubmitting ? (<>
          <Button variant="outline" className="w-full sm:w-32" onClick={back}>
            Prev
          </Button>
          <ConfirmationModal 
          trigger={
            <Button className="w-full sm:w-32">
              Register
            </Button>
          }
          title="Confirm Registration"
          description="Do you wish to proceed with the registration?"
          actionLabel="Confirm"
          onClick={submit}
          />
        </>) : (
          <LoadButton>Registering...</LoadButton>
        )}
      </div>
    </div>
  );
}