import React from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { familyFormSchema } from "@/form-schema/profiling-schema";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

export default function ParentsForm({
    residents,
    form,
    prefix,
    title,
  }: {
    residents: Record<string, string>[]
    form: UseFormReturn<z.infer<typeof familyFormSchema>>;
    prefix: 'motherInfo' | 'fatherInfo';
    title: string;
  })  {

  const [residentSearch, setResidentSearch] = React.useState<string>('');

  React.useEffect(()=>{

    const searchResident = residents.find((value) => value.per_id == residentSearch)

    if(searchResident){

      form.setValue(`${prefix}`, {
        id: searchResident.per_id || '',
        lastName: searchResident.per_lname || '',
        firstName: searchResident.per_fname || '',
        middleName: searchResident.per_mname || '',
        suffix: searchResident.per_suffix || '',
        dateOfBirth: searchResident.per_dob || '',
        status: searchResident.per_status || '',
        religion: searchResident.per_religion || '',
        edAttainment: searchResident.per_edAttainment || '',
        contact: searchResident.per_contact || ''
      })

    } else {

      form.setValue(`${prefix}`, {
        id: '',
        lastName: '',
        firstName: '',
        middleName: '',
        suffix: '',
        dateOfBirth: '',
        status: '',
        religion: '',
        edAttainment: '',
        contact: ''
      })

    }

  }, [residentSearch])

  return (
    <div className="bg-white rounded-lg">
      <div className="mb-4">
        <h2 className="font-semibold text-lg">{title}</h2>
        <p className="text-xs text-black/50">Review all fields before proceeding</p>
      </div>

      <div className="grid gap-3">
        <Input
          placeholder="Search by resident #..."
          value={residentSearch}
          onChange={(e) => setResidentSearch(e.target.value)}
        />
        <Form {...form}>
          {/* Name row */}
          <form className="grid grid-cols-4 gap-4 mb-6">
            <FormField
              control={form.control}
              name={`${prefix}.lastName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} readOnly/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`${prefix}.firstName`}
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
              name={`${prefix}.middleName`}
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
              name={`${prefix}.suffix`}
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
              name={`${prefix}.dateOfBirth`}
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

            <FormField
              control={form.control}
              name={`${prefix}.status`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Marital Status
                  </FormLabel>
                    <Input className="w-full" {...field} readOnly />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`${prefix}.religion`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Religion
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
              name={`${prefix}.edAttainment`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Educational Attainment
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
              name={`${prefix}.contact`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black/65">
                    Contact#
                  </FormLabel>
                  <FormControl>
                    <Input className="w-full" {...field} readOnly />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
};
