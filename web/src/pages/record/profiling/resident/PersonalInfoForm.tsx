import React from "react";
import { Input } from "@/components/ui/input";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { personal, registered } from "../profilingPostRequests";
import DialogLayout from "@/components/ui/dialog/dialog-layout";
import AssignPosition from "../../administration/AssignPosition";
import { useLocation } from "react-router";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { CircleCheck, CircleAlert } from "lucide-react";
import api from "@/api/api";

export default function PersonalInfoForm(){
 
  // Initialize states

  const location = useLocation()
  const defaultValues = generateDefaultValues(personalInfoSchema)
  const { params } = location.state || { params: {}}
  
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues 
  })
  
  const [residents, setResidents] = React.useState<Record<string, string>[]>([])
  const [residentSearch, setResidentSearch] = React.useState<string>('');
  const [isResidentFound, setIsResidentFound] = React.useState<boolean>(false);

  const [staffs, setStaffs] = React.useState<Record<string, string>[]>([]);
  const [isStaff, setIsStaff] = React.useState<boolean>(false);

  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false)
  const hasFetchData = React.useRef(false)
  
  // Side effect to fetch residents
  React.useEffect(()=>{
    if(!hasFetchData.current){

      if(params.origin === 'administration') {
        getStaffs()
      }

      getResidents()
      hasFetchData.current = true
    }
  }, []);

  // Function to perform api GET request to staffs
  const getStaffs = React.useCallback(async () => {
    try {
      const res = await api.get('administration/staffs/')
      setStaffs(res.data)
    } catch (err) {
      console.log(err)
    }
  }, [])
 
  // Function to perform api GET request to personal
  const getResidents = React.useCallback(async () => {
    try {
      const res = await api.get('profiling/personal/')
      setResidents(res.data)
    } catch (err) {
      console.log(err)
    }
  }, [])
  
  // Side effects for searching resident
  React.useEffect(()=>{

    const searchResident = residents.find((value) => value.per_id == residentSearch)
    const searchStaff = Boolean(staffs.some((value) => value.staff_id == searchResident?.per_id))
    searchStaff ? setIsStaff(true) : setIsStaff(false)

    if(searchResident && searchStaff !== true){

      setIsResidentFound(true)

      const fields = [
        { key: 'id', value: searchResident.per_id },
        { key: 'lastName', value: searchResident.per_lname },
        { key: 'firstName', value: searchResident.per_fname },
        { key: 'middleName', value: searchResident.per_mname },
        { key: 'suffix', value: searchResident.per_suffix },
        { key: 'sex', value: searchResident.per_sex },
        { key: 'dateOfBirth', value: searchResident.per_dob },
        { key: 'status', value: searchResident.per_status },
        { key: 'address', value: searchResident.per_address },
        { key: 'religion', value: searchResident.per_religion },
        { key: 'edAttainment', value: searchResident.per_edAttainment },
        { key: 'contact', value: searchResident.per_contact },
      ];

      fields.forEach(({ key, value }) => {
        form.setValue(key as keyof z.infer<typeof personalInfoSchema>, value || '');
      });

      } else {

        setIsResidentFound(false)
        form.reset(defaultValues)

      }

  }, [residentSearch])
  
  // Handle submit
  const submit = async () => {
    try {
      if (params.origin !== 'administration') {
        const values = form.getValues();
        const perId = await personal(values);
        await registered(perId)
        form.reset(defaultValues);
      }
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>

      <div className="grid gap-4">
        {params.origin === 'administration' && 
          <div className="relative">
            <Input placeholder="Search resident #..." value={residentSearch} onChange={(e)=> setResidentSearch(e.target.value)}/>
            {isResidentFound && 
              <CircleCheck size={24} className="absolute top-1/2 right-3 transform -translate-y-1/2 fill-green-500 stroke-white"/>
            }
            {isStaff && 
              <CircleAlert size={24} className="absolute top-1/2 right-3 transform -translate-y-1/2 fill-red-500 stroke-white"/>
            }
          </div>
        }
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-col gap-4"
          >
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <FormInput 
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Enter Last Name"
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />

              <FormInput 
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Enter First Name"
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />

              <FormInput 
                control={form.control}
                name="middleName"
                label="Middle Name"
                placeholder="Enter Middle Name"
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />

              <FormInput 
                control={form.control}
                name="suffix"
                label="Suffix"
                placeholder="Sfx."
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />
            </div>

            {/* Sex, Status, DOB, Birth Place */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 lg:col-span-1">
                    <FormLabel className="font-medium text-black/65">
                      Sex
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        placeholder='Select'
                        className="w-full"
                        options={[
                          {id: "female", name: "Female"},
                          {id: "male", name: "Male"},
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 lg:col-span-1">
                    <FormLabel className="font-medium text-black/65">
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <input type="date" className="bg-white border w-full p-1.5 rounded-md text-[14px] shadow-sm" {...field} readOnly={isResidentFound} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1 lg:col-span-1">
                    <FormLabel className="font-medium text-black/65">
                      Marital Status
                    </FormLabel>
                    <FormControl>
                      <SelectLayout
                        placeholder='Select'
                        className="w-full"
                        options={[
                          {id: "single", name: "Single"},
                          {id: "married", name: "Married"},
                          {id: "divorced", name: "Divorced"},
                          {id: "widowed", name: "Widowed"},
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormInput 
                control={form.control}
                name="address"
                label="Address"
                placeholder="Enter address"
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />
            </div>

            {/* Citizenship, Religion, Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <FormInput 
                control={form.control}
                name="edAttainment"
                label="Educational Attainment"
                placeholder="Enter educational attainment"
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />

              <FormInput 
                control={form.control}
                name="religion"
                label="Religion"
                placeholder="Enter religion"
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />

              <FormInput 
                control={form.control}
                name="contact"
                label="Contact"
                placeholder="Enter contact"
                readOnly={isResidentFound}
                className="lg:col-span-1"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-8 flex justify-end gap-3">
              {params.origin === 'administration' ? 
                (
                    <DialogLayout
                        trigger={
                          <Button type='submit' className="px-12">
                              Finish
                          </Button>
                        }
                        title='Position Assignment'
                        description='Assign a position to complete the registration'
                        mainContent={ 
                          <AssignPosition 
                            close={() => {
                              setResidentSearch('')
                              setIsAssignmentOpen(false)
                            }} 
                            personalInfoform={form}
                          />
                        } 
                        isOpen={isAssignmentOpen}
                        onOpenChange={setIsAssignmentOpen}
                    />
                ) : (
                    
                  <Button type="submit" className="w-full sm:w-32" > 
                    Register
                  </Button>
                )
              }                  
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

const FormInput = ({ control, name, label, placeholder, readOnly, className } : 
  {control: any, name: string, label: string, placeholder: string, readOnly: boolean, className?: string}
) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel className="font-medium text-black/65">{label}</FormLabel>
        <FormControl>
          <Input placeholder={placeholder} {...field} readOnly={readOnly} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

