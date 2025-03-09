import React from 'react';
import { z } from 'zod';
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { profilingFormSchema } from '@/form-schema/profiling-schema';
import DependentForm from './DependentForm';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';

type Dependent = {
    id: string
    lname: string
    fname: string
    mname: string
    suffix: string
    sex: string
    dateOfBirth: string
    // headRelationship: string
}

const columns: ColumnDef<Dependent>[] = [
    {
        accessorKey: "id",
        header: "#"
    },
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
        accessorKey: "sex",
        header: "Sex"
    },
    {
        accessorKey: "dateOfBirth",
        header: "Birthday"
    },
    {
        accessorKey: "action",
        header: "Action"
    },
]
 
export default function DependentsInfoLayout(
  {form, onSubmit, back}: {
    form: UseFormReturn<z.infer<typeof profilingFormSchema>>,
    onSubmit: () => void,
    back: () => void
}){

    const [data, setData] = React.useState<Dependent[]>([])

    React.useEffect(() => {
        const dependentsList = form.getValues("dependentsInfo.list");
      
        if (Array.isArray(dependentsList)) {
          // Transform the list into an array of Dependent objects
          const transformedData = dependentsList.map((value, index) => ({
            id: `${index}`,
            lname: value.dependentLName,
            fname: value.dependentFName,
            mname: value.dependentMName,
            suffix: value.dependentSuffix,
            sex: value.dependentSex,
            dateOfBirth: value.dependentDateOfBirth,
          }));
      
          // Update the state with the transformed data
          setData(transformedData);
        }
      }, [form.watch("dependentsInfo.list")]); // Watch for changes in dependentsInfo.list

    console.log(form.getValues())

    return (
        <div className="flex flex-col min-h-0 h-auto gap-10 md:p-10 rounded-lg overflow-auto">
            <div className="mt-8 flex flex-col justify-end gap-2 sm:gap-3">
                <DependentForm 
                    form={form}
                />
                <div className='px-24'>
                    <DataTable data={data} columns={columns}/>
                </div>
            </div>
            <div className='flex justify-end gap-3'>
                <Button
                    variant="outline"
                    className="w-full sm:w-32"
                    onClick={back}
                >
                    Prev
                </Button>
                <Button type="submit" className="w-full sm:w-32">
                    Register
                </Button>
            </div>
        </div>
    );
}