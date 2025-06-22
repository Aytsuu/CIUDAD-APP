"use client";

import React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button/button";
import { ChevronLeft, Save } from "lucide-react";
import { toast } from "sonner";
import CardLayout from "@/components/ui/card/card-layout";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientRecordSchema } from "@/pages/record/health/patientsRecord/patients-record-schema";
import { Form } from "@/components/ui/form/form";
import { useLocation } from "react-router";
import { generateDefaultValues } from "@/pages/record/health/patientsRecord/generateDefaultValues";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";

import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { Combobox } from "@/components/ui/combobox";
import { Label } from '@/components/ui/label';

import { useResidents } from "./queries/patientsFetchQueries";
import { useAddPatient } from "./queries/patientsAddQueries";


interface ResidentProfile {
  rp_id: string;
  households: {
    hh_id: string;
  }
  personal_info: {
    per_lname: string;
    per_fname: string;
    per_mname: string;
    per_sex: string;
    per_contact: string;
    per_dob: string;
    per_addresses: Array<{
      add_street: string;
      add_barangay: string;
      add_city: string;
      add_province: string;
      sitio?: string;
    }>
  }
}

interface PatientCreationData {
  pat_type: string;
  rp_id?: string;
  transient_data?: {
    tran_lname: string;
    tran_fname: string;
    tran_mname?: string;
    tran_dob: string;
    tran_sex: string;
    tran_contact: string;
    tran_ed_attainment?: string;
    tran_religion?: string;
    tran_status?: string;
    address?: {
      tradd_street?: string;
      tradd_sitio?: string;
      tradd_barangay?: string;
      tradd_city?: string;
      tradd_province?: string;
    }
  } 
}

export default function CreatePatientRecord() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const defaultValues = generateDefaultValues(patientRecordSchema);

  // Initialize form with react-hook-form and zod validation
  const form = useForm<z.infer<typeof patientRecordSchema>>({
    resolver: zodResolver(patientRecordSchema),
    defaultValues,
  });


  const [selectedResidentId, setSelectedResidentId] = useState<string>("")
  const { data: residentsData, isLoading: residentLoading } = useResidents();

  const persons = {
    default: residentsData || [],
    formatted:
      residentsData?.map((personal: any) => ({
        id: personal.rp_id.toString(),
        name: `${personal.personal_info?.per_lname || ""}, ${personal.personal_info?.per_fname || ""} ${personal.personal_info?.per_mname || ""}`.trim()
      })) || []
  };


  const handlePatientSelection = (id: string) => {
    setSelectedResidentId(id);
    console.log("Selected Resident ID:", id);
    const selectedPatient: ResidentProfile | undefined = persons.default.find((p: ResidentProfile) => p.rp_id.toString() === id);

    if(selectedPatient && selectedPatient.personal_info){
      console.log("Selected Patient:", selectedPatient);

      const personalInfo = selectedPatient.personal_info;
      const sexLowercase = personalInfo.per_sex?.toLowerCase();
      
      if (Array.isArray(selectedPatient?.households)) {
        console.log("Household Nos:", selectedPatient.households.map(h => h.hh_id));
      }
      
      // Populate form fields for display only (read-only)
      form.setValue("lastName", personalInfo.per_lname || "");
      form.setValue("firstName", personalInfo.per_fname || "");
      form.setValue("middleName", personalInfo.per_mname || "");
      form.setValue("sex", sexLowercase || "");
      form.setValue("contact", personalInfo.per_contact || "");
      form.setValue("dateOfBirth", personalInfo.per_dob || "");
      form.setValue("patientType", "resident"); 


      if (selectedPatient.personal_info.per_addresses && selectedPatient.personal_info.per_addresses.length > 0) {
        const address = selectedPatient.personal_info.per_addresses[0]; // Get first address

        form.setValue("address.street", address.add_street || "");
        form.setValue("address.sitio", address.sitio || "");
        form.setValue("address.barangay", address.add_barangay || "");
        form.setValue("address.city", address.add_city || "");
        form.setValue("address.province", address.add_province || "");
      } else {
        form.setValue("address.street", "");
        form.setValue("address.sitio", "");
        form.setValue("address.barangay", "");
        form.setValue("address.city", "");
        form.setValue("address.province", "");
      }
    }
  }


  const createNewPatient = useAddPatient();
  const handleCreatePatientId = async (patientData: PatientCreationData) => {
    try {
      const result = await createNewPatient.mutateAsync(patientData);
      
      if (result) {
        toast("Patient record has been created successfully");
        return true;
      } else {
        toast("Patient record may have been created. Please refresh to verify.");
        return false;
      }
    } catch (error) {
      console.error("Error creating patient record:", error);
      toast("Failed to create patient record.", {
        description: "An error occurred while creating the patient record. Please check the details and try again."});
      return false;
    }
  }

  const submit = async () => {
    const formData = form.getValues();

    if (formData.patientType ==="resident" && !selectedResidentId){
      toast("Please select a resident first");
      return;
    }


    if(formData.patientType === "transient"){
      const requiredFields = ['lastName', 'firstName', 'dateOfBirth', 'sex', 'contact'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

      if(missingFields.length > 0){
        toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const patientType = formData.patientType === "resident" ? "Resident" : formData.patientType === "transient" ? "Transient" : "Resident" 
      const sexType = formData.sex === "female" ? "Female" : "Male";
      form.setValue("houseNo", "N/A")
      
      let patientData: PatientCreationData;

      if (patientType === 'Resident') {
         patientData = {
          pat_type: patientType,
          rp_id: selectedResidentId
        };
      } else {
        patientData = {
          pat_type: patientType,
          transient_data: {
            tran_lname: formData.lastName,
            tran_fname: formData.firstName,
            tran_mname: formData.middleName,
            tran_dob: formData.dateOfBirth,
            tran_sex: sexType,
            tran_contact: formData.contact,
            tran_status: "Active",
            tran_ed_attainment: "Not Specified",
            tran_religion: "Not Specified",
            address: {
              tradd_street: formData.address?.street || "",
              tradd_sitio: formData.address?.sitio || "",
              tradd_barangay: formData.address?.barangay || "",
              tradd_city: formData.address?.city || "",
              tradd_province: formData.address?.province || "",
            }
          }
        }
      }
      
      console.log("Creating patient with data:", patientData);

      const success = await handleCreatePatientId(patientData);
      
      if (success) {
        form.reset(defaultValues);
        setSelectedResidentId("");

        navigate(-1)
      }
    } catch (error) {
      toast("Failed to create patient record. Please try again.");
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
              Patient Registration
            </h1>
            <p className="text-xs sm:text-sm text-darkGray">
              Add a Patient
            </p>
          </div>
        </div>
      </div>
      <Separator className="bg-gray mb-2 sm:mb-4" />

      <div className="mb-4 max-w-lg">
        <div className="relative">
          <Combobox
            options={persons.formatted}
            value={selectedResidentId}
            onChange={handlePatientSelection}
            placeholder={residentLoading ? "Loading residents..." : "Select a resident"}
            triggerClassName="font-normal w-[30rem]"
            emptyMessage={
              <div className="flex flex-col gap-2 justify-center items-center">
                <Label className="font-normal text-[13px]">
                  {residentLoading ? "Loading..." : "No residents were found without an assigned Patient ID."}
                </Label>
                <Link to="/residents/new">
                  <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                    Register New Resident
                  </Label>
                </Link>
              </div>
            }
          />
        </div>
        <p className="mt-2 ml-2 text-sm text-muted-foreground">
          Select a resident if they are already registered.
        </p>
      </div>
        <CardLayout
          title="Patient Information"
          description="Review the patient information and set patient type"
          content={
            <div className="w-full mx-auto border-none">
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
                    {/* Personal Information Section - Read Only */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormInput control={form.control} name="lastName" label="Last Name" placeholder="Enter last name" readOnly={false} />
                      <FormInput control={form.control} name="firstName" label="First Name" placeholder="Enter first name" readOnly={false} />
                      <FormInput control={form.control} name="middleName" label="Middle Name" placeholder="Enter middle name" readOnly={false} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <FormSelect 
                        control={form.control} 
                        name="sex" 
                        label="Sex" 
                        options={[
                          { id: 'female', name: "Female" }, 
                          { id: 'male', name: "Male" }
                        ]}
                        readOnly={false}
                      />
                      <FormInput control={form.control} name="contact" label="Contact" placeholder="Enter contact" readOnly={false} />
                      <FormDateTimeInput control={form.control} name="dateOfBirth" label="Date of Birth" type='date' readOnly={false}/>
                      <FormSelect 
                        control={form.control} 
                        name="patientType" 
                        label="Patient Type" 
                        options={[
                          { id: 'resident', name: "Resident" }, 
                          { id: 'transient', name: "Transient" }
                        ]}
                        readOnly={false}
                      />
                    </div>

                    {/* Address Section - Read Only */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                      <FormInput control={form.control} name="address.street" label="Street" placeholder="Enter street " readOnly={false} />
                      <FormInput control={form.control} name="address.sitio" label="Sitio" placeholder="Enter sitio " readOnly={false}/>
                      <FormInput control={form.control} name="address.barangay" label="Barangay" placeholder="Enter barangay " readOnly={false}/>
                      <FormInput control={form.control} name="address.city" label="City" placeholder="Enter city " readOnly={false}/>
                      <FormInput control={form.control} name="address.province" label="Province" placeholder="Enter province " readOnly={false}/>
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
                            Creating Patient Record...
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Save className="mr-2 h-4 w-4" />
                            Save Patient
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