/* 

  Note...

  This form is being utilized for creating, viewing, and updating resident records, and handles registration requests
  Additionally, it is being used for adminstrative position assignment or staff registration 

*/

import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Origin, Type } from "../profilingEnums";
import { renderActionButton } from "../profilingActionConfig";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { Combobox } from "@/components/ui/combobox";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import React from "react";

export default function PersonalInfoForm({
  formattedResidents,
  form,
  formType,
  isAssignmentOpen,
  origin,
  isSubmitting,
  isReadOnly,
  setIsAssignmentOpen,
  setFormType,
  submit,
  handleComboboxChange

}: {
  formattedResidents: any;
  form: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  formType: Type;
  isAssignmentOpen: boolean;
  origin: Origin;
  isSubmitting: boolean;
  isReadOnly: boolean;
  setIsAssignmentOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setFormType: React.Dispatch<React.SetStateAction<Type>>;
  submit: () => void;
  handleComboboxChange: () => void;
}) {
  return (
    <>
      {origin === Origin.Administration && (
        <Combobox
          options={formattedResidents}
          value={form.watch("per_id")}
          onChange={(value) => {
            form.setValue("per_id", value);
            handleComboboxChange();
          }}
          placeholder="Search for resident..."
          emptyMessage="No resident found"
        />
      )}

      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormInput
          control={form.control}
          name="per_lname"
          label="Last Name"
          placeholder="Enter Last Name"
          readOnly={isReadOnly}
        />
        <FormInput
          control={form.control}
          name="per_fname"
          label="First Name"
          placeholder="Enter First Name"
          readOnly={isReadOnly}
        />
        <FormInput
          control={form.control}
          name="per_mname"
          label="Middle Name"
          placeholder="Enter Middle Name"
          readOnly={isReadOnly}
        />
        <FormInput
          control={form.control}
          name="per_suffix"
          label="Suffix"
          placeholder="Sfx."
          readOnly={isReadOnly}
        />
      </div>

      {/* Sex, Status, DOB, Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormSelect
          control={form.control}
          name="per_sex"
          label="Sex"
          options={[
            { id: "female", name: "Female" },
            { id: "male", name: "Male" },
          ]}
          readOnly={isReadOnly}
        />
        <FormDateInput
          control={form.control}
          name="per_dob"
          label="Date of Birth"
          readOnly={isReadOnly}
        />
        <FormSelect
          control={form.control}
          name="per_status"
          label="Marital Status"
          options={[
            { id: "single", name: "Single" },
            { id: "married", name: "Married" },
            { id: "divorced", name: "Divorced" },
            { id: "widowed", name: "Widowed" },
          ]}
          readOnly={isReadOnly}
        />
        <FormInput
          control={form.control}
          name="per_address"
          label="Address"
          placeholder="Enter address"
          readOnly={isReadOnly}
        />
      </div>

      {/* Education, Religion, Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <FormInput
          control={form.control}
          name="per_edAttainment"
          label="Educational Attainment"
          placeholder="Enter educational attainment"
          readOnly={isReadOnly}
        />
        <FormInput
          control={form.control}
          name="per_religion"
          label="Religion"
          placeholder="Enter religion"
          readOnly={isReadOnly}
        />
        <FormInput
          control={form.control}
          name="per_contact"
          label="Contact"
          placeholder="Enter contact"
          readOnly={isReadOnly}
          type="number"
        />
      </div>

      {/* Action Button */}
      <div className="mt-8 flex justify-end gap-3">
        {renderActionButton({
          form,
          isAssignmentOpen,
          formType,
          origin,
          isSubmitting,
          setIsAssignmentOpen,
          setFormType,
          submit
        })}
      </div>
    </>
  );
}
