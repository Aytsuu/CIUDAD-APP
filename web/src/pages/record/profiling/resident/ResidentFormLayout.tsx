/* 

  Note...

  This form is being utilized for creating, viewing, and updating resident records
  Additionally, it is being used for adminstrative position assignment or staff registration 

*/
import React from "react";
import PersonalInfoForm from "./PersonalInfoForm";
import { z } from "zod";
import { Type, Origin } from "../profilingEnums";
import { Card } from "@/components/ui/card/card";
import { toast } from "sonner";
import { useLocation } from "react-router";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert } from "lucide-react";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { useForm } from "react-hook-form";
import { formatResidents } from "../profilingFormats";
import { Form } from "@/components/ui/form/form";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useAuth } from "@/context/AuthContext";
import { useAddPersonal, useAddResidentProfile } from "../queries/profilingAddQueries";
import { useUpdateProfile } from "../queries/profilingUpdateQueries";

export default function ResidentFormLayout() {

  // Get user information from useContext
  const { user } = React.useRef(useAuth()).current;

  // Initializing states
  const location = useLocation();
  const defaultValues = React.useRef(generateDefaultValues(personalInfoSchema)).current;
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues
  });
  const params = React.useMemo(() => {
    return location.state?.params || {};
  }, [location.state]);

  const [formType, setFormType] = React.useState<Type>(params.type);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [isReadOnly, setIsReadOnly] = React.useState<boolean>(false);
  const [isAssignmentOpen, setIsAssignmentOpen] =
    React.useState<boolean>(false);

  const formattedResidents = React.useMemo(() => {
    return formatResidents(params);
  }, [params.residents]);

  const { mutateAsync: addResidentProfile, isPending: isSubmittingProfile } = useAddResidentProfile(params);
  const { mutateAsync: addPersonal } = useAddPersonal(form.getValues());
  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } = useUpdateProfile(form.getValues(), setFormType);

  React.useEffect(() => {
    setIsSubmitting(isSubmittingProfile || isUpdatingProfile);
  }, [isSubmittingProfile, isUpdatingProfile]) 

  // Performs side effects when formType changes
  React.useEffect(() => {
    if (formType === Type.Viewing || formType === Type.Request) {
      populateFields(params.data.per);
      form.clearErrors();
    }

    if (formType === Type.Editing) {
      setIsReadOnly(false);
    }
  }, [formType]);

  // Handles combox selection
  const handleComboboxChange = React.useCallback(() => {
    const data = params.residents.find(
      (resident: any) => resident.rp_id === form.watch("per_id").split(" ")[0]
    );

    populateFields(data?.per);
  }, [form.watch("per_id")]);

  // For resident|request viewing, populate form fields with data
  const populateFields = React.useCallback(
    (data: any) => {
      const resident = data;
      const fields = [
        {
          key: "per_id",
          value:
            params.origin === Origin.Administration
              ? String(form.watch("per_id"))
              : String(resident?.per_id) || "",
        },
        { key: "per_lname", value: resident?.per_lname },
        { key: "per_fname", value: resident?.per_fname || "" },
        { key: "per_mname", value: resident?.per_mname || "" },
        { key: "per_suffix", value: resident?.per_suffix || "" },
        { key: "per_sex", value: resident?.per_sex || "" },
        { key: "per_dob", value: resident?.per_dob || "" },
        { key: "per_status", value: resident?.per_status || "" },
        { key: "per_address", value: resident?.per_address || "" },
        { key: "per_religion", value: resident?.per_religion || "" },
        { key: "per_edAttainment", value: resident?.per_edAttainment || "" },
        { key: "per_contact", value: resident?.per_contact || "" },
      ];

      fields.map((f: any) => {
        form.setValue(f.key , f.value);
      });

      // Toggle read only
      if (resident) setIsReadOnly(true); 
      else setIsReadOnly(false);
    },
    [params.data || params.resident]
  );

  // For type edit, check if values are unchanged
  const checkDefaultValues = (values: any, params: any) => {
    // Optional fields
    const optionalFields = [
      "per_id",
      "per_mname",
      "per_suffix",
      "per_edAttainment",
    ];
    const keys = Object.keys(values);
    const isDefault = keys.every((key) => {
      if (optionalFields.includes(key)) {
        const isParamEmpty = !params[key] || params[key] === "";
        const isValueEmpty = !values[key] || values[key] === "";

        return (
          (isParamEmpty && isValueEmpty) || // Both empty
          String(params[key]) === String(values[key]) // Both non-empty and equal
        );
      } else {
        return params[key] === values[key] ? true : false;
      }
    });

    return isDefault;
  };

  // Handle form submission
  const submit = async () => {
    setIsSubmitting(true);

    const formIsValid = await form.trigger();

    if (!formIsValid) {
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }

    // For editing resident personal info
    const values = form.getValues();

    if (formType === Type.Editing) {
      setIsSubmitting(false);
      if (checkDefaultValues(values, params.data.per)) {
        toast("No changes made", {
          icon: <CircleAlert size={24} className="fill-orange-500 stroke-white" />
        });
        return;
      }

      const personalId = params.data.per.per_id
      await updateProfile({ personalId: personalId });
      params.data.per = values;

    } else {
      // For registration request
      const reqPersonalId = params.data?.per.per_id;

      // Check if form type is request
      const personalId =
        params.type === Type.Request
          ? reqPersonalId
          : await addPersonal();

      await addResidentProfile({
        personalId: personalId, 
        staffId: user?.staff.staff_id
      });

      // Reset the values of all fields in the form
      form.reset(defaultValues.current);
    }
  };

  return (
    <LayoutWithBack title={params.title} description={params.description}>
      <Card className="w-full p-10">
        <div className="pb-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-xs text-black/50">Fill out all necessary fields</p>
        </div>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex flex-col gap-4"
          >
            <PersonalInfoForm
              formattedResidents={formattedResidents}
              form={form}
              formType={formType}
              isAssignmentOpen={isAssignmentOpen}
              origin={params.origin}
              isSubmitting={isSubmitting}
              isReadOnly={isReadOnly}
              setIsAssignmentOpen={setIsAssignmentOpen}
              setFormType={setFormType}
              submit={submit}
              handleComboboxChange={handleComboboxChange}
            />
          </form>
        </Form>
      </Card>
    </LayoutWithBack>
  );
}
