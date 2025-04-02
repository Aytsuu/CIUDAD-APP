import { z } from "zod";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Control } from "react-hook-form";
import { businessFormSchema } from "@/form-schema/profiling-schema";
import { MediaUpload } from "@/components/ui/media-upload";
import { renderActionButton } from "../actionConfig";
import { Type } from "../profilingEnums";
import React from "react";

export default function BusinessProfileForm({
  formType,
  sitio,
  control,
  isSubmitting,
  isReadOnly,
  mediaFiles,
  activeVideoId,
  url,
  setFormType,
  setMediaFiles,
  setActiveVideoId,
  submit
}: {
  formType: Type;
  sitio: any[];
  control: Control<z.infer<typeof businessFormSchema>>;
  isSubmitting: boolean;
  isReadOnly: boolean;
  mediaFiles: any[];
  activeVideoId: string;
  url: string;
  setFormType: React.Dispatch<React.SetStateAction<Type>>;
  setMediaFiles: React.Dispatch<React.SetStateAction<any[]>>;
  setActiveVideoId: React.Dispatch<React.SetStateAction<string>>;
  submit: () => void;
}) {
  return (
    <>
      <div className="w-full">
        <Label className="text-lg font-semibold">Respondent Information</Label>
        <p className="text-xs text-black/50 mb-4">Fill out all necessary fields</p>

        <div className="grid grid-cols-5 gap-4">
          <FormInput control={control} name="bus_respondentLname" label="Last Name" placeholder="Enter last name" readOnly={isReadOnly}/>
          <FormInput control={control} name="bus_respondentFname" label="First Name" placeholder="Enter first name" readOnly={isReadOnly}/>
          <FormInput control={control} name="bus_respondentMname" label="Middle Name" placeholder="Enter middle name" readOnly={isReadOnly}/>
          <FormSelect control={control} name="bus_respondentSex" label="Sex" options={[
            {id: "female", name: "Female"},
            {id: "male", name: "Male"}
          ]} readOnly={isReadOnly}/>
          <FormDateInput control={control} name="bus_respondentDob" label="Date of Birth" readOnly={isReadOnly}/>
        </div>
      </div>

      <Separator />

      <div className="w-full">
        <Label className="text-lg font-semibold">Business Information</Label>
        <p className="text-xs text-black/50 mb-4">Fill out all necessary fields</p>

        <div className="grid grid-cols-4 gap-4">
          <FormInput control={control} name="bus_name" label="Business Name" placeholder="Enter business name" readOnly={isReadOnly}/>
          <FormInput control={control} name="bus_gross_sales" label="Gross Sales" placeholder="Enter gross sales" readOnly={isReadOnly}/>
          <FormSelect control={control} name="sitio" label="Sitio" options={sitio} readOnly={isReadOnly}/>
          <FormInput control={control} name="bus_street" label="Street Address" placeholder="Enter street address" readOnly={isReadOnly}/>
        </div>
      </div>

      {formType !== Type.Viewing ? (<MediaUpload
        title="Supporting Documents"
        description="Upload supporting documents that verify your reported gross sales. 
              Acceptable files include Official sales receipts or invoices, 
              Bank statements showing business transactions, etc."
        mediaFiles={mediaFiles}
        activeVideoId={activeVideoId}
        setMediaFiles={setMediaFiles}
        setActiveVideoId={setActiveVideoId}
      />) : (
        <div className="flex flex-col gap-4 border p-5 rounded-md">
            <Label className="text-[15px]">Supporting Documents</Label>
            <div>
              <img src={url} className="w-52 h-52 border shadow-sm"/>
            </div>
        </div>
      )}

      <div className="flex justify-end mt-8">
        {renderActionButton({
          formType,
          origin: 'defaultOrigin',
          isSubmitting,
          setFormType,
          submit  
        })}
      </div>
    </>
  );
}