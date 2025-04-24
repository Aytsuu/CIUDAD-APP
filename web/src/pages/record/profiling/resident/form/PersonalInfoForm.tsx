import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Origin, Type } from "../../profilingEnums";
import { renderActionButton } from "../../profilingActionConfig";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import React from "react";
import { Combobox } from "@/components/ui/combobox";

// ==================== TYPES ====================
type PersonalInfoFormProps = {
  formattedResidents?: any;
  form: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  formType: Type;
  isAssignmentOpen?: boolean;
  origin?: Origin;
  isSubmitting: boolean;
  isReadOnly: boolean;
  isAllowSubmit?: boolean;
  setIsAssignmentOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setFormType?: React.Dispatch<React.SetStateAction<Type>>;
  submit: () => void;
  reject?: () => void;
  onComboboxChange?: () => void;  
};

// ==================== CONSTANTS ====================
const SEX_OPTIONS = [
  { id: "female", name: "Female" },
  { id: "male", name: "Male" },
];

const MARITAL_STATUS_OPTIONS = [
  { id: "single", name: "Single" },
  { id: "married", name: "Married" },
  { id: "divorced", name: "Divorced" },
  { id: "widowed", name: "Widowed" },
];

// ==================== COMPONENT ====================
const PersonalInfoForm = ({
  formattedResidents,
  form,
  formType,
  isAssignmentOpen,
  origin,
  isSubmitting = false,
  isReadOnly = false,
  isAllowSubmit,
  setIsAssignmentOpen,
  setFormType,
  submit,
  reject,
  onComboboxChange,
}: PersonalInfoFormProps) => {
  const { control, setValue, watch } = form;

  // ==================== RENDER ====================
  return (
    <>
      {origin === Origin.Administration && formattedResidents && (
        <Combobox
          options={formattedResidents}
          value={watch("per_id")}
          onChange={(value) => {
            setValue("per_id", value);
            onComboboxChange && onComboboxChange();
          }}
          placeholder="Select a resident"
          emptyMessage="No resident found"
        />
      )}
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormInput
          control={control}
          name="per_lname"
          label="Last Name"
          placeholder="Enter Last Name"
          readOnly={isReadOnly}
        />
        <FormInput
          control={control}
          name="per_fname"
          label="First Name"
          placeholder="Enter First Name"
          readOnly={isReadOnly}
        />
        <FormInput
          control={control}
          name="per_mname"
          label="Middle Name"
          placeholder="Enter Middle Name"
          readOnly={isReadOnly}
        />
        <FormInput
          control={control}
          name="per_suffix"
          label="Suffix"
          placeholder="Sfx."
          readOnly={isReadOnly}
        />
      </div>

      {/* Sex, Status, DOB, Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormSelect
          control={control}
          name="per_sex"
          label="Sex"
          options={SEX_OPTIONS}
          readOnly={isReadOnly}
        />
        <FormDateTimeInput
          control={control}
          name="per_dob"
          label="Date of Birth"
          type="date"
          readOnly={isReadOnly}
        />
        <FormSelect
          control={control}
          name="per_status"
          label="Marital Status"
          options={MARITAL_STATUS_OPTIONS}
          readOnly={isReadOnly}
        />
        <FormInput
          control={control}
          name="per_address"
          label="Address"
          placeholder="Enter address"
          readOnly={isReadOnly}
        />
      </div>

      {/* Education, Religion, Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <FormInput
          control={control}
          name="per_edAttainment"
          label="Educational Attainment"
          placeholder="Enter educational attainment"
          readOnly={isReadOnly}
        />
        <FormInput
          control={control}
          name="per_religion"
          label="Religion"
          placeholder="Enter religion"
          readOnly={isReadOnly}
        />
        <FormInput
          control={control}
          name="per_contact"
          label="Contact"
          placeholder="Enter contact"
          readOnly={isReadOnly}
          type="number"
        />
      </div>

      <div className="mt-8 flex justify-end gap-3">
        {renderActionButton({
          form,
          isAssignmentOpen,
          formType,
          origin,
          isSubmitting,
          isAllowSubmit,
          setIsAssignmentOpen,
          setFormType,
          submit,
          reject
        })}
      </div>
    </>
  );
} 

export default PersonalInfoForm;