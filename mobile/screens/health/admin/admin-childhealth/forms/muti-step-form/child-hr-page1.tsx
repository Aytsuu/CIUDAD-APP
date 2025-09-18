"use client";
import { useEffect } from "react";
import type React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form/form";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form/form-input";
import { PatientSearch } from "@/components/ui/patientSearch";
import type { Patient } from "@/components/ui/patientSearch";
import type { FormData } from "@/form-schema/chr-schema/chr-schema";
import { BasicInfoSchema } from "@/form-schema/chr-schema/chr-schema";
import { ChevronRight } from "lucide-react";
import type { Page1Props } from "./types";
import {  ChildInfoSection } from "../sections/child-info-section";
import { MotherInfoSection } from "../sections/mother-info-section";
import { FatherInfoSection } from "../sections/father-info-section";
import { AddressSection } from "../sections/address-section";
import { 
  populatePatientData, 
  updateAgeFields 
} from "../sections/child-info-utils";

export default function ChildHRPage1({
  onNext,
  updateFormData,
  formData,
  mode,
  selectedPatient,
  setSelectedPatient,
  selectedPatientId,
  setSelectedPatientId,
}: Page1Props) {
  const isAddNewMode = mode === "addnewchildhealthrecord";

  const form = useForm<FormData>({
    resolver: zodResolver(BasicInfoSchema),
    mode: "onChange",
    defaultValues: formData,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState,
    setError,
    clearErrors,
  } = form;

  const { isSubmitting } = formState;
  const residenceType = watch("residenceType");
  const isTransient = residenceType === "Transient";
  const childDob = watch("childDob");
  const motherdob = watch("motherdob");
  const fatherdob = watch("fatherdob");
  const placeOfDeliveryType = watch("placeOfDeliveryType");
  const placeOfDeliveryLocation = watch("placeOfDeliveryLocation");

  // Handle age calculations
  useEffect(() => {
    updateAgeFields(childDob, motherdob, fatherdob, setValue);
  }, [childDob, motherdob, fatherdob, setValue]);

  // Add validation for HC location
  useEffect(() => {
    if (placeOfDeliveryType === "HC") {
      if (!placeOfDeliveryLocation || placeOfDeliveryLocation.trim() === "") {
        setError("placeOfDeliveryLocation", {
          type: "required",
          message: "Location is required when HC is selected",
        });
      } else {
        clearErrors("placeOfDeliveryLocation");
      }
    } else {
      clearErrors("placeOfDeliveryLocation");
    }
  }, [placeOfDeliveryType, placeOfDeliveryLocation, setError, clearErrors]);

  // Update parent form data on change
  useEffect(() => {
    const subscription = watch((value) => {
      updateFormData(value as Partial<FormData>);
    });
    return () => subscription.unsubscribe();
  }, [watch, updateFormData]);

  const handlePatientSelect = (patient: Patient | null, patientId: string) => {
    setSelectedPatient(patient);
    setSelectedPatientId(patientId);
    reset(populatePatientData(patient));
    updateFormData(populatePatientData(patient));
  };

  const onSubmitForm = async (data: FormData) => {
    try {
      if (data.placeOfDeliveryType === "HC" && !data.placeOfDeliveryLocation?.trim()) {
        setError("placeOfDeliveryLocation", {
          type: "required",
          message: "Location is required when HC is selected",
        });
        return;
      }
      console.log("PAGE 1 submitted data:", data);
      updateFormData(data);
      onNext();
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(onSubmitForm, (errors) => {
      console.error("Form validation errors:", errors);
    })(e);
  };

  return (
    <>
      <div className="font-light text-zinc-400 flex justify-end mb-8 mt-4">
        Page 1 of 4
      </div>
      <Form {...form}>
        {!isAddNewMode && (
          <div className="flex items-center justify-between gap-3 mb-10 w-full">
            <div className="flex-1">
              <PatientSearch
                onPatientSelect={handlePatientSelect}
                className="w-full"
                value={selectedPatientId}
                onChange={setSelectedPatientId}
                ischildren={true}
                

              />
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
          <div className="flex w-full flex-wrap gap-4">
            <div className="flex justify-end gap-4 w-full">
              <FormInput
                control={control}
                name="residenceType"
                label="Residence Type"
                type="text"
                readOnly={isAddNewMode || !!selectedPatient}
                className="w-[200px]"
              />
            </div>
            <div className="flex justify-end gap-4 w-full">
              <FormInput
                control={control}
                name="familyNo"
                label="Family No:"
                type="text"
                readOnly={isAddNewMode || (!isTransient && !!selectedPatient)}
                className="w-[200px]"
              />
              <FormInput
                control={control}
                name="ufcNo"
                label="UFC No:"
                type="text"
                readOnly={isAddNewMode || !!selectedPatient}
                className="w-[200px]"
              />
            </div>
          </div>

          <ChildInfoSection 
            control={control} 
            isAddNewMode={isAddNewMode} 
            selectedPatient={selectedPatient} 
            isTransient={isTransient}
            placeOfDeliveryType={placeOfDeliveryType}
          />

          <MotherInfoSection 
            control={control} 
            isAddNewMode={isAddNewMode} 
            selectedPatient={selectedPatient} 
            isTransient={isTransient}
          />

          <FatherInfoSection 
            control={control} 
            isAddNewMode={isAddNewMode} 
            selectedPatient={selectedPatient} 
            isTransient={isTransient}
          />

          <AddressSection 
            control={control} 
            isAddNewMode={isAddNewMode} 
            selectedPatient={selectedPatient} 
            isTransient={isTransient}
          />

          <div className="flex justify-end">
            <Button type="submit" className="flex items-center gap-2 px-6">
              {isSubmitting ? "Loading..." : "Next"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}