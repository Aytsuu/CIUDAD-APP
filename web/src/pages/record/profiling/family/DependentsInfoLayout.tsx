import React from 'react';
import { z } from 'zod';
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button/button";
import { familyFormSchema } from '@/form-schema/profiling-schema';
import DependentForm from './DependentForm';
import { DataTable } from '@/components/ui/table/data-table';
import { father, mother, family, familyComposition, dependents, building} from '../restful-api/profiingPostAPI'
import { DependentRecord } from '../profilingTypes';
import { ColumnDef } from '@tanstack/react-table';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout';
import { CircleCheck, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
 
export default function DependentsInfoLayout(
  {form, residents, selectedParents, defaultValues, back}: {
    form: UseFormReturn<z.infer<typeof familyFormSchema>>;
    residents: any;
    selectedParents: Record<string, string>;
    defaultValues: Record<string, any>;
    back: () => void;
}){

    const navigate = useNavigate();
    const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>([])

    React.useEffect(() => {
        const dependentsList = form.getValues("dependentsInfo.list");
    
        if (Array.isArray(dependentsList)) {
            // Transform the list into an array of Dependent objects
            const transformedData = dependentsList.map((value) => ({
            id: value.id,
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
            cell: ({row}) => (
            <TooltipLayout 
                trigger={
                <Trash 
                    size={17}
                    className="fill-red-500 stroke-red-500 cursor-pointer"
                    onClick={()=>{ handleDelete(row.original.id)}}
                />
                }
                content={'Remove'}
            />
            )
        },
    ]

    const handleDelete = (id: string) => {
      setDependentsList((prevData) => {
            const newData = prevData.filter((dependent) => dependent.id !== id);
            
            // Update the form state with the new list of dependents
            form.setValue("dependentsInfo.list", newData.map(dependent => ({
                id: dependent.id,
                lastName: dependent.lname,
                firstName: dependent.fname,
                middleName: dependent.mname,
                suffix: dependent.suffix,
                sex: dependent.sex,
                dateOfBirth: dependent.dateOfBirth,
            })));
    
            return newData;
        });
    }

    const registerProfile = async () => {
      try {
          // Get form values
          const demographicInfo = form.getValues().demographicInfo;
          const dependentsInfo = form.getValues().dependentsInfo.list;
  
          // Store mother information
          
          const motherId = await mother(selectedParents.mother);
  
          // Store father information
          const fatherId = await father(selectedParents.father);
  
          // Store family information
          const familyId = await family(demographicInfo, fatherId, motherId);

          // Automatically add selected mother and father in the family composition
          familyComposition(familyId, selectedParents.mother)
          familyComposition(familyId, selectedParents.father)
  
          // Store dependents information
          dependents(dependentsInfo, familyId);
  
          // Store building information
          const buildId = await building(familyId, demographicInfo);
  
          // Reset form if all operations are successful
          if(buildId) {
            form.reset(defaultValues);
          }
  
          // Provide feedback to the user
          toast('Record added successfully', {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            action: {
                label: "View",
                onClick: () => navigate(-1)
            }
        });
      } catch (err) {
          // Handle errors and provide feedback to the user
          console.error("Error registering profile:", err);
          alert("An error occurred while registering the profile. Please try again.");
      }
    };

    return (
        <div className="flex flex-col min-h-0 h-auto gap-10 md:p-10 rounded-lg overflow-auto">
            <div className="mt-8 flex flex-col justify-end gap-2 sm:gap-3">
                <DependentForm 
                    form={form}
                    residents={residents}
                    selectedParents={selectedParents}
                    dependents={dependentsList}
                />
                <DataTable data={dependentsList} columns={dependentColumns}/>
            </div>
            <div className='flex justify-end gap-3'>
                <Button
                    variant="outline"
                    className="w-full sm:w-32"
                    onClick={back}
                >
                    Prev
                </Button>         
                <Button className="w-full sm:w-32" onClick={registerProfile}>
                    Register
                </Button>                              
            </div>
        </div>
    );
}