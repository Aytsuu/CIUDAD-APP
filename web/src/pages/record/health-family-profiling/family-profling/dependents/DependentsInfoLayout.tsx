import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import DependentForm from "./DependentForm";
import { DataTable } from "@/components/ui/table/data-table";
import {
  addFather,
  addMother,
  addFamily,
  addFamilyComposition,
  addDependent,
  addGuardian
} from "@/pages/record/profiling/restful-api/profiingPostAPI";
import { DependentRecord } from "../../profilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { CircleAlert, CircleCheck, Trash } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/AuthContext";

export default function DependentsInfoLayout({
  form,
  residents,
  selectedParents,
  dependentsList,
  setDependentsList,
  defaultValues,
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
  const navigate = useNavigate();
  const { user } = React.useRef(useAuth()).current;

  React.useEffect(() => {
    const dependents = form.getValues("dependentsInfo.list");

    if (Array.isArray(dependents)) {
      // Transform the list into an array of Dependent objects
      const transformedData = dependents.map((value) => ({
        id: value.id.split(" ")[0],
        lname: value.lastName,
        fname: value.firstName,
        mname: value.middleName,
        suffix: value.suffix,
        sex: value.sex,
        dateOfBirth: value.dateOfBirth,
      }));

      // Update the state with the transformed data
      setDependentsList(transformedData);
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

  const registerProfile = async () => { 

    if(dependentsList.length === 0){
      toast('Family Registration', {
        description: "Must have atleast one dependent.",
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      })
      return;
    }

    try {
      // Get form values
      const demographicInfo = form.getValues().demographicInfo;
      const dependentsInfo = form.getValues().dependentsInfo.list;

      // Store information to the database
      const motherId = await addMother(selectedParents[0]);
      const fatherId = await addFather(selectedParents[1]);
      const guardId = await addGuardian(selectedParents[3]);
      const familyId = await addFamily(demographicInfo, fatherId, motherId, guardId, user?.staff.staff_id);

      // Automatically add selected mother and father in the family composition
      addFamilyComposition(familyId, selectedParents[0]);
      addFamilyComposition(familyId, selectedParents[1]);

      // Store dependents information
      addDependent(dependentsInfo, familyId);
    } catch (err) {
      // Handle errors and provide feedback to the user
      console.error("Error registering profile:", err);
      alert(
        "An error occurred while registering the profile. Please try again."
      );
    } finally {
      // Reset form if all operations are successful
      form.reset(defaultValues);

      // Provide feedback to the user
      toast("Record added successfully", {
        icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
        action: {
          label: "View",
          onClick: () => navigate(-1),
        },
      });
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto gap-10 md:p-10 rounded-lg overflow-auto">
      <div className="mt-8 flex flex-col justify-end gap-2 sm:gap-3">
        <DependentForm
          title="Dependents Information"
          form={form}
          residents={residents}
          selectedParents={selectedParents}
          dependents={dependentsList}
        />
        
        <DataTable data={dependentsList} columns={dependentColumns} />
      </div>
      
    </div>
  );
}