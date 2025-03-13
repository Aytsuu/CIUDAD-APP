import React from 'react';
import { z } from 'zod';
import { useFieldArray, UseFormReturn, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Plus } from "lucide-react";
import { profilingFormSchema } from '@/form-schema/profiling-schema';
import { SelectLayout } from '@/components/ui/select/select-layout';

export default function DependentForm(
  {form}: {
    form: UseFormReturn<z.infer<typeof profilingFormSchema>>,
}){

  const { append } = useFieldArray({
    control: form.control,
    name: "dependentsInfo.list"
  })

  const handleAddDependent = () => {

    const newDependent = form.getValues("dependentsInfo.new");

    const isValid = Object.values(newDependent).every((value) => value !== "")

    if(isValid){
      append(newDependent)

      form.setValue("dependentsInfo.new.lastName", "")
      form.setValue("dependentsInfo.new.firstName", "")
      form.setValue("dependentsInfo.new.middleName", "")
      form.setValue("dependentsInfo.new.suffix", "")
      form.setValue("dependentsInfo.new.sex", "")
      form.setValue("dependentsInfo.new.dateOfBirth", "")
    }
  }

  return (
    <div className="px-4 md:px-8 lg:px-24">
      <Form {...form}>
        <form>
          {/* Name row - now 3 columns, responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <FormField
              control={form.control}
              name="dependentsInfo.new.lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="Enter Last Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dependentsInfo.new.firstName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="Enter First Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dependentsInfo.new.middleName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Middle Name
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="Enter Middle Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dependentsInfo.new.suffix`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Suffix
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" placeholder="Sfx." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dependentsInfo.new.sex`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Sex
                  </FormLabel>
                  <SelectLayout
                    placeholder='Select'
                    className='w-full'
                    options={[
                      {id: "0", name: "Female"},
                      {id: "1", name: "Male"}
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`dependentsInfo.new.dateOfBirth`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Date of Birth
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      className="w-full" 
                      placeholder="dd/mm/yyyy" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-end'>
              <Button
                type='button'
                onClick={handleAddDependent}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus/>Dependent
              </Button>
            </div>
          </div>
        </form>
      </Form>   
    </div>
  );
}