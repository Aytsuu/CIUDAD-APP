import React from "react";
import { Input } from "@/components/ui/input";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { personal, registered } from "../restful-api/profiingPostAPI";
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

export default function PersonalInfoForm({ params }: { params: any }) {

  const navigate = useNavigate();
  const defaultValues = React.useRef(generateDefaultValues(personalInfoSchema));
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: defaultValues.current,
  });

  const [formType, setFormType] = React.useState<Type>(params.type);
  const [residentSearch, setResidentSearch] = React.useState<string>('');
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  React.useEffect(() => {

    if (formType === Type.Viewing) {
      toast.dismiss();
      setIsReadOnly(true)
      populateFields();
      form.clearErrors();
    }

    if (formType === Type.Editing) {
      setIsReadOnly(false)
    }
  }, [formType])

  // Populate form fields with resident data
  const populateFields = () => {
    const resident = params.data;

    const fields = [
      { key: 'per_id', value: resident?.per_id },
      { key: 'per_lname', value: resident?.per_lname },
      { key: 'per_fname', value: resident?.per_fname },
      { key: 'per_mname', value: resident?.per_mname },
      { key: 'per_suffix', value: resident?.per_suffix },
      { key: 'per_sex', value: resident?.per_sex },
      { key: 'per_dob', value: resident?.per_dob },
      { key: 'per_status', value: resident?.per_status },
      { key: 'per_address', value: resident?.per_address },
      { key: 'per_religion', value: resident?.per_religion },
      { key: 'per_edAttainment', value: resident?.per_edAttainment },
      { key: 'per_contact', value: resident?.per_contact },
    ];

    fields.forEach(({ key, value }) => {
      form.setValue(key as keyof z.infer<typeof personalInfoSchema>, value || '');
    });
  };

  const checkDefaultValues = (values: any, params: any) => {
    
    const keys = Object.keys(values);
    const isDefault = keys.every((key) => values[key] == params[key] || values[key] == '');

    return isDefault;
  }

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
      setIsSubmitting(false);
      toast('Please fill out all required fields', {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />
      })
      return; 
    }

    try {
      const values = form.getValues();

      if (formType === Type.Editing) {

        if(checkDefaultValues(values, params.data)) {

          handleEditSaved(
            'No changes made', 
            <CircleAlert size={24} className="fill-orange-500 stroke-white" />
          );      
  
          return
  
        }

        const res = await updateProfile(params.data.per_id, values);

        if(res) {
          params.data = values
          handleEditSaved(
            'Record updated successfully', 
            <CircleCheck size={24} className="fill-green-500 stroke-white" />
          );
        }

      } else {

        const res = await personal(values);
        await registered(res); 

        if(res) {
          toast('New record created successfully', {
            icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
            action: {
              label: 'View',
              onClick: () => navigate(-1)
            }
          });

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
      <div className="grid gap-4">
        {params.origin === Origin.Administration && (
          <div className="relative">
            <Input
              placeholder="Search resident #..."
              value={residentSearch}
              onChange={(e) => setResidentSearch(e.target.value)}
            />
            {isReadOnly && <CircleCheck size={24} className="absolute top-1/2 right-3 transform -translate-y-1/2 fill-green-500 stroke-white" />}
            {/* {isStaff && <CircleAlert size={24} className="absolute top-1/2 right-3 transform -translate-y-1/2 fill-red-500 stroke-white" />} */}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            submit();
          }} className="flex flex-col gap-4">
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
              <FormInput control={form.control} name="per_contact" label="Contact" placeholder="Enter contact" readOnly={isReadOnly} />
            </div>

            {/* Action Button */}
            <div className="mt-8 flex justify-end gap-3">
              {renderActionButton(
                form,
                isAssignmentOpen,
                formType,
                params.origin,
                isSubmitting,
                setResidentSearch,
                setIsAssignmentOpen,
                setFormType
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
