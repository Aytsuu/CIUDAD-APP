import React from 'react';
import { z } from 'zod';
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { profilingFormSchema } from '@/form-schema/profiling-schema';
import DependentForm from './DependentForm';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/table/data-table';
import DialogLayout from '@/components/ui/dialog/dialog-layout';
import AssignPosition from '../../../administration/AssignPosition';
import {personal, father, mother, family, dependents, address, building, familyComposition} from './_postRequests'

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
  {form, onSubmit, back, auth}: {
    auth: string,
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
            lname: value.lastName,
            fname: value.firstName,
            mname: value.middleName,
            suffix: value.suffix,
            sex: value.sex,
            dateOfBirth: value.dateOfBirth,
          }));
      
          // Update the state with the transformed data
          setData(transformedData);
        }
      }, [form.watch("dependentsInfo.list")]); // Watch for changes in dependentsInfo.list

    const registerProfile = async () => {
        const demographicInfo = form.getValues().demographicInfo
        const personalInfo = form.getValues().personalInfo
        const motherInfo = form.getValues().motherInfo
        const fatherInfo = form.getValues().fatherInfo
        const dependentsInfo = form.getValues().dependentsInfo.list

        // Store to address

        const address_id = await address(demographicInfo.sitio, personalInfo.streetAddress)
      
        // Store to personal

        const personal_id = await personal(personalInfo)

        // Store to father

        const mother_id = await mother(motherInfo)

        // Store to father

        const father_id = await father(fatherInfo)

        // Store to family

        const family_id = await family(mother_id, father_id, demographicInfo.familyNo)

        // Store to dependents

        dependents(dependentsInfo, family_id)

        // Store to family composition

        familyComposition(family_id, personal_id)

        // Store to household  

        const household_id = await household(address_id, personal_id, demographicInfo.householdNo)

        // Store to building

        building(household_id, demographicInfo.familyNo, demographicInfo.building)
        
        // Store to position assignment (if applied)
    }

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
                
                {
                    auth === 'admin' ? 
                    (
                        <DialogLayout
                            trigger={
                                <div className='text-white bg-buttonBlue py-1.5 px-12 rounded-md cursor-pointer text-[14px] font-medium hover:bg-buttonBlue/90'>
                                    Finish
                                </div>
                            }
                            title='Position Assignment'
                            description='Assign a position to complete the registration'
                            mainContent={ <AssignPosition form={form}/>} 
                        />
                    ) : (
                        
                        <Button className="w-full sm:w-32" onClick={registerProfile}>
                            Register
                        </Button>
                    )
                }     
            </div>
        </div>
    );
}