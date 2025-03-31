/* 

  Note...

  This form is being utilized for creating, viewing, and updating resident records, and handles registration requests
  Additionally, it is being used for adminstrative position assignment or staff registration 

*/

import React from "react";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { addPersonal, addResidentProfile } from "../restful-api/profiingPostAPI";
import { updateProfile } from "../restful-api/profilingPutAPI";
import { CircleCheck, CircleAlert } from "lucide-react";
import { Type, Origin } from "../profilingEnums";
import { renderActionButton } from "./actionConfig";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Form } from "@/components/ui/form/form";
import { FormInput } from "@/components/ui/form/form-input";
import { FormSelect } from "@/components/ui/form/form-select";
import { FormDateInput } from "@/components/ui/form/form-date-input";
import { Combobox } from "@/components/ui/combobox";
import { formatResidents } from "../profilingFormats";
import { deleteRequest } from "../restful-api/profilingDeleteAPI";

export default function PersonalInfoForm({ params }: { params: any }) {

  
  // Initial states
  const navigate = useNavigate();
  const defaultValues = React.useRef(generateDefaultValues(personalInfoSchema));
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: defaultValues.current,
  });


  const [formType, setFormType] = React.useState<Type>(params.type);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);


  const formattedResidents = React.useMemo(() => {
    return formatResidents(params, false)
  }, [params.residents])


  // Performs side effects when formType changes
  React.useEffect(() => {

    if (formType === Type.Viewing || formType === Type.Request) {
      toast.dismiss();
      populateFields(params.data.per);
      form.clearErrors();
    }

    if (formType === Type.Editing) {
      setIsReadOnly(false)
    }
  }, [formType])


  // Handles combox selection
  const handleComboboxChange = React.useCallback(() => {
    const data = params.residents.find((resident: any) => 
      resident.rp_id === form.watch('per_id').split(" ")[0]
    )

    populateFields(data.per)
  }, [form.watch('per_id')])


  // For resident viewing, populate form fields with resident data
  const populateFields = React.useCallback((data: any) => {
    const resident = data;

    const fields = [
      { key: 'per_id', value: params.origin === Origin.Administration ? String(form.watch('per_id')) : String(resident?.per_id) || ''},
      { key: 'per_lname', value: resident?.per_lname},
      { key: 'per_fname', value: resident?.per_fname || ''},
      { key: 'per_mname', value: resident?.per_mname || ''},
      { key: 'per_suffix', value: resident?.per_suffix || ''},
      { key: 'per_sex', value: resident?.per_sex || ''},
      { key: 'per_dob', value: resident?.per_dob || ''},
      { key: 'per_status', value: resident?.per_status || ''},
      { key: 'per_address', value: resident?.per_address || ''},
      { key: 'per_religion', value: resident?.per_religion || ''},
      { key: 'per_edAttainment', value: resident?.per_edAttainment || ''},
      { key: 'per_contact', value: resident?.per_contact || ''},
    ];


    fields.forEach(({ key, value }) => {
      form.setValue(key as keyof z.infer<typeof personalInfoSchema>, value || '');
    });

    // Toggle read only
    if(resident) {
      setIsReadOnly(true)
    } else {
      setIsReadOnly(false)
    }

  }, [params.data || params.resident]);


  // For type edit, check if values are unchanged
  const checkDefaultValues = (values: any, params: any) => {
    
    // Optional fields
    const optionalFields = ['per_id', 'per_mname', 'per_suffix', 'per_edAttainment'];
    const keys = Object.keys(values);
    const isDefault = keys.every((key) => {
      if(optionalFields.includes(key)) {

        const isParamEmpty = !params[key] || params[key] === '';
        const isValueEmpty = !values[key] || values[key] === '';
      
        return (
          (isParamEmpty && isValueEmpty) || // Both empty
          (String(params[key]) === String(values[key])) // Both non-empty and equal
        );
      } else {
        return params[key] === values[key] ? true : false
      }
    });

    return isDefault;
  }


  // For type edit, save click feedback
  const handleEditSaved = (message: string, icon: React.ReactNode) => {
    setFormType(Type.Viewing);
    toast(message, {
      icon: icon
    });
  }


  // Handle form submission
  const submit = async () => {

    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    if(!formIsValid) {
      const errors = form.formState.errors;
      console.log("Validation Errors:", errors);
      setIsSubmitting(false);
      toast('Please fill out all required fields', {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      })
      return; 
    }

    try {
      // For editing resident personal info
      const values = form.getValues();
      
      if (formType === Type.Editing) {
        if(checkDefaultValues(values, params.data.per)) {
          handleEditSaved(
            'No changes made', 
            <CircleAlert size={24} className="fill-orange-500 stroke-white" />
          );      
          return
        }

        const res = await updateProfile(params.data.per.per_id, values);

        if(res) {
          params.data.per = values
          handleEditSaved(
            'Record updated successfully', 
            <CircleCheck size={24} className="fill-green-500 stroke-white" />
          );
        }
      } else {

        // For registration request
        const reqPersonalId = params.data?.per.per_id

        // Check if form type is request
        const personalId = params.type === Type.Request ? reqPersonalId : await addPersonal(values);
        const res= await addResidentProfile(personalId); 

        if(res) {
          toast('New record created successfully', {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            action: {
              label: 'View',
              onClick: () => navigate(-1)
            }
          });

          // Exit registration page after request has been approved
          if(params.type === Type.Request) {
            const res = await deleteRequest(params.data.req_id)
            if(res === 204){
              navigate(-1)
            }
          }

          // Reset the values of all fields in the form
          form.reset(defaultValues.current);
        }
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-0 h-auto p-4 md:p-10 rounded-lg overflow-auto">
      <div className="pb-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-xs text-black/50">Fill out all necessary fields</p>
      </div>

      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault();
          submit();
        }} className="flex flex-col gap-4">

          {params.origin === Origin.Administration && (
            <Combobox 
              options={formattedResidents}
              value={form.watch('per_id')}
              onChange={(value) => {
                form.setValue('per_id', value);
                handleComboboxChange();
              }}
              placeholder="Search for resident..."
              emptyMessage="No resident found"
            />
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput control={form.control} name="per_lname" label="Last Name" placeholder="Enter Last Name" readOnly={isReadOnly} />
            <FormInput control={form.control} name="per_fname" label="First Name" placeholder="Enter First Name" readOnly={isReadOnly} />
            <FormInput control={form.control} name="per_mname" label="Middle Name" placeholder="Enter Middle Name" readOnly={isReadOnly} />
            <FormInput control={form.control} name="per_suffix" label="Suffix" placeholder="Sfx." readOnly={isReadOnly} />
          </div>

          {/* Sex, Status, DOB, Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormSelect control={form.control} name="per_sex" label="Sex" options={[{ id: "female", name: "Female" }, { id: "male", name: "Male" }]} readOnly={isReadOnly} />
            <FormDateInput control={form.control} name="per_dob" label="Date of Birth" readOnly={isReadOnly} />
            <FormSelect control={form.control} name="per_status" label="Marital Status" options={[
              { id: "single", name: "Single" },
              { id: "married", name: "Married" },
              { id: "divorced", name: "Divorced" },
              { id: "widowed", name: "Widowed" },
            ]} readOnly={isReadOnly} />
            <FormInput control={form.control} name="per_address" label="Address" placeholder="Enter address" readOnly={isReadOnly} />
          </div>

          {/* Education, Religion, Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <FormInput control={form.control} name="per_edAttainment" label="Educational Attainment" placeholder="Enter educational attainment" readOnly={isReadOnly} />
            <FormInput control={form.control} name="per_religion" label="Religion" placeholder="Enter religion" readOnly={isReadOnly} />
            <FormInput control={form.control} name="per_contact" label="Contact" placeholder="Enter contact" readOnly={isReadOnly} type="number"/>
          </div>

          {/* Action Button */}
          <div className="mt-8 flex justify-end gap-3">
            {renderActionButton(
              form,
              isAssignmentOpen,
              formType,
              params.origin,
              isSubmitting,
              setIsAssignmentOpen,
              setFormType,
              submit
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
