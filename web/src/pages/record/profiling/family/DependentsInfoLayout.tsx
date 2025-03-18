import React from 'react';
import { z } from 'zod';
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { familyFormSchema } from '@/form-schema/profiling-schema';
import DependentForm from './DependentForm';
import { DataTable } from '@/components/ui/table/data-table';
import { father, mother, family, familyComposition, dependents, building} from '../profilingPostRequests'
import { DependentRecord } from '../profilingTypes';
import { ColumnDef } from '@tanstack/react-table';
import TooltipLayout from '@/components/ui/tooltip/tooltip-layout';
import { Trash } from 'lucide-react';
import api from '@/api/api';
 
export default function DependentsInfoLayout(
  {form, defaultValues, back}: {
    form: UseFormReturn<z.infer<typeof familyFormSchema>>
    defaultValues: Record<string, any>
    back: () => void
}){

  const [dependentsList, setDependentsList] = React.useState<DependentRecord[]>([])
  const [residents, setResidents] = React.useState<Record<string, string>[]>([])
  const hasFetchData = React.useRef(false)

  React.useEffect(()=>{
    if(!hasFetchData.current){
      getResidents()
      hasFetchData.current = true
    }
  }, [])

  const getResidents  = React.useCallback(()=> {
    try{

      api.get('profiling/personal/')
      .then((res) => res.data)
      .then((data)=>{
          setResidents(data)
      })

    } catch (err) {
      console.log(err)
    } 
  }, [])

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
          const motherPersonalId = form.getValues().motherInfo.id;
          const fatherPersonalId = form.getValues().fatherInfo.id;
  
          // Store mother information
          
          const motherId = await mother(motherPersonalId);
  
          // Store father information
          const fatherId = await father(fatherPersonalId);
  
          // Store family information
          const familyId = await family(demographicInfo, fatherId, motherId);

          // Automatically add selected mother and father in the family composition
          familyComposition(familyId, motherPersonalId)
          familyComposition(familyId, fatherPersonalId)
  
          // Store dependents information
          dependents(dependentsInfo, familyId);
  
          // Store building information
          const buildId = await building(familyId, demographicInfo);
  
          // Reset form if all operations are successful
          if(buildId) {
            form.reset(defaultValues);
          }
  
          // Provide feedback to the user
          console.log("Profile registered successfully!");
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