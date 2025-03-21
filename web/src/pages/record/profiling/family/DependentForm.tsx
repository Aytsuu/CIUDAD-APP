import React from 'react';
import { z } from 'zod';
import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form/form";
import { Plus } from "lucide-react";
import { familyFormSchema } from '@/form-schema/profiling-schema';

export default function DependentForm(
  { form, residents }: {
    form: UseFormReturn<z.infer<typeof familyFormSchema>>,
    residents: Record<string, string>[]
  }) {

  const [search, setSearch] = React.useState<string>('');

  const { append } = useFieldArray({
    control: form.control,
    name: "dependentsInfo.list"
  });

  React.useEffect(() => {
    const searchResident = residents.find((value) => value.per_id == search);

    if (searchResident) {

      // Populate form fields with the fetched data
      form.setValue("dependentsInfo.new", {
        id: searchResident.per_id || '',
        lastName: searchResident.per_lname || '',
        firstName: searchResident.per_fname || '',
        middleName: searchResident.per_mname || '',
        suffix: searchResident.per_suffix || '',
        dateOfBirth: searchResident.per_sex || '',
        sex: searchResident.per_dob || ''
      })

    } else {

      // Clear form fields if no resident is found
      form.setValue("dependentsInfo.new", {
        id: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        dateOfBirth: '',
        sex: ''
      })
    }
  }, [search, residents, form]);

  const handleAddDependent = () => {
    const newDependent = form.getValues("dependentsInfo.new");

    const isValid = Object.values(newDependent).every((value) => value !== "");

    if (isValid) {
      append(newDependent);
    }
  };

  return (
    <div className="grid gap-3">
      <Input
        placeholder="Search by resident #..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
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
                    <Input className="w-full" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dependentsInfo.new.firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dependentsInfo.new.middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Middle Name
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dependentsInfo.new.suffix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Suffix
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dependentsInfo.new.sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Sex
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dependentsInfo.new.dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Date of Birth
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} readOnly />
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
                <Plus /> Dependent
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}