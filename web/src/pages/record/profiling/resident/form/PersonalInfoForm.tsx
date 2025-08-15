import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { Origin, Type } from "../../ProfilingEnums";
import { renderActionButton } from "../../ProfilingActionConfig";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import React from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button/button";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { capitalize } from "@/helpers/capitalize";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Link } from "react-router";

// ==================== TYPES ====================
type PersonalInfoFormProps = {
  formattedSitio?: any;
  formattedResidents?: any;
  addresses?: any[];
  validAddresses?: boolean[];
  form: UseFormReturn<z.infer<typeof personalInfoSchema>>;
  formType: Type;
  isAssignmentOpen?: boolean;
  origin?: Origin;
  isSubmitting: boolean;
  isReadOnly: boolean;
  isAllowSubmit?: boolean;
  setAddresses?: React.Dispatch<React.SetStateAction<any[]>>;
  setValidAddresses?: React.Dispatch<React.SetStateAction<boolean[]>>;
  setIsAssignmentOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setFormType?: React.Dispatch<React.SetStateAction<Type>>;
  submit: () => void;
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

const RELIGION_OPTIONS = [
  { id: "roman catholic", name: "Roman Catholic" },
  { id: "muslim", name: "Muslim" },
  { id: "iglesia ni cristo", name: "Iglesia ni Cristo" },
  { id: "born again", name: "Born Again" },
]

// ==================== COMPONENT ====================
const PersonalInfoForm = ({
  formattedSitio,
  formattedResidents,
  addresses,
  validAddresses,
  form,
  formType,
  isAssignmentOpen,
  origin,
  isSubmitting = false,
  isReadOnly = false,
  isAllowSubmit,
  setAddresses,
  setValidAddresses,
  setIsAssignmentOpen,
  setFormType,
  submit,
  onComboboxChange,
}: PersonalInfoFormProps) => {
  // ============= INITIALIZING STATES =============
  const { control, setValue, watch } = form;

  const handleSetAddress = (idx: number, field: string, value: string) => {
    setAddresses && setAddresses(prev => 
      prev.map((address, prevIdx) => {
        return (prevIdx === idx ? 
          {...address, [field]: field !== "sitio" ? capitalize(value) : value} 
          : address)
      })
    )
  }   

  const handleRemoveAddress = (idx: number) => {
    setValidAddresses && setValidAddresses(prev => prev.filter((_,removeIdx) => removeIdx !== idx));
    setAddresses && setAddresses(prev => prev.filter((_,removeIdx) => removeIdx !== idx));
  }

  // ==================== RENDER ====================
  return (
    <>
      {origin === Origin.Administration && (
        <Combobox
          options={formattedResidents}
          value={watch("per_id") as string}
          onChange={(value) => {
            setValue("per_id", value);
            onComboboxChange && onComboboxChange();
          }}
          placeholder="Select a resident"
          emptyMessage={
            <div className="flex gap-2 justify-center items-center">
              <Label className="font-normal text-[13px]">No resident found.</Label>
              <Link to="/resident/form"
                state={{
                  params: {
                    origin: "create",
                    title: "Resident Registration",
                    description: "Provide the necessary details, and complete the registration.",
                  },
                }}
              >
                <Label className="font-normal text-[13px] text-teal cursor-pointer hover:underline">
                  Register
                </Label>
              </Link>
            </div>
          }
        />
      )}
      {/* Name Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormInput control={control} name="per_lname" label="Last Name" placeholder="Enter Last Name" readOnly={isReadOnly} />
        <FormInput control={control} name="per_fname" label="First Name" placeholder="Enter First Name" readOnly={isReadOnly} />
        <FormInput control={control} name="per_mname" label="Middle Name" placeholder="Enter Middle Name" readOnly={isReadOnly} />
        <FormInput control={control} name="per_suffix" label="Suffix" placeholder="Sfx." readOnly={isReadOnly} />
      </div>

      {/* Sex, Status, DOB, Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormSelect control={control} name="per_sex" label="Sex"  options={SEX_OPTIONS} readOnly={isReadOnly} />
        <FormDateTimeInput control={control} name="per_dob" label="Date of Birth" type="date" readOnly={isReadOnly} />
        <FormSelect control={control} name="per_status" label="Marital Status" options={MARITAL_STATUS_OPTIONS} readOnly={isReadOnly} />
        <FormInput control={control} name="per_contact" label="Contact" placeholder="Enter contact" readOnly={isReadOnly} type="number" />
      </div>

      {/* Education, Religion, Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <FormInput control={control} name="per_edAttainment" label="Educational Attainment" placeholder="Enter educational attainment" readOnly={isReadOnly} />
        <FormSelect control={control} name="per_religion" label="Religion" options={RELIGION_OPTIONS} readOnly={isReadOnly} />
      </div>
      <div className="grid grid-cols-1 gap-4">
        {
          addresses?.map((address, idx) => (
            <div className="grid gap-3" key={idx}>
              <Label className="text-black/70">Address {idx + 1}</Label>
              <div className="flex items-center gap-3">
                <div className="flex w-2/3 items-center justify-center border shadow-sm rounded-lg" >
                  <Input
                    placeholder="Province"
                    value={address.add_province}
                    onChange={(e) => handleSetAddress(idx, 'add_province', e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0"
                    readOnly={isReadOnly}
                  /> <p className="opacity-40">/</p>
                  <Input
                    placeholder="City"
                    value={address.add_city}
                    onChange={(e) => handleSetAddress(idx, 'add_city', e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0"
                    readOnly={isReadOnly}
                  /> <p className="opacity-40">/</p>
                  <Input
                    placeholder="Barangay"
                    value={address.add_barangay}
                    onChange={(e) => handleSetAddress(idx, 'add_barangay', e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0"
                    readOnly={isReadOnly}
                  /> <p className="opacity-40">/</p>

                  {address.add_barangay === "San Roque" ? ( !isReadOnly  ? 
                    (<SelectLayout
                      className="border-none w-full"
                      placeholder="Sitio"
                      options={formattedSitio}
                      value={address.sitio?.toLowerCase()}
                      onChange={(value) => handleSetAddress(idx, 'sitio', value)}
                      
                    />) : (
                      <Input 
                        className="border-none shadow-none focus-visible:ring-0" 
                        value={String(capitalize(address.sitio))} 
                        readOnly
                      />
                    )) : (<Input
                      placeholder="Sitio"
                      value={address.add_external_sitio}
                      onChange={(e) => handleSetAddress(idx, 'add_external_sitio', e.target.value)}
                      className="border-none shadow-none focus-visible:ring-0"
                      readOnly={isReadOnly}
                    />)
                  } 
                  
                  <p className="opacity-40">/</p>
                  <Input
                    placeholder="Street"
                    value={address.add_street}
                    onChange={(e) => handleSetAddress(idx, 'add_street', e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0"
                    readOnly={isReadOnly}
                  />
                </div>
                {idx + 1 > 1 && formType !== Type.Viewing &&
                  <Button 
                    type={"button"}
                    variant={"outline"} 
                    className="border-none shadow-none"
                    onClick={() => handleRemoveAddress(idx)}
                  >
                    <X className="cursor-pointer  text-red-500"/>
                  </Button>
                }
              </div>
              {
                validAddresses 
                && validAddresses.length > 0 
                && validAddresses[idx] === false
                && formType !== Type.Viewing && (
                  <Label className="text-red-500 text-sm">
                    Complete address is required
                  </Label>
                )
              }
            </div>
          ))
        }
        {!(formType === Type.Viewing) && <div>
          <Button 
            variant={"outline"} 
            type="button"
            className="border-none shadow-none text-black/50 hover:text-black/60"
            onClick={() => setAddresses && setAddresses((prev) => [
              ...prev, {
                add_province: '',
                add_city: '',
                add_barangay: '',
                sitio: '',
                add_external_sitio: '',
                add_street: ''
              }
            ])}
          >
            <Plus/> Add Address
          </Button>
        </div>}
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
        })}
      </div>
    </>
  );
} 

export default PersonalInfoForm;