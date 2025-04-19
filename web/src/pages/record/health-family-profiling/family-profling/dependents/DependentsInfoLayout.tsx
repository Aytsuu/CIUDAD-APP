import React from "react";
import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { familyFormSchema } from "@/form-schema/family-form-schema";
import DependentForm from "./DependentForm";
import { DataTable } from "@/components/ui/table/data-table";
import { DependentRecord } from "../../profilingTypes";
import { ColumnDef } from "@tanstack/react-table";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";
import { CircleAlert, CircleCheck, Trash } from "lucide-react";
import { toast } from "sonner";
import { replace, useNavigate } from "react-router";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { useAuth } from "@/context/AuthContext";
import { useAddFamily, useAddFamilyComposition } from "@/pages/record/profiling/queries/profilingAddQueries"; 
import { LoadButton } from "@/components/ui/button/load-button";

// export default function DependentsInfoLayout({
//   form,
//   residents,
//   selectedParents,
//   dependentsList,
//   setDependentsList,
//   defaultValues,

}: {
  form: UseFormReturn<z.infer<typeof familyFormSchema>>;
  residents: any;
  selectedParents: string[];
  dependentsList: DependentRecord[];
  setDependentsList: React.Dispatch<React.SetStateAction<DependentRecord[]>>
  defaultValues: Record<string, any>;

}) {

  const PARENT_ROLES = ["Mother", "Father", "Guardian"];
  const navigate = useNavigate();
  const { user } = React.useRef(useAuth()).current;
  const { mutateAsync: addFamily } = useAddFamily();
  const { mutateAsync: addFamilyComposition } = useAddFamilyComposition();
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

//   React.useEffect(() => {
//     const dependents = form.getValues("dependentsInfo.list");

//     if (Array.isArray(dependents)) {
//       // Transform the list into an array of Dependent objects
//       const transformedData = dependents.map((value) => ({
//         id: value.id.split(" ")[0],
//         lname: value.lastName,
//         fname: value.firstName,
//         mname: value.middleName,
//         suffix: value.suffix,
//         sex: value.sex,
//         dateOfBirth: value.dateOfBirth,
//       }));

//       // Update the state with the transformed data
//       setDependentsList(transformedData);
//     }
//   }, [form.watch("dependentsInfo.list")]); // Watch for changes in dependentsInfo.list

//   const dependentColumns: ColumnDef<DependentRecord>[] = [
//     { accessorKey: "id", header: "#" },
//     { accessorKey: "lname", header: "Last Name" },
//     { accessorKey: "fname", header: "First Name" },
//     { accessorKey: "mname", header: "Middle Name" },
//     { accessorKey: "suffix", header: "Suffix" },
//     { accessorKey: "sex", header: "Sex" },
//     { accessorKey: "dateOfBirth", header: "Birthday" },
//     {
//       accessorKey: "action",
//       header: "",
//       cell: ({ row }) => (
//         <TooltipLayout
//           trigger={
//             <Trash
//               size={17}
//               className="fill-red-500 stroke-red-500 cursor-pointer"
//               onClick={() => {
//                 handleDelete(row.original.id);
//               }}
//             />
//           }
//           content={"Remove"}
//         />
//       ),
//     },
//   ];

//   const handleDelete = (id: string) => {
//     setDependentsList((prevData) => {
//       const newData = prevData.filter((dependent) => dependent.id !== id);

//       // Update the form state with the new list of dependents
//       form.setValue(
//         "dependentsInfo.list",
//         newData.map((dependent) => ({
//           id: dependent.id,
//           lastName: dependent.lname,
//           firstName: dependent.fname,
//           middleName: dependent.mname,
//           suffix: dependent.suffix,
//           sex: dependent.sex,
//           dateOfBirth: dependent.dateOfBirth,
//         }))
//       );

//       return newData;
//     });
//   };

  // const submit = async () => { 
  //   setIsSubmitting(true);

  //   if(dependentsList.length === 0){
  //     toast('Family Registration', {
  //       description: "Must have atleast one dependent.",
  //       icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
  //     });
  //     return;
  //   }

  //   // Get form values
  //   const demographicInfo = form.getValues().demographicInfo;
  //   const dependentsInfo = form.getValues().dependentsInfo.list;

  //   // Store information to the database
  //   const family = await addFamily({
  //     demographicInfo: demographicInfo, 
  //     staffId: user?.staff.staff_id
  //   });

  //   await Promise.all(selectedParents.map( async (parentId, index) => {
  //     if(parentId) {
  //       await addFamilyComposition({
  //         familyId: family.fam_id,
  //         role: PARENT_ROLES[index],
  //         residentId: parentId
  //       })
  //     }
  //   }))

  //   await Promise.all(dependentsInfo.map( async (dependent) => {
  //     await addFamilyComposition({
  //       familyId: family.fam_id,
  //       role: "Dependent",
  //       residentId: dependent.id.split(" ")[0]
  //     })
  //   }))

  //   // Provide feedback to the user
  //   toast("Record added successfully", {
  //     icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />
  //   });

  //   navigate(-1);
  //   setIsSubmitting(false);
  //   form.reset(defaultValues);
  // }

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