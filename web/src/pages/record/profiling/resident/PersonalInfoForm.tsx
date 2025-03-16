import { Input } from "@/components/ui/input";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { personal } from "../profilingPostRequests";
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

export default function PersonalInfoForm(){
  const location = useLocation()
  const defaultValues = generateDefaultValues(personalInfoSchema)
  const { params } = location.state || { params: {}}
  
  const form = useForm<z.infer<typeof personalInfoSchema>>({
      resolver: zodResolver(personalInfoSchema),
      defaultValues 
    })

  const submit = async () => {
    const res = await personal(form.getValues())

    if(res){
      form.reset(defaultValues)
    }
  }

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="flex flex-col gap-4"
        >
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem className="lg:col-span-4">
                  <FormLabel className="font-medium text-black/65">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem className="lg:col-span-4">
                  <FormLabel className="font-medium text-black/65">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-3">
                  <FormLabel className="font-medium text-black/65">
                    Middle Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Middle Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-1">
                  <FormLabel className="font-medium text-black/65">
                    Suffix
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Sfx." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
                        {id: "0", name: "Female"},
                        {id: "1", name: "Male"},
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
                    <input type="date" className="bg-white border w-full p-1.5 rounded-md text-[14px] shadow-sm" {...field} />
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
                        {id: "0", name: "Single"},
                        {id: "1", name: "Married"},
                        {id: "2", name: "Divorced"},
                        {id: "3", name: "Widowed"},
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
              name='address'
              render={({field}) => (
                  <FormItem className='col-span-1'>
                  <FormLabel className="font-medium text-black/65">
                      Address
                  </FormLabel>
                  <FormControl>
                      <Input placeholder='' {...field}/>
                  </FormControl>
                  <FormMessage/>
                  </FormItem>
              )}
          />
          </div>

          {/* Citizenship, Religion, Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <FormField
              control={form.control}
              name='edAttainment'
              render={({field}) => (
                  <FormItem className='col-span-2'>
                  <FormLabel className="font-medium text-black/65">
                      Education Attainment
                  </FormLabel>
                  <FormControl>
                      <Input placeholder='' {...field}/>
                  </FormControl>
                  <FormMessage/>
                  </FormItem>
              )}
          />
            <FormField
              control={form.control}
              name="religion"
              render={({ field }) => (
                <FormItem className='col-span-1'>
                  <FormLabel className="font-medium text-black/65">
                    Religion
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Religion" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem className='col-span-1'>
                  <FormLabel className="font-medium text-black/65">
                    Contact#
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contact" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end gap-3">
            {params.origin === 'administration' ? 
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
                  
                <Button type="submit" className="w-full sm:w-32" > 
                  Register
                </Button>
              )
            }                  
          </div>
        </form>
      </Form>
    </div>
  );
};

