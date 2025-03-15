import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { profilingFormSchema } from "@/form-schema/profiling-schema";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { SelectLayout } from "@/components/ui/select/select-layout";

export default function PersonalInfoForm(
  {form, onSubmit, back}: {
    form: UseFormReturn<z.infer<typeof profilingFormSchema>>,
    onSubmit: () => void,
    back: () => void
}){

  const submit = () => {
    // Validate personal information fields
    form.trigger("personalInfo").then((isValid) => {
      if(isValid) onSubmit(); // Proceed next process if true
    })
    
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
          className="flex flex-col gap-4 px-2 sm:px-6 md:px-12 lg:px-24"
        >
          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="personalInfo.lastName"
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
              name="personalInfo.firstName"
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
              name="personalInfo.middleName"
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
              name="personalInfo.suffix"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
            <FormField
              control={form.control}
              name="personalInfo.sex"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-2">
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
              name="personalInfo.dateOfBirth"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-2">
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
              name="personalInfo.status"
              render={({ field }) => (
                <FormItem className="sm:col-span-1 lg:col-span-2">
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
              name='personalInfo.streetAddress'
              render={({field}) => (
                  <FormItem className='col-span-6'>
                  <FormLabel className="font-medium text-black/65">
                      Street Address
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="personalInfo.religion"
              render={({ field }) => (
                <FormItem>
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
              name="personalInfo.contact"
              render={({ field }) => (
                <FormItem>
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
              <Button variant="outline" className="w-full sm:w-32" onClick={back}>
                Prev
              </Button>
              <Button type="submit" className="w-full sm:w-32" onClick={onSubmit}> 
                Next
              </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

