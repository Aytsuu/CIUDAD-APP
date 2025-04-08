import { useState } from 'react';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form/form";
import { SelectLayout } from "@/components/ui/select/select-layout";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AddCertificateSchema from "@/form-schema/addDocumentSchema";

//icons
import { UserRound } from "lucide-react";

function CreateCertificate() {
  const inputcss = "mt-[12px] w-full p-1.5 shadow-sm sm:text-sm";

  const clearanceOptions = [
    { id: "employment", name: "Employment" },
    { id: "firstTimeJobSeeker", name: "First Time Job Seeker" },
    { id: "bir", name: "BIR" },
    { id: "noDegatory", name: "No Degatory Record" },
    { id: "barangayClearance", name: "Barangay Clearance" },
    { id: "nbi", name: "NBI" },
  ];

  const purposeTypes = [
    { id: "commercial", name: "Commercial" },
    { id: "residential", name: "Residential" },
  ];

  const form = useForm<z.infer<typeof AddCertificateSchema>>({
    resolver: zodResolver(AddCertificateSchema),
    defaultValues: {
      requestedBy: "",
      typeOfClearance: "",
      purpose: "",
      clearanceTypes: [],
    },
  });

  function onSubmit(values: z.infer<typeof AddCertificateSchema>) {
    console.log(values);
  }

  return (
    <div className="p-5 w-full mx-auto"> 
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            
            <div>
              {/* Request Name */}
              <div className="flex items-center gap-2">
                <UserRound className="w-12 h-12 text-gray-500" />
                <div className="flex flex-col w-full">
                  <FormField
                    control={form.control}
                    name="requestedBy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested by</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter name" className={inputcss} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2 pl-12">
                        {purposeTypes.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              id={type.id}
                              value={type.id}
                              checked={field.value === type.id}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="form-radio"
                            />
                            <label htmlFor={type.id}>{type.name}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage className='pl-12' />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Types of Clearance */}
            <div>
              <FormField
                control={form.control}
                name="typeOfClearance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type of Clearance</FormLabel>
                    <FormControl>
                      <SelectLayout
                        className={inputcss}
                        label="Type"
                        placeholder="Select clearance type"
                        options={clearanceOptions}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="clearanceTypes"
                  render={({ field }) => (
                    <FormItem>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {clearanceOptions.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2 bg-gray-50 p-3 rounded">
                            <input
                              type="checkbox"
                              id={option.id}
                              value={option.id}
                              checked={field.value.includes(option.id)}
                              onChange={(e) => {
                                const newValue = e.target.checked
                                  ? [...field.value, option.id]
                                  : field.value.filter((val) => val !== option.id);
                                field.onChange(newValue);
                              }}
                              className="form-checkbox"
                            />
                            <label htmlFor={option.id}>{option.name}</label>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button type="submit" className="bg-[#137F8B] hover:bg-[#137F8B]-700">
              Create Document
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateCertificate;