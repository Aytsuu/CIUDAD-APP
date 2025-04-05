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
import { useLocation, useNavigate } from "react-router";
import { LayoutWithBack } from "@/components/ui/layout/layout-with-back";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, CircleAlert } from "lucide-react";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { useForm } from "react-hook-form";
import { formatResidents } from "../profilingFormats";
import { Form } from "@/components/ui/form/form";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { updateProfile } from "../restful-api/profilingPutAPI";
import { deleteRequest } from "../restful-api/profilingDeleteAPI";
import { addPersonal, addResidentProfile } from "../restful-api/profiingPostAPI";
import { useAuth } from "@/context/AuthContext";

export default function ResidentFormLayout() {

  // Get user information from useContext
  const { user } = React.useRef(useAuth()).current;

  // Initializing states
  const location = useLocation();
  const navigate = useNavigate();
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
    return formatResidents(params, false);
  }, [params.residents]);

  // Performs side effects when formType changes
  React.useEffect(() => {
    if (formType === Type.Viewing || formType === Type.Request) {
      toast.dismiss();
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

    populateFields(data.per);
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

      fields.forEach(({ key, value }) => {
        form.setValue(
          key as keyof z.infer<typeof personalInfoSchema>,
          value || ""
        );
      });

      // Toggle read only
      if (resident) {
        setIsReadOnly(true);
      } else {
        setIsReadOnly(false);
      }
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

  // For type edit, save click feedback
  const handleEditSaved = (message: string, icon: React.ReactNode) => {
    setFormType(Type.Viewing);
    toast(message, {
      icon: icon,
    });
  };

  // Handle form submission
  const submit = async () => {
    setIsSubmitting(true);
    const formIsValid = await form.trigger();

    if (!formIsValid) {
      const errors = form.formState.errors;
      console.log("Validation Errors:", errors);
      setIsSubmitting(false);
      toast("Please fill out all required fields", {
        icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
      });
      return;
    }

    // For editing resident personal info
    const values = form.getValues();

    if (formType === Type.Editing) {
      if (checkDefaultValues(values, params.data.per)) {
        handleEditSaved(
          "No changes made",
          <CircleAlert size={24} className="fill-orange-500 stroke-white" />
        );
        return;
      }

      const res = await updateProfile(params.data.per.per_id, values);

      if (res) {
        params.data.per = values;
        handleEditSaved(
          "Record updated successfully",
          <CircleCheck size={24} className="fill-green-500 stroke-white" />
        );
      }
    } else {
      // For registration request
      const reqPersonalId = params.data?.per.per_id;

      // Check if form type is request
      const personalId =
        params.type === Type.Request
          ? reqPersonalId
          : await addPersonal(values);
      const res = await addResidentProfile(personalId, user?.staff.staff_id);

      if (res) {
        setIsSubmitting(false);
        toast("New record created successfully", {
          icon: (
            <CircleCheck size={24} className="fill-green-500 stroke-white" />
          ),
          action: {
            label: "View",
            onClick: () => navigate(-1),
          },
        });

        // Exit registration page after request has been approved
        if (params.type === Type.Request) {
          const res = await deleteRequest(params.data.req_id);
          if (res === 204) {
            navigate(-1);
          }
        }

        // Reset the values of all fields in the form
        navigate('/account/create')
        form.reset(defaultValues.current);
      }
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
