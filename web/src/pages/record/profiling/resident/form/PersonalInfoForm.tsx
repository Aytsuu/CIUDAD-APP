import { Origin, Type } from "../../ProfilingEnums";
import { renderActionButton } from "../../ProfilingActionConfig";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateTimeInput } from "@/components/ui/form/form-date-time-input";
import React from "react";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button/button";
import { Plus, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SelectLayout } from "@/components/ui/select/select-layout";
import { Link } from "react-router";
import TooltipLayout from "@/components/ui/tooltip/tooltip-layout";

// ==================== TYPES ====================
type PersonalInfoFormProps = {
  prefix?: string
  formattedSitio?: any;
  formattedResidents?: any;
  addresses?: any[];
  validAddresses?: boolean[];
  form: any;
  formType: Type;
  isAssignmentOpen?: boolean;
  origin?: Origin;
  isSubmitting: boolean;
  isReadOnly: boolean;
  isAllowSubmit?: boolean;
  buttonIsVisible?: boolean;
  setAddresses?: React.Dispatch<React.SetStateAction<any[]>>;
  setValidAddresses?: React.Dispatch<React.SetStateAction<boolean[]>>;
  setIsAssignmentOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  setFormType?: React.Dispatch<React.SetStateAction<Type>>;
  submit: () => void;
  onComboboxChange?: () => void;  
};

// ==================== CONSTANTS ====================
const SEX_OPTIONS = [
  { id: "female", name: "FEMALE" },
  { id: "male", name: "MALE" },
];

const MARITAL_STATUS_OPTIONS = [
  { id: "single", name: "SINGLE" },
  { id: "married", name: "MARRIED" },
  { id: "divorced", name: "DIVORCED" },
  { id: "widowed", name: "WIDOWED" },
];

const RELIGION_OPTIONS = [
  { id: "roman catholic", name: "ROMAN CATHOLIC" },
  { id: "muslim", name: "MUSLIM" },
  { id: "iglesia ni cristo", name: "IGLESIA NI CRISTO" },
  { id: "born again", name: "BORN AGAIN" },
]

const EDUCATIONAL_ATTAINMENT = [
  { id: "elementary", name: "ELEMENTARY" },
  { id: "high school", name: "HIGH SCHOOL" },
  { id: "vocational / technical", name: "VOCATIONAL / TECHNICAL" },
  { id: "college level", name: "COLLEGE LEVEL" },
  { id: "bachelor's degree", name: "BACHELOR'S DEGREE" },
  { id: "master's degree", name: "MASTER'S DEGREE" },
  { id: "doctorate degree", name: "DOCTORATE DEGREE" }
];

const PWD_OPTIONS = [
  { id: "visual disability", name: "VISUAL DISABILITY" },
  { id: "hearing disability", name: "HEARING DISABILITY" },
  { id: "speech impairment", name: "SPEECH IMPAIRMENT" },
  { id: "learning disability", name: "LEARNING DISABILITY" },
  { id: "intellectual disability", name: "INTELLECTUAL DISABILITY" },
  { id: "mental disability", name: "MENTAL DISABILITY" },
  { id: "psychosocial disability", name: "PSYCHOSOCIAL DISABILITY" },
  { id: "physical disability", name: "PHYSICAL DISABILITY" },
  { id: "cancer", name: "CANCER" },
  { id: "rare disease", name: "RARE DISEASE" },
  { id: "multiple disabilities", name: "MULTIPLE DISABILITIES" }
];

// ==================== COMPONENT ====================
const PersonalInfoForm = ({
  prefix = "",
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
  buttonIsVisible = true,
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
          {...address, [field]: field !== "sitio" ? value.toUpperCase() : value} 
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
          value={watch(`${prefix}per_id` as any) as string}
          onChange={(value) => {
            setValue(`${prefix}per_id` as any, value);
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
        <FormInput control={control} name={`${prefix}per_lname`} label="Last Name" placeholder="Enter Last Name" readOnly={isReadOnly} upper={true}/>
        <FormInput control={control} name={`${prefix}per_fname`} label="First Name" placeholder="Enter First Name" readOnly={isReadOnly} upper={true}/>
        <FormInput control={control} name={`${prefix}per_mname`} label="Middle Name" placeholder="Enter Middle Name" readOnly={isReadOnly} upper={true}/>
        <FormInput control={control} name={`${prefix}per_suffix`} label="Suffix" placeholder="Sfx." readOnly={isReadOnly} upper={true}/>
      </div>

      {/* Sex, Status, DOB, Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FormSelect control={control} name={`${prefix}per_sex`} label="Sex" options={SEX_OPTIONS} readOnly={isReadOnly} />
        <FormDateTimeInput control={control} name={`${prefix}per_dob`} label="Date of Birth" type="date" readOnly={isReadOnly} />
        <FormSelect control={control} name={`${prefix}per_status`} label="Marital Status" options={MARITAL_STATUS_OPTIONS} readOnly={isReadOnly} />
        <FormInput control={control} name={`${prefix}per_contact`} label="Contact" placeholder="Enter contact" readOnly={isReadOnly} type="number" />
      </div>

      {/* Education, Religion, Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <FormSelect control={control} name={`${prefix}per_edAttainment`} label="Educational Attainment" readOnly={isReadOnly} options={EDUCATIONAL_ATTAINMENT}/>
        <FormSelect control={control} name={`${prefix}per_religion`} label="Religion" options={RELIGION_OPTIONS} readOnly={isReadOnly} />
        <FormSelect control={control} name={`${prefix}per_disability`} label="Disability (if applicable)" options={PWD_OPTIONS} readOnly={isReadOnly} />
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
                  <TooltipLayout
                    trigger={
                      <div className="w-full flex items-center"><Input
                        placeholder="Barangay"
                        value={address.add_barangay}
                        onChange={(e) => {
                          if(["san roque", "sanroque", "ciudad"].includes(e.target.value?.trim().toLowerCase())) {
                            handleSetAddress(idx, 'add_barangay', "San Roque (ciudad)")
                          } else {
                            handleSetAddress(idx, 'add_barangay', e.target.value)
                          }
                        }}
                        className="border-none shadow-none focus-visible:ring-0"
                        readOnly={isReadOnly}
                      /> <p className="opacity-40">/</p></div>
                    }
                    content={<div>
                      <p className="max-w-xs">
                        Tip: If you type <b>san roque</b>, <b>sanroque</b>, or <b>ciudad</b>, the system will automatically autocomplete it to <b>San Roque (ciudad)</b>.
                      </p>
                    </div>}
                  />

                  {address.add_barangay?.trim().toLowerCase() === "san roque (ciudad)" ? ( !isReadOnly  ? 
                    (<SelectLayout
                      className="border-none w-full"
                      placeholder="Sitio"
                      options={formattedSitio}
                      value={String(address.sitio)}
                      onChange={(value) => handleSetAddress(idx, 'sitio', value)}
                      
                    />) : (
                      <Input 
                        className="border-none shadow-none focus-visible:ring-0" 
                        value={address.sitio} 
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
                    className="border-none shadow-none text-red-500 hover:text-red-500"
                    onClick={() => handleRemoveAddress(idx)}
                  >
                    <X className="cursor-pointer  text-red-500"/>
                    Remove
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
        {(formType !== Type.Viewing) && 
          (!watch(`${prefix}per_id` as any) || watch(`${prefix}per_id` as any) == "undefined") &&
          <div>
            <Button 
              variant={"outline"} 
              type="button"
              className="border-none shadow-none text-black/50 hover:text-black/80"
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
          </div>
        }
      </div>

      <div className="mt-8 flex justify-end gap-3">
        {buttonIsVisible && renderActionButton({
          form,
          addresses,
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