"use client";

import React from "react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Save, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import CardLayout from "@/components/ui/card/card-layout";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema";
import { Form } from "@/components/ui/form/form";
import { useLocation } from "react-router";
import { generateDefaultValues } from "@/pages/record/health/patientsRecord/generateDefaultValues";
import { personal } from "@/pages/record/health/patientsRecord/patientPostRequest";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";

import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Combobox } from "@/components/ui/combobox";
import { Label } from '@/components/ui/label';

export default function CreatePatientRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const location = useLocation();
  const defaultValues = generateDefaultValues(patientRecordSchema);
  const { params } = location.state || { params: {} };

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof patientRecordSchema>>({
    resolver: zodResolver(patientRecordSchema),
    defaultValues,
  });

  const handleHouseholdChange = React.useCallback((value: any) => {
      form.setValue('houseNo', value);
  }, [form]);

  const submit = async () => {
    setIsSubmitting(true);
    try {
      const res = await personal(form.getValues());

      if (res) {
        toast({
          title: "Success",
          description: "Patient record has been created successfully",
        });
        form.reset(defaultValues);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create patient record. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          {/* Header - Stacks vertically on mobile */}
          <Button
            className="bg-white text-black p-2 self-start"
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-xl sm:text-2xl text-darkBlue2">
              Patients Records
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Create Patient Record
            </p>
          </div>
        </div>
      </div>
      <Separator className="bg-gray mb-2 sm:mb-4" />

      <div className="mb-4 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for existing patients..."
            className="w-full pl-10 bg-white border-muted"
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground pl-1">
          Check if patient already exists by name, contact number, or ID
        </p>
      </div>

      <CardLayout
        title="Patients Information"
        description="Fill in the required fields to create a new patient record"
        content={
          <div className="w-full mx-auto border-none  ">
            <Separator className="w-full bg-gray" />
            <div className="pt-4">
              <Form {...form}>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit();
                  }}
                  className="space-y-6"
                >
                  {/* Personal Information Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Last Name */}
                    <FormInput control={form.control} name="lastName" label="Last Name" placeholder="Enter last name" readOnly={isReadOnly} />
                    {/* First Name */}
                    <FormInput control={form.control} name="firstName" label="First Name" placeholder="Enter first name" readOnly={isReadOnly} />
                    {/* Middle Name */}
                    <FormInput control={form.control} name="middleName" label="Middle Name" placeholder="Enter middle name" readOnly={isReadOnly} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <FormSelect control={form.control} name="gender" label="Sex" options={[{ id: "female", name: "Female" }, { id: "male", name: "Male" },]}/>
                    <FormInput control={form.control} name="contact" label="Contact" placeholder="Enter contact" readOnly={isReadOnly} />
                    <FormDateTimeInput control={form.control} name="dateOfBirth" label="Date of Birth" type='date'/>            
                    <FormSelect control={form.control} name="patientType" label="Patient Type" options={[{ id: "Resident", name: "Resident" }, { id: "Transient", name: "Transient" },]}/>
                  </div>

                  {/* Address Section */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className='grid gap-2 items-end'>
                      <Label className="mb-1">Household</Label>
                        <Combobox 
                          options={[]}
                          value={form.watch(`houseNo`)}
                          onChange={handleHouseholdChange}
                          placeholder='Search for household...'
                          contentClassName='w-full'
                          emptyMessage='No household found'
                    />
                    </div>
                    <FormInput control={form.control} name="street" label="Street Address" placeholder="Enter street address" readOnly={isReadOnly} />
                    <FormSelect control={form.control} name="sitio" label="Select Sitio" options={[{ id: "Palma", name: "Palma" }, { id: "Cuenco", name: "Cuenco" },]}/>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-buttonBlue hover:bg-buttonBlue/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="mr-2 h-4 w-4" />
                          Save Record
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        }
        cardClassName="border-none pb-2 p-3 rounded-lg"
        headerClassName="pb-2 bt-2 text-xl"
        contentClassName="pt-0"
      />
    </div>
  );
}
        
