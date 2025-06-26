import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { personalInfoSchema } from "@/form-schema/profiling-schema";
import { generateDefaultValues } from "@/helpers/generateDefaultValues";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { CircleAlert, CircleCheck } from "lucide-react";
import { Origin } from "../../profilingEnums";

export const useResidentForm = (defaultData?: any, origin?: any) => {
  const navigate = useNavigate();
  const defaultValues = generateDefaultValues(personalInfoSchema);
  const form = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues,
  });

  React.useEffect(() => {
    populateFields(defaultData);
  }, [defaultData])

  const populateFields = React.useCallback((values: Record<string, any>) => {
    const resident = values;
    const fields = [
      { key: "per_id",
        value:
          origin === Origin.Administration
            ? String(form.watch("per_id"))
            : String(resident?.per_id) || "",
      },
      { key: "per_lname", value: resident?.per_lname || ""},
      { key: "per_fname", value: resident?.per_fname || "" },
      { key: "per_mname", value: resident?.per_mname || "" },
      { key: "per_suffix", value: resident?.per_suffix || "" },
      { key: "per_sex", value: resident?.per_sex || "" },
      { key: "per_dob", value: resident?.per_dob || "" },
      { key: "per_status", value: resident?.per_status || "" },
      { key: "per_religion", value: resident?.per_religion || "" },
      { key: "per_edAttainment", value: resident?.per_edAttainment || "" },
      { key: "per_contact", value: resident?.per_contact || "" },
    ];

    fields.map((f: any) => {
      form.setValue(f.key , f.value);
    });

  },[defaultData]);

  const checkDefaultValues = (currentValues: any, initialValues: any) => {
    // Optional fields
    const optionalFields = [
      "per_id",
      "per_mname",
      "per_suffix",
      "per_edAttainment",
    ];
    const keys = Object.keys(currentValues);
    const isDefault = keys.every((key) => {
      if (optionalFields.includes(key)) {
        const isParamEmpty = !initialValues[key] || initialValues[key] === "";
        const isValueEmpty = !currentValues[key] || currentValues[key] === "";

        return (
          (isParamEmpty && isValueEmpty) || // Both empty
          String(initialValues[key]) == String(currentValues[key]) // Both non-empty and equal
        );
      } else {
        return String(initialValues[key]) == String(currentValues[key]) ? true : false;
      }
    });
    return isDefault;
  };

  const handleSubmitSuccess = (message: string, redirectPath?: string, state?: any) => {
    toast(message, {
      icon: <CircleCheck size={24} className="fill-green-500 stroke-white" />,
    });
    if (redirectPath) navigate(redirectPath, {state: state});
  };

  const handleSubmitError = (message: string) => {
    toast(message, {
      icon: <CircleAlert size={24} className="fill-red-500 stroke-white" />,
    });
  };

  return {
    form,
    defaultValues,
    checkDefaultValues,
    handleSubmitSuccess,
    handleSubmitError,
    populateFields
  };
};